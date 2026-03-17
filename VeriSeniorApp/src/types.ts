// src/types.ts
export type VerificationStatus = 'True' | 'False' | 'Caution';

export interface VerificationItem {
  id: string;
  status: VerificationStatus;
  headline: string;
  source: string; // e.g., 'WhatsApp', 'Facebook'
  timeAgo: string; // e.g., '2 小時前'
}
