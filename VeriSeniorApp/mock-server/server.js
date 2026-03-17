/**
 * Mock Backend - VeriSenior
 * Run with: node mock-server/server.js
 * API: GET http://localhost:3001/api/verifications
 */
const http = require('http');

const MOCK_VERIFICATIONS = [
  { id: '1', status: 'False', headline: '突破性發現：每日喝八杯熱水，癌症遠離你', source: 'WhatsApp', timeAgo: '2 小時前' },
  { id: '2', status: 'True', headline: '政府宣佈：本月起，老年年金將調漲 5%', source: 'Facebook', timeAgo: '5 小時前' },
  { id: '3', status: 'False', headline: '免費領取最新 iPhone 15 Pro！只需將此訊息轉發給 10 人...', source: 'Douyin', timeAgo: '昨天' },
  { id: '4', status: 'Caution', headline: '新變種病毒 Omicron 正在傳播 - 衛生官員籲保持警戒', source: 'Facebook', timeAgo: '昨天' },
];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.url === '/api/verifications' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(MOCK_VERIFICATIONS));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3001, () => {
  console.log('Mock backend running at http://localhost:3001');
  console.log('GET /api/verifications - returns mock verification data');
});
