export type CaseStatus = 'OPEN' | 'ACTIVE' | 'ESCALATED' | 'CLOSED';

export type CaseCategory =
  | 'INFESTATION'
  | 'LANDLORD_NEGligence'
  | 'HARASSMENT'
  | 'WORKPLACE'
  | 'SAFETY'
  | 'OTHER';

export interface Case {
  id: string;
  title: string;
  description: string;
  category: CaseCategory;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  status: CaseStatus;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  ownerUserId: string;
}

export type EvidenceType =
  | 'PHOTO'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'AUDIO'
  | 'NOTE';

export interface EvidenceItem {
  id: string;
  caseId: string;
  type: EvidenceType;
  fileUrl?: string;
  thumbnailUrl?: string;
  description: string;
  tags: string[];
  createdAt: string;
  capturedAt?: string;
  location?: string;
  source: 'USER' | 'SYSTEM' | 'THIRD_PARTY';
}

export interface InteractionLog {
  id: string;
  caseId: string;
  party: 'LANDLORD' | 'EMPLOYER' | 'AGENCY' | 'OTHER';
  channel: 'EMAIL' | 'TEXT' | 'CALL' | 'IN_PERSON' | 'LETTER';
  direction: 'OUTBOUND' | 'INBOUND';
  summary: string;
  timestamp: string;
  responseReceived: boolean;
}

export interface HealthImpactLog {
  id: string;
  caseId: string;
  date: string; // YYYY-MM-DD
  physicalSymptoms: string;
  mentalImpact: string;
  sleepImpact: 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';
}

export interface ExpenseLog {
  id: string;
  caseId: string;
  date: string;
  amount: number;
  currency: string;
  category: 'MEDICAL' | 'CLEANING' | 'REPLACEMENT' | 'LEGAL' | 'OTHER';
  description: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string;
  type:
    | 'FIRST_SIGNS'
    | 'REPORT_SENT'
    | 'RESPONSE_RECEIVED'
    | 'INSPECTION'
    | 'TREATMENT'
    | 'INCIDENT'
    | 'LEGAL_NOTICE'
    | 'OTHER';
  title: string;
  description: string;
}
