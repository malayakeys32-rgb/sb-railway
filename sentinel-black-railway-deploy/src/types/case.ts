export type CaseStatus = 'OPEN' | 'ACTIVE' | 'ESCALATED' | 'CLOSED';
export type CaseCategory =
  | 'INFESTATION'
  | 'LANDLORD_NEGLIGENCE'
  | 'HARASSMENT'
  | 'WORKPLACE'
  | 'SAFETY'
  | 'OTHER';
export type CaseSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Case {
  id: string;
  title: string;
  description: string;
  category: CaseCategory;
  createdAt: string;
  updatedAt: string;
  status: CaseStatus;
  severity: CaseSeverity;
  location: string;
  ownerUserId: string;
}

export interface CreateCaseInput {
  title: string;
  description: string;
  category: CaseCategory;
  location: string;
  severity?: CaseSeverity;
  status?: CaseStatus;
}

export interface UpdateCaseInput {
  title?: string;
  description?: string;
  category?: CaseCategory;
  status?: CaseStatus;
  severity?: CaseSeverity;
  location?: string;
}

export interface CaseQueryFilters {
  status?: CaseStatus;
  category?: CaseCategory;
  severity?: CaseSeverity;
  location?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface CaseResponse {
  id: string;
  title: string;
  description: string;
  category: CaseCategory;
  createdAt: Date;
  updatedAt: Date;
  status: CaseStatus;
  severity: CaseSeverity;
  location: string;
  ownerUserId: string;
}

