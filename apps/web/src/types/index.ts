export type UserRole = 'EXEC' | 'MANAGER' | 'SELLER';

export type SignalType = 
  | 'LINKEDIN_POST'
  | 'LINKEDIN_ENGAGEMENT'
  | 'LINKEDIN_PROFILE_UPDATE'
  | 'MEDIA_MENTION'
  | 'PRESS_OPPORTUNITY'
  | 'INDUSTRY_NEWS';

export type SignalStrength = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export type ActionType = 
  | 'OUTREACH'
  | 'FOLLOW_UP'
  | 'CONTENT_SHARE'
  | 'MEETING_REQUEST'
  | 'PRESS_RELEASE'
  | 'AUTHORITY_LEVERAGE';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export type PressTemplateType = 'PRODUCT_LAUNCH' | 'PARTNERSHIP' | 'THOUGHT_LEADERSHIP';

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatarUrl?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  linkedinUrl?: string;
  description?: string;
  logoUrl?: string;
  employeeCount?: number;
  revenue?: string;
  priority: number;
  signalScore: number;
  lastSignalAt?: string;
  organizationId: string;
  assignedToId?: string;
  assignedTo?: User;
  decisors?: Decisor[];
  signals?: Signal[];
  _count?: {
    signals: number;
    actions: number;
    decisors: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Decisor {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  influence: number;
  engagementScore: number;
  lastActivityAt?: string;
  notes?: string;
  accountId: string;
  account?: Account;
  signals?: Signal[];
  _count?: {
    signals: number;
    actions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Signal {
  id: string;
  type: SignalType;
  strength: SignalStrength;
  title: string;
  content?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  score: number;
  processedAt?: string;
  accountId?: string;
  decisorId?: string;
  account?: Account;
  decisor?: Decisor;
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  id: string;
  type: ActionType;
  status: ActionStatus;
  title: string;
  description?: string;
  suggestedMessage?: string;
  checklist?: { item: string; completed: boolean }[];
  priority: number;
  dueDate?: string;
  completedAt?: string;
  accountId?: string;
  decisorId?: string;
  signalId?: string;
  assignedToId?: string;
  authorityContentId?: string;
  account?: Account;
  decisor?: Decisor;
  signal?: Signal;
  assignedTo?: User;
  authorityContent?: AuthorityContent;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorityContent {
  id: string;
  title: string;
  content: string;
  summary?: string;
  topics: string[];
  sourceUrl?: string;
  publishedAt?: string;
  engagementCount: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PressRelease {
  id: string;
  title: string;
  content: string;
  templateType: PressTemplateType;
  status: string;
  signalContext?: Record<string, unknown>;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  accountCount: number;
  userCount: number;
  signalCount: number;
  actionCount: number;
}
