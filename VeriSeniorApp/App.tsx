import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Mic, Shield, ChevronRight, Home, Library, BookOpen, X, Camera } from 'lucide-react-native';
import { VerificationItem, VerificationStatus } from './src/types';
import { colors } from './src/theme';
import { mockVerifyContent, generateId } from './src/utils/mockVerification';

const formatMeta = (platform: string, date: string) => {
  const platformKey = platform.toUpperCase().replace(/\s/g, '');
  const timeMap: Record<string, string> = {
    '2 小時前': '2H AGO',
    '5 小時前': '5H AGO',
    '昨天': '1D AGO',
    '剛剛': 'JUST NOW',
  };
  const time = timeMap[date] || date.toUpperCase();
  return `${platformKey} · ${time}`;
};

const statusAccentColor: Record<VerificationStatus, string> = {
  True: colors.sage,
  False: colors.brick,
  Caution: colors.ochre,
};

const VerificationCard: React.FC<{ item: VerificationItem }> = ({ item }) => {
  const accent = statusAccentColor[item.status];
  const meta = formatMeta(item.source, item.timeAgo);

  return (
    <View style={[styles.card, { borderLeftColor: accent, borderLeftWidth: 4 }]}>
      <View style={styles.cardContent}>
        <Text style={styles.headline} numberOfLines={2}>
          {item.headline}
        </Text>
        <Text style={styles.meta}>{meta}</Text>
      </View>
      <ChevronRight size={20} color={colors.slate} strokeWidth={2} />
    </View>
  );
};

const MOCK_VERIFICATIONS: VerificationItem[] = [
  {
    id: '1',
    status: 'False',
    headline: '突破性發現：每日喝八杯熱水，癌症遠離你',
    source: 'WhatsApp',
    timeAgo: '2 小時前',
  },
  {
    id: '2',
    status: 'True',
    headline: '政府宣佈：本月起，老年年金將調漲 5%',
    source: 'Facebook',
    timeAgo: '5 小時前',
  },
  {
    id: '3',
    status: 'False',
    headline: '免費領取最新 iPhone 15 Pro！只需將此訊息轉發給 10 人...',
    source: 'Douyin',
    timeAgo: '昨天',
  },
  {
    id: '4',
    status: 'Caution',
    headline: '新變種病毒 Omicron 正在傳播 - 衛生官員籲保持警戒',
    source: 'Facebook',
    timeAgo: '昨天',
  },
];

const summaryChips = [
  { label: '總查核數', value: '42' },
  { label: '今日安全', value: '12' },
  { label: '已阻擋詐騙', value: '5' },
];

const navItems = [
  { name: 'Home', label: '主頁', Icon: Home },
  { name: 'Library', label: '查核庫', Icon: Library },
  { name: 'Tutorial', label: '使用教程', Icon: BookOpen },
];

export default function App() {
  const [verifications, setVerifications] = useState<VerificationItem[]>(MOCK_VERIFICATIONS);
  const [activeTab, setActiveTab] = useState('Home');
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState('');
  const [resultModal, setResultModal] = useState<{
    snippet: string;
    status: VerificationStatus;
    simpleExplanation: string;
  } | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const addVerification = (item: VerificationItem) => {
    setVerifications((prev) => [item, ...prev]);
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('需要相機權限才能拍攝照片');
      return;
    }
    setShowModal(false);
    setIsProcessing(true);
    setProcessingLabel('正在分析圖片...');

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) {
        setIsProcessing(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 1500));
      const id = generateId();
      const snippet = '已分析圖片內容（圖片文字辨識）';
      const { status: verifyStatus, simpleExplanation } = mockVerifyContent('圖片查核');
      const item: VerificationItem = {
        id,
        status: verifyStatus,
        headline: snippet,
        source: '相機',
        timeAgo: '剛剛',
      };
      addVerification(item);
      setResultModal({ snippet, status: verifyStatus, simpleExplanation });
    } catch (err) {
      alert('拍攝失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('需要麥克風權限才能錄音');
      return;
    }
    setShowModal(false);
    setIsProcessing(true);
    setProcessingLabel('錄音中... 請說話');

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;

      await new Promise((r) => setTimeout(r, 3000));
      await recording.stopAndUnloadAsync();
      recordingRef.current = null;

      setProcessingLabel('正在分析語音...');
      await new Promise((r) => setTimeout(r, 1000));

      const id = generateId();
      const snippet = '已分析語音輸入內容';
      const { status: verifyStatus, simpleExplanation } = mockVerifyContent('語音查核');
      const item: VerificationItem = {
        id,
        status: verifyStatus,
        headline: snippet,
        source: '語音輸入',
        timeAgo: '剛剛',
      };
      addVerification(item);
      setResultModal({ snippet, status: verifyStatus, simpleExplanation });
    } catch (err) {
      alert('錄音失敗，請重試');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    if (!isProcessing) {
      setShowModal(false);
      recordingRef.current?.stopAndUnloadAsync();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Dashboard Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>VS</Text>
          </View>
          <View>
            <Text style={styles.title}>VeriSenior</Text>
            <Text style={styles.subtitle}>驗證儀表板</Text>
          </View>
        </View>
        <View style={styles.trustScore}>
          <Shield size={20} color={colors.sage} strokeWidth={2} />
          <View>
            <Text style={styles.trustLabel}>信任指數</Text>
            <Text style={styles.trustValue}>良好</Text>
          </View>
        </View>
      </View>

      {/* Safety Summary Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsScroll}
      >
        {summaryChips.map((chip) => (
          <View key={chip.label} style={styles.chip}>
            <Text style={styles.chipLabel}>{chip.label}</Text>
            <Text style={styles.chipValue}>{chip.value}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>最近查核記錄</Text>

      {/* Case Reports */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {verifications.map((item) => (
          <VerificationCard key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* CTA - 啟動 AI 查核 */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.9}
        >
          <Mic size={20} color={colors.klein} strokeWidth={2} />
          <Text style={styles.ctaText}>啟動 AI 查核</Text>
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeModal}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>啟動 AI 查核</Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
                <X size={22} color={colors.slate} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              在社群媒體上輸入 @VeriSenior 即可即時查核。或拍攝貼文照片，我們將為您分析。
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Camera size={24} color={colors.navy} strokeWidth={2} />
                <Text style={styles.photoButtonText}>拍攝照片</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceInput}>
                <Mic size={24} color="#FFF" strokeWidth={2} />
                <Text style={styles.voiceButtonText}>語音輸入</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.klein} />
          <Text style={styles.processingText}>{processingLabel}</Text>
        </View>
      )}

      {/* Result Modal */}
      <Modal visible={!!resultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {resultModal && (
            <View style={styles.resultModal}>
              <Text style={styles.resultTitle}>查核結果</Text>
              <View style={[styles.resultStatus, { borderLeftColor: statusAccentColor[resultModal.status], borderLeftWidth: 4 }]}>
                <Text style={styles.resultStatusText}>
                  {resultModal.status === 'True' ? '真實' : resultModal.status === 'False' ? '不實' : '注意'}
                </Text>
              </View>
              <Text style={styles.resultSnippet}>{resultModal.snippet}</Text>
              <Text style={styles.resultExplanation}>{resultModal.simpleExplanation}</Text>
              <TouchableOpacity
                style={styles.resultCloseButton}
                onPress={() => setResultModal(null)}
              >
                <Text style={styles.resultCloseText}>確定</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navItems.map(({ name, label, Icon }) => (
          <TouchableOpacity
            key={name}
            style={styles.navTab}
            onPress={() => setActiveTab(name)}
            activeOpacity={0.7}
          >
            <Icon
              size={24}
              color={activeTab === name ? colors.klein : colors.slate}
              strokeWidth={activeTab === name ? 2.5 : 2}
            />
            <Text
              style={[
                styles.navText,
                activeTab === name ? styles.navTextActive : styles.navTextInactive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
  },
  subtitle: {
    fontSize: 11,
    color: colors.slate,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  trustScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  trustLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slate,
    letterSpacing: 0.5,
  },
  trustValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
  },
  chipsScroll: {
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.slate,
    letterSpacing: 0.5,
  },
  chipValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate,
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 26,
  },
  meta: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate,
    letterSpacing: 0.5,
    marginTop: 8,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 96,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 0.5,
    borderColor: 'rgba(226,232,240,0.8)',
    shadowColor: colors.klein,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.klein,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
    position: 'relative',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
  },
  modalClose: {
    padding: 8,
  },
  modalDesc: {
    fontSize: 16,
    color: colors.slate,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
  },
  voiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.klein,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
  },
  resultModal: {
    marginHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 16,
  },
  resultStatus: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultStatusText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
  },
  resultSnippet: {
    fontSize: 16,
    color: colors.navy,
    marginBottom: 12,
    lineHeight: 24,
  },
  resultExplanation: {
    fontSize: 15,
    color: colors.slate,
    lineHeight: 22,
    marginBottom: 24,
  },
  resultCloseButton: {
    backgroundColor: colors.klein,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
  navTextActive: {
    fontWeight: '600',
    color: colors.klein,
  },
  navTextInactive: {
    color: colors.slate,
  },
});
