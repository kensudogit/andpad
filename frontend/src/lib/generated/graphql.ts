import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AnalyticsBoard = {
  __typename?: 'AnalyticsBoard';
  completionsByCategory: Array<CategoryMetric>;
  kpis: Array<AnalyticsKpi>;
  learnerEngagementScore: Scalars['Float']['output'];
  periodDays: Scalars['Int']['output'];
  topVideos: Array<VideoMetric>;
  watchHoursByWeek: Array<Scalars['Float']['output']>;
};

export type AnalyticsInsight = {
  __typename?: 'AnalyticsInsight';
  generatedAt: Scalars['String']['output'];
  recommendations: Array<Scalars['String']['output']>;
  risks: Array<Scalars['String']['output']>;
  strengths: Array<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
};

export type AnalyticsKpi = {
  __typename?: 'AnalyticsKpi';
  label: Scalars['String']['output'];
  trendPct: Maybe<Scalars['Float']['output']>;
  unit: Maybe<Scalars['String']['output']>;
  value: Scalars['Float']['output'];
};

export type AndpadAnalyticsDashboard = {
  __typename?: 'AndpadAnalyticsDashboard';
  activeProjects: Scalars['Int']['output'];
  billingTotal: Scalars['Float']['output'];
  budgetTotal: Scalars['Float']['output'];
  budgetVariancePct: Scalars['Float']['output'];
  costByMonth: Array<MonthlyCostMetric>;
  costTotal: Scalars['Float']['output'];
  generatedAt: Scalars['String']['output'];
  kpis: Array<AndpadAnalyticsKpi>;
  moduleUsage: Array<ModuleUsageMetric>;
  periodDays: Scalars['Int']['output'];
  projectHealthScore: Scalars['Float']['output'];
  projectsByStatus: Array<ProjectStatusCount>;
  recordsByWeek: Array<Scalars['Float']['output']>;
};

export type AndpadAnalyticsKpi = {
  __typename?: 'AndpadAnalyticsKpi';
  label: Scalars['String']['output'];
  trendPct: Maybe<Scalars['Float']['output']>;
  unit: Maybe<Scalars['String']['output']>;
  value: Scalars['Float']['output'];
};

export type ApiIntegration = {
  __typename?: 'ApiIntegration';
  apiKeyHint: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  endpointUrl: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastSyncAt: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type AttendanceRecord = {
  __typename?: 'AttendanceRecord';
  clockIn: Scalars['String']['output'];
  clockOut: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  note: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
  userName: Scalars['String']['output'];
};

export type BillingReconciliationItem = {
  __typename?: 'BillingReconciliationItem';
  billingAmount: Scalars['Float']['output'];
  billingDate: Maybe<Scalars['String']['output']>;
  billingRecordId: Scalars['ID']['output'];
  costAmount: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  varianceAmount: Scalars['Float']['output'];
};

export type BimModel = {
  __typename?: 'BimModel';
  createdAt: Scalars['String']['output'];
  fileSizeMb: Maybe<Scalars['Float']['output']>;
  format: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  projectId: Scalars['ID']['output'];
  projectName: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
  uploadedBy: Scalars['String']['output'];
  viewerUrl: Scalars['String']['output'];
};

export type Bookmark = {
  __typename?: 'Bookmark';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  videoId: Scalars['ID']['output'];
};

export type BudgetCategorySummary = {
  __typename?: 'BudgetCategorySummary';
  actualAmount: Scalars['Float']['output'];
  budgetAmount: Scalars['Float']['output'];
  categoryCode: Scalars['String']['output'];
  categoryName: Scalars['String']['output'];
  varianceAmount: Scalars['Float']['output'];
};

export type BudgetDashboard = {
  __typename?: 'BudgetDashboard';
  billingBalance: Scalars['Float']['output'];
  billingTotal: Scalars['Float']['output'];
  categorySummary: Array<BudgetCategorySummary>;
  completionPct: Scalars['Float']['output'];
  contractAmount: Scalars['Float']['output'];
  estimateBudgetTotal: Scalars['Float']['output'];
  generatedAt: Scalars['String']['output'];
  grossMarginPct: Scalars['Float']['output'];
  inquiryProfitTotal: Scalars['Float']['output'];
  lineItems: Array<BudgetLineItem>;
  monthlyCosts: Array<MonthlyCostMetric>;
  projectId: Scalars['ID']['output'];
  projectName: Scalars['String']['output'];
  recentCosts: Array<CostEntry>;
  reconciliation: Array<BillingReconciliationItem>;
  totalActual: Scalars['Float']['output'];
  totalBudget: Scalars['Float']['output'];
  totalCommitted: Scalars['Float']['output'];
  totalEstimate: Scalars['Float']['output'];
  totalForecast: Scalars['Float']['output'];
  varianceAmount: Scalars['Float']['output'];
  variancePct: Scalars['Float']['output'];
};

export type BudgetLineItem = {
  __typename?: 'BudgetLineItem';
  actualAmount: Scalars['Float']['output'];
  budgetAmount: Scalars['Float']['output'];
  budgetId: Scalars['ID']['output'];
  categoryCode: Scalars['String']['output'];
  categoryName: Scalars['String']['output'];
  committedAmount: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  estimateAmount: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  sortOrder: Scalars['Int']['output'];
  varianceAmount: Scalars['Float']['output'];
  variancePct: Scalars['Float']['output'];
  wbsCode: Scalars['String']['output'];
};

export enum BudgetStatus {
  Approved = 'APPROVED',
  Draft = 'DRAFT',
  Locked = 'LOCKED'
}

export enum BudgetType {
  Estimate = 'ESTIMATE',
  ExecutionBudget = 'EXECUTION_BUDGET',
  Forecast = 'FORECAST'
}

export type CategoryMetric = {
  __typename?: 'CategoryMetric';
  category: VideoCategory;
  count: Scalars['Int']['output'];
};

export type Certificate = {
  __typename?: 'Certificate';
  id: Scalars['ID']['output'];
  issuedAt: Scalars['String']['output'];
  learnerId: Scalars['ID']['output'];
  pathId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type ConstructionProject = {
  __typename?: 'ConstructionProject';
  createdAt: Scalars['String']['output'];
  endDate: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  managerName: Scalars['String']['output'];
  name: Scalars['String']['output'];
  recordCount: Scalars['Int']['output'];
  siteAddress: Scalars['String']['output'];
  startDate: Maybe<Scalars['String']['output']>;
  status: ConstructionProjectStatus;
};

export enum ConstructionProjectStatus {
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  OnHold = 'ON_HOLD',
  Planning = 'PLANNING'
}

export type ConsultMessage = {
  __typename?: 'ConsultMessage';
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  role: Scalars['String']['output'];
};

export type ConsultMessageReply = {
  __typename?: 'ConsultMessageReply';
  assistantMessage: ConsultMessage;
  threadId: Scalars['ID']['output'];
  userMessage: ConsultMessage;
};

export type ConsultThread = {
  __typename?: 'ConsultThread';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  messages: Array<ConsultMessage>;
  title: Scalars['String']['output'];
};

export type Contract = {
  __typename?: 'Contract';
  body: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  partyEmail: Scalars['String']['output'];
  partyName: Scalars['String']['output'];
  signedAt: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  templateId: Maybe<Scalars['ID']['output']>;
  title: Scalars['String']['output'];
};

export type ContractTemplate = {
  __typename?: 'ContractTemplate';
  body: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type CostEntry = {
  __typename?: 'CostEntry';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  entryDate: Scalars['String']['output'];
  entryType: CostEntryType;
  id: Scalars['ID']['output'];
  invoiceNo: Scalars['String']['output'];
  lineItemId: Scalars['String']['output'];
  lineItemName: Scalars['String']['output'];
  projectId: Scalars['ID']['output'];
  projectName: Scalars['String']['output'];
  recordedBy: Scalars['String']['output'];
  vendorName: Scalars['String']['output'];
};

export enum CostEntryType {
  Equipment = 'EQUIPMENT',
  Labor = 'LABOR',
  Material = 'MATERIAL',
  Other = 'OTHER',
  Overhead = 'OVERHEAD',
  Subcontract = 'SUBCONTRACT'
}

export type CreateApiIntegrationInput = {
  apiKeyHint?: InputMaybe<Scalars['String']['input']>;
  endpointUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  provider?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBimModelInput = {
  fileSizeMb?: InputMaybe<Scalars['Float']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
  uploadedBy?: InputMaybe<Scalars['String']['input']>;
  viewerUrl?: InputMaybe<Scalars['String']['input']>;
};

export type CreateBudgetLineItemInput = {
  budgetAmount?: InputMaybe<Scalars['Float']['input']>;
  budgetId: Scalars['ID']['input'];
  categoryCode: Scalars['String']['input'];
  categoryName: Scalars['String']['input'];
  committedAmount?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  estimateAmount?: InputMaybe<Scalars['Float']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  wbsCode?: InputMaybe<Scalars['String']['input']>;
};

export type CreateConstructionProjectInput = {
  endDate?: InputMaybe<Scalars['String']['input']>;
  managerName?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  siteAddress?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<ConstructionProjectStatus>;
};

export type CreateContractInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  partyEmail?: InputMaybe<Scalars['String']['input']>;
  partyName: Scalars['String']['input'];
  templateId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
};

export type CreateCostEntryInput = {
  amount: Scalars['Float']['input'];
  description: Scalars['String']['input'];
  entryDate?: InputMaybe<Scalars['String']['input']>;
  entryType?: InputMaybe<CostEntryType>;
  invoiceNo?: InputMaybe<Scalars['String']['input']>;
  lineItemId?: InputMaybe<Scalars['ID']['input']>;
  projectId: Scalars['ID']['input'];
  recordedBy?: InputMaybe<Scalars['String']['input']>;
  vendorName?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCrmContactInput = {
  company?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  stage?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDxInitiativeInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  ownerName?: InputMaybe<Scalars['String']['input']>;
  progressPct?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateLeaveRequestInput = {
  endDate: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['String']['input'];
};

export type CreateProjectBudgetInput = {
  budgetType?: InputMaybe<BudgetType>;
  contractAmount?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  status?: InputMaybe<BudgetStatus>;
  versionNo?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateProjectModuleRecordInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  detail?: InputMaybe<Scalars['String']['input']>;
  moduleCode: SaasModuleCode;
  personName?: InputMaybe<Scalars['String']['input']>;
  projectId: Scalars['ID']['input'];
  recordDate?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateRagDocumentInput = {
  content: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
};

export type CreateVideoNoteInput = {
  body: Scalars['String']['input'];
  learnerId: Scalars['ID']['input'];
  timestampSec: Scalars['Int']['input'];
  videoId: Scalars['ID']['input'];
};

export type CrmContact = {
  __typename?: 'CrmContact';
  company: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  stage: Scalars['String']['output'];
};

export type CrmInteraction = {
  __typename?: 'CrmInteraction';
  contactId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  kind: Scalars['String']['output'];
  occurredAt: Scalars['String']['output'];
  summary: Scalars['String']['output'];
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  activeLearners: Scalars['Int']['output'];
  completionsThisMonth: Scalars['Int']['output'];
  learningPathsTotal: Scalars['Int']['output'];
  quizzesTotal: Scalars['Int']['output'];
  videosTotal: Scalars['Int']['output'];
  watchHoursThisMonth: Scalars['Float']['output'];
};

export type DxInitiative = {
  __typename?: 'DxInitiative';
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  dueDate: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  ownerName: Scalars['String']['output'];
  progressPct: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  taskCount: Scalars['Int']['output'];
  tasksDone: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type Health = {
  __typename?: 'Health';
  ok: Scalars['Boolean']['output'];
  service: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type Instructor = {
  __typename?: 'Instructor';
  avatarUrl: Scalars['String']['output'];
  bio: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  specialty: Scalars['String']['output'];
  title: Scalars['String']['output'];
  videoCount: Scalars['Int']['output'];
};

export type LearningActivityEvent = {
  __typename?: 'LearningActivityEvent';
  kind: LearningActivityKind;
  learnerId: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  occurredAt: Scalars['String']['output'];
  pathId: Maybe<Scalars['ID']['output']>;
  quizId: Maybe<Scalars['ID']['output']>;
  videoId: Maybe<Scalars['ID']['output']>;
};

export enum LearningActivityKind {
  BookmarkToggled = 'BOOKMARK_TOGGLED',
  NoteCreated = 'NOTE_CREATED',
  PathEnrolled = 'PATH_ENROLLED',
  ProgressUpdated = 'PROGRESS_UPDATED',
  QuizSubmitted = 'QUIZ_SUBMITTED'
}

export type LearningPath = {
  __typename?: 'LearningPath';
  category: VideoCategory;
  certificateTitle: Scalars['String']['output'];
  description: Scalars['String']['output'];
  enrolledCount: Scalars['Int']['output'];
  estimatedMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  skillLevel: SkillLevel;
  title: Scalars['String']['output'];
  videoIds: Array<Scalars['ID']['output']>;
};

export type LeaveRequest = {
  __typename?: 'LeaveRequest';
  createdAt: Scalars['String']['output'];
  endDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reason: Scalars['String']['output'];
  startDate: Scalars['String']['output'];
  status: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
  userName: Scalars['String']['output'];
};

export enum MemberRole {
  Admin = 'ADMIN',
  Member = 'MEMBER',
  Owner = 'OWNER',
  Viewer = 'VIEWER'
}

export type ModuleUsageMetric = {
  __typename?: 'ModuleUsageMetric';
  moduleCode: SaasModuleCode;
  moduleName: Scalars['String']['output'];
  recordCount: Scalars['Int']['output'];
};

export type MonthlyCostMetric = {
  __typename?: 'MonthlyCostMetric';
  amount: Scalars['Float']['output'];
  month: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  approveLeaveRequest: LeaveRequest;
  approveProjectBudget: ProjectBudget;
  clockIn: AttendanceRecord;
  clockOut: AttendanceRecord;
  createApiIntegration: ApiIntegration;
  createBimModel: BimModel;
  createBudgetLineItem: BudgetLineItem;
  createConstructionProject: ConstructionProject;
  createContract: Contract;
  createContractTemplate: ContractTemplate;
  createCostEntry: CostEntry;
  createCostFromBilling: CostEntry;
  createCrmContact: CrmContact;
  createCrmInteraction: CrmInteraction;
  createDxInitiative: DxInitiative;
  createLeaveRequest: LeaveRequest;
  createProjectBudget: ProjectBudget;
  createProjectModuleRecord: ProjectModuleRecord;
  createRagDocument: RagDocument;
  createVideoNote: VideoNote;
  deleteVideoNote: Scalars['Boolean']['output'];
  enrollLearningPath: LearningPath;
  generateAnalyticsInsight: AnalyticsInsight;
  recordVideoView: Video;
  sendConsultMessage: ConsultMessageReply;
  setSaasModuleEnabled: SaasModule;
  signContract: Contract;
  submitQuizAttempt: QuizAttempt;
  syncApiIntegration: ApiIntegration;
  toggleBookmark: Maybe<Bookmark>;
  updateOrganization: Organization;
  updateWatchProgress: WatchProgress;
};


export type MutationApproveLeaveRequestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationApproveProjectBudgetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationClockInArgs = {
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateApiIntegrationArgs = {
  input: CreateApiIntegrationInput;
};


export type MutationCreateBimModelArgs = {
  input: CreateBimModelInput;
};


export type MutationCreateBudgetLineItemArgs = {
  input: CreateBudgetLineItemInput;
};


export type MutationCreateConstructionProjectArgs = {
  input: CreateConstructionProjectInput;
};


export type MutationCreateContractArgs = {
  input: CreateContractInput;
};


export type MutationCreateContractTemplateArgs = {
  body: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateCostEntryArgs = {
  input: CreateCostEntryInput;
};


export type MutationCreateCostFromBillingArgs = {
  billingRecordId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
};


export type MutationCreateCrmContactArgs = {
  input: CreateCrmContactInput;
};


export type MutationCreateCrmInteractionArgs = {
  contactId: Scalars['ID']['input'];
  kind: Scalars['String']['input'];
  summary: Scalars['String']['input'];
};


export type MutationCreateDxInitiativeArgs = {
  input: CreateDxInitiativeInput;
};


export type MutationCreateLeaveRequestArgs = {
  input: CreateLeaveRequestInput;
};


export type MutationCreateProjectBudgetArgs = {
  input: CreateProjectBudgetInput;
};


export type MutationCreateProjectModuleRecordArgs = {
  input: CreateProjectModuleRecordInput;
};


export type MutationCreateRagDocumentArgs = {
  input: CreateRagDocumentInput;
};


export type MutationCreateVideoNoteArgs = {
  input: CreateVideoNoteInput;
};


export type MutationDeleteVideoNoteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEnrollLearningPathArgs = {
  learnerId: Scalars['ID']['input'];
  pathId: Scalars['ID']['input'];
};


export type MutationGenerateAnalyticsInsightArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationRecordVideoViewArgs = {
  videoId: Scalars['ID']['input'];
};


export type MutationSendConsultMessageArgs = {
  message: Scalars['String']['input'];
  threadId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationSetSaasModuleEnabledArgs = {
  code: SaasModuleCode;
  enabled: Scalars['Boolean']['input'];
};


export type MutationSignContractArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSubmitQuizAttemptArgs = {
  input: SubmitQuizAttemptInput;
};


export type MutationSyncApiIntegrationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationToggleBookmarkArgs = {
  learnerId: Scalars['ID']['input'];
  videoId: Scalars['ID']['input'];
};


export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};


export type MutationUpdateWatchProgressArgs = {
  input: UpdateWatchProgressInput;
};

export type Organization = {
  __typename?: 'Organization';
  createdAt: Scalars['String']['output'];
  enabledModules: Array<SaasModule>;
  id: Scalars['ID']['output'];
  memberCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  planTier: PlanTier;
  seatCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  subscriptionStatus: SubscriptionStatus;
  timezone: Scalars['String']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export enum PlanTier {
  Enterprise = 'ENTERPRISE',
  Free = 'FREE',
  Pro = 'PRO',
  Starter = 'STARTER'
}

export type ProjectBudget = {
  __typename?: 'ProjectBudget';
  approvedAt: Maybe<Scalars['String']['output']>;
  budgetType: BudgetType;
  contractAmount: Scalars['Float']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  notes: Scalars['String']['output'];
  projectId: Scalars['ID']['output'];
  projectName: Scalars['String']['output'];
  status: BudgetStatus;
  totalActual: Scalars['Float']['output'];
  totalBudget: Scalars['Float']['output'];
  totalCommitted: Scalars['Float']['output'];
  totalEstimate: Scalars['Float']['output'];
  versionNo: Scalars['Int']['output'];
};

export type ProjectBudgetSummary = {
  __typename?: 'ProjectBudgetSummary';
  billingTotal: Scalars['Float']['output'];
  contractAmount: Scalars['Float']['output'];
  projectId: Scalars['ID']['output'];
  projectName: Scalars['String']['output'];
  status: ConstructionProjectStatus;
  totalActual: Scalars['Float']['output'];
  totalBudget: Scalars['Float']['output'];
  variancePct: Scalars['Float']['output'];
};

export type ProjectModuleRecord = {
  __typename?: 'ProjectModuleRecord';
  amount: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  detail: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  moduleCode: SaasModuleCode;
  personName: Scalars['String']['output'];
  projectId: Scalars['ID']['output'];
  projectName: Scalars['String']['output'];
  recordDate: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ProjectStatusCount = {
  __typename?: 'ProjectStatusCount';
  count: Scalars['Int']['output'];
  status: ConstructionProjectStatus;
};

export type Query = {
  __typename?: 'Query';
  analyticsBoard: AnalyticsBoard;
  andpadAnalytics: AndpadAnalyticsDashboard;
  apiIntegrations: Array<ApiIntegration>;
  attendanceRecords: Array<AttendanceRecord>;
  bimModel: Maybe<BimModel>;
  bimModels: Array<BimModel>;
  budgetDashboard: BudgetDashboard;
  budgetLineItems: Array<BudgetLineItem>;
  constructionProjects: Array<ConstructionProject>;
  consultThread: Maybe<ConsultThread>;
  consultThreads: Array<ConsultThread>;
  contractTemplates: Array<ContractTemplate>;
  contracts: Array<Contract>;
  costEntries: Array<CostEntry>;
  crmContacts: Array<CrmContact>;
  crmInteractions: Array<CrmInteraction>;
  currentSession: Maybe<Session>;
  dashboard: DashboardStats;
  dxInitiatives: Array<DxInitiative>;
  featuredVideos: Array<Video>;
  health: Health;
  instructor: Maybe<Instructor>;
  instructors: Array<Instructor>;
  learningPath: Maybe<LearningPath>;
  learningPaths: Array<LearningPath>;
  leaveRequests: Array<LeaveRequest>;
  myBookmarks: Array<Bookmark>;
  myCertificates: Array<Certificate>;
  myProgress: Array<WatchProgress>;
  myQuizAttempts: Array<QuizAttempt>;
  organization: Organization;
  projectBudgetSummaries: Array<ProjectBudgetSummary>;
  projectBudgets: Array<ProjectBudget>;
  projectModuleRecords: Array<ProjectModuleRecord>;
  quiz: Maybe<Quiz>;
  quizzes: Array<Quiz>;
  ragAnswer: RagAnswer;
  ragDocuments: Array<RagDocument>;
  ragSearch: Array<RagSearchHit>;
  saasModules: Array<SaasModule>;
  teamMembers: Array<TeamMember>;
  usageSummary: UsageSummary;
  video: Maybe<Video>;
  videoNotes: Array<VideoNote>;
  videos: VideoPage;
};


export type QueryAnalyticsBoardArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAndpadAnalyticsArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryBimModelArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBimModelsArgs = {
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryBudgetDashboardArgs = {
  projectId: Scalars['ID']['input'];
};


export type QueryBudgetLineItemsArgs = {
  budgetId: Scalars['ID']['input'];
};


export type QueryConsultThreadArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCostEntriesArgs = {
  lineItemId?: InputMaybe<Scalars['ID']['input']>;
  projectId: Scalars['ID']['input'];
};


export type QueryCrmInteractionsArgs = {
  contactId: Scalars['ID']['input'];
};


export type QueryInstructorArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLearningPathArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLearningPathsArgs = {
  category?: InputMaybe<VideoCategory>;
  skillLevel?: InputMaybe<SkillLevel>;
};


export type QueryMyBookmarksArgs = {
  learnerId: Scalars['ID']['input'];
};


export type QueryMyCertificatesArgs = {
  learnerId: Scalars['ID']['input'];
};


export type QueryMyProgressArgs = {
  learnerId: Scalars['ID']['input'];
};


export type QueryMyQuizAttemptsArgs = {
  learnerId: Scalars['ID']['input'];
};


export type QueryProjectBudgetsArgs = {
  budgetType?: InputMaybe<BudgetType>;
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryProjectModuleRecordsArgs = {
  moduleCode: SaasModuleCode;
  projectId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryQuizArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuizzesArgs = {
  videoId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryRagAnswerArgs = {
  query: Scalars['String']['input'];
};


export type QueryRagSearchArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QueryVideoArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVideoNotesArgs = {
  learnerId: Scalars['ID']['input'];
  videoId: Scalars['ID']['input'];
};


export type QueryVideosArgs = {
  category?: InputMaybe<VideoCategory>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skillLevel?: InputMaybe<SkillLevel>;
};

export type Quiz = {
  __typename?: 'Quiz';
  id: Scalars['ID']['output'];
  passingScore: Scalars['Int']['output'];
  questions: Array<QuizQuestion>;
  title: Scalars['String']['output'];
  videoId: Maybe<Scalars['ID']['output']>;
};

export type QuizAttempt = {
  __typename?: 'QuizAttempt';
  completedAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  quizId: Scalars['ID']['output'];
  score: Scalars['Int']['output'];
};

export type QuizChoice = {
  __typename?: 'QuizChoice';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
};

export type QuizQuestion = {
  __typename?: 'QuizQuestion';
  choices: Array<QuizChoice>;
  correctIndex: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  prompt: Scalars['String']['output'];
};

export type RagAnswer = {
  __typename?: 'RagAnswer';
  answer: Scalars['String']['output'];
  sources: Array<RagSearchHit>;
};

export type RagDocument = {
  __typename?: 'RagDocument';
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type RagSearchHit = {
  __typename?: 'RagSearchHit';
  documentId: Scalars['ID']['output'];
  score: Scalars['Float']['output'];
  snippet: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type SaasModule = {
  __typename?: 'SaasModule';
  code: SaasModuleCode;
  description: Scalars['String']['output'];
  enabled: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export enum SaasModuleCode {
  Analytics = 'ANALYTICS',
  ApiIntegration = 'API_INTEGRATION',
  Attendance = 'ATTENDANCE',
  Billing = 'BILLING',
  Bim = 'BIM',
  Blackboard = 'BLACKBOARD',
  Bm = 'BM',
  BudgetMgmt = 'BUDGET_MGMT',
  Chatbot = 'CHATBOT',
  ConstructionMgmt = 'CONSTRUCTION_MGMT',
  Crm = 'CRM',
  DocApproval = 'DOC_APPROVAL',
  DocRag = 'DOC_RAG',
  Drawings = 'DRAWINGS',
  Dx = 'DX',
  Econtract = 'ECONTRACT',
  EDelivery = 'E_DELIVERY',
  InquiryProfit = 'INQUIRY_PROFIT',
  Inspection = 'INSPECTION',
  Orders = 'ORDERS',
  ProjectBoard = 'PROJECT_BOARD',
  RemoteSite = 'REMOTE_SITE',
  Scan_3D = 'SCAN_3D',
  SiteAccess = 'SITE_ACCESS',
  WorkRate = 'WORK_RATE'
}

export type Session = {
  __typename?: 'Session';
  organization: Organization;
  role: MemberRole;
  user: User;
};

export enum SkillLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE'
}

export type SubmitQuizAttemptInput = {
  answers: Array<Scalars['Int']['input']>;
  learnerId: Scalars['ID']['input'];
  quizId: Scalars['ID']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Dashboard stats refresh (reserved for live analytics) */
  dashboardUpdated: DashboardStats;
  /** Learning activity stream (progress, notes, bookmarks, enroll, quiz) */
  learningActivity: LearningActivityEvent;
  /** Learner watch progress updates */
  progressUpdated: WatchProgress;
};


export type SubscriptionLearningActivityArgs = {
  learnerId: Scalars['ID']['input'];
};


export type SubscriptionProgressUpdatedArgs = {
  learnerId: Scalars['ID']['input'];
};

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  PastDue = 'PAST_DUE',
  Trialing = 'TRIALING'
}

export type TeamMember = {
  __typename?: 'TeamMember';
  id: Scalars['ID']['output'];
  joinedAt: Scalars['String']['output'];
  lastActiveAt: Scalars['String']['output'];
  role: MemberRole;
  user: User;
};

export type UpdateOrganizationInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  seatCount?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWatchProgressInput = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  learnerId: Scalars['ID']['input'];
  positionSec: Scalars['Int']['input'];
  videoId: Scalars['ID']['input'];
};

export type UsageSummary = {
  __typename?: 'UsageSummary';
  apiCallsLimit: Scalars['Int']['output'];
  apiCallsThisMonth: Scalars['Int']['output'];
  consultTokensMonth: Scalars['Int']['output'];
  members: Scalars['Int']['output'];
  membersLimit: Scalars['Int']['output'];
  videos: Scalars['Int']['output'];
  videosLimit: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  avatarUrl: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Video = {
  __typename?: 'Video';
  category: VideoCategory;
  description: Scalars['String']['output'];
  durationSec: Scalars['Int']['output'];
  featured: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  instructorId: Scalars['ID']['output'];
  instructorName: Maybe<Scalars['String']['output']>;
  procedure: Scalars['String']['output'];
  publishedAt: Scalars['String']['output'];
  skillLevel: SkillLevel;
  tags: Array<Scalars['String']['output']>;
  thumbnailUrl: Scalars['String']['output'];
  title: Scalars['String']['output'];
  videoUrl: Scalars['String']['output'];
  viewCount: Scalars['Int']['output'];
};

export enum VideoCategory {
  Communication = 'COMMUNICATION',
  Endodontics = 'ENDODONTICS',
  Implant = 'IMPLANT',
  InfectionControl = 'INFECTION_CONTROL',
  OralSurgery = 'ORAL_SURGERY',
  Orthodontics = 'ORTHODONTICS',
  Pediatric = 'PEDIATRIC',
  Periodontics = 'PERIODONTICS',
  Prosthodontics = 'PROSTHODONTICS',
  Radiology = 'RADIOLOGY'
}

export type VideoMetric = {
  __typename?: 'VideoMetric';
  completions: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  videoId: Scalars['ID']['output'];
  views: Scalars['Int']['output'];
};

export type VideoNote = {
  __typename?: 'VideoNote';
  body: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  timestampSec: Scalars['Int']['output'];
  videoId: Scalars['ID']['output'];
};

export type VideoPage = {
  __typename?: 'VideoPage';
  items: Array<Video>;
  pageInfo: PageInfo;
};

export type WatchProgress = {
  __typename?: 'WatchProgress';
  completed: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  positionSec: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  videoId: Scalars['ID']['output'];
};

export type BoardAnalyticsPageQueryVariables = Exact<{
  periodDays?: InputMaybe<Scalars['Int']['input']>;
}>;


export type BoardAnalyticsPageQuery = { __typename?: 'Query', andpadAnalytics: { __typename?: 'AndpadAnalyticsDashboard', recordsByWeek: Array<number>, projectHealthScore: number, periodDays: number, billingTotal: number, activeProjects: number, budgetTotal: number, costTotal: number, budgetVariancePct: number, generatedAt: string, kpis: Array<{ __typename?: 'AndpadAnalyticsKpi', label: string, value: number, unit: string | null, trendPct: number | null }>, projectsByStatus: Array<{ __typename?: 'ProjectStatusCount', status: ConstructionProjectStatus, count: number }>, moduleUsage: Array<{ __typename?: 'ModuleUsageMetric', moduleCode: SaasModuleCode, moduleName: string, recordCount: number }>, costByMonth: Array<{ __typename?: 'MonthlyCostMetric', month: string, amount: number }> } };

export type GenerateAnalyticsInsightMutationVariables = Exact<{
  periodDays?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GenerateAnalyticsInsightMutation = { __typename?: 'Mutation', generateAnalyticsInsight: { __typename?: 'AnalyticsInsight', summary: string, strengths: Array<string>, risks: Array<string>, recommendations: Array<string>, generatedAt: string } };

export type BudgetLineItemFieldsFragment = { __typename?: 'BudgetLineItem', id: string, budgetId: string, categoryCode: string, categoryName: string, wbsCode: string, description: string, estimateAmount: number, budgetAmount: number, committedAmount: number, actualAmount: number, varianceAmount: number, variancePct: number, sortOrder: number, createdAt: string };

export type CostEntryFieldsFragment = { __typename?: 'CostEntry', id: string, projectId: string, projectName: string, lineItemId: string, lineItemName: string, entryType: CostEntryType, vendorName: string, description: string, amount: number, entryDate: string, invoiceNo: string, recordedBy: string, createdAt: string };

export type BudgetCategorySummaryFieldsFragment = { __typename?: 'BudgetCategorySummary', categoryCode: string, categoryName: string, budgetAmount: number, actualAmount: number, varianceAmount: number };

export type BudgetDashboardFieldsFragment = { __typename?: 'BudgetDashboard', projectId: string, projectName: string, contractAmount: number, totalEstimate: number, totalBudget: number, totalCommitted: number, totalActual: number, totalForecast: number, varianceAmount: number, variancePct: number, completionPct: number, estimateBudgetTotal: number, grossMarginPct: number, inquiryProfitTotal: number, billingTotal: number, billingBalance: number, generatedAt: string, monthlyCosts: Array<{ __typename?: 'MonthlyCostMetric', month: string, amount: number }>, reconciliation: Array<{ __typename?: 'BillingReconciliationItem', billingRecordId: string, title: string, billingAmount: number, costAmount: number, varianceAmount: number, status: string, billingDate: string | null }>, lineItems: Array<{ __typename?: 'BudgetLineItem', id: string, budgetId: string, categoryCode: string, categoryName: string, wbsCode: string, description: string, estimateAmount: number, budgetAmount: number, committedAmount: number, actualAmount: number, varianceAmount: number, variancePct: number, sortOrder: number, createdAt: string }>, recentCosts: Array<{ __typename?: 'CostEntry', id: string, projectId: string, projectName: string, lineItemId: string, lineItemName: string, entryType: CostEntryType, vendorName: string, description: string, amount: number, entryDate: string, invoiceNo: string, recordedBy: string, createdAt: string }>, categorySummary: Array<{ __typename?: 'BudgetCategorySummary', categoryCode: string, categoryName: string, budgetAmount: number, actualAmount: number, varianceAmount: number }> };

export type ProjectBudgetFieldsFragment = { __typename?: 'ProjectBudget', id: string, projectId: string, projectName: string, name: string, budgetType: BudgetType, status: BudgetStatus, versionNo: number, contractAmount: number, totalEstimate: number, totalBudget: number, totalCommitted: number, totalActual: number, notes: string, approvedAt: string | null, createdAt: string };

export type ProjectBudgetSummariesQueryVariables = Exact<{ [key: string]: never; }>;


export type ProjectBudgetSummariesQuery = { __typename?: 'Query', projectBudgetSummaries: Array<{ __typename?: 'ProjectBudgetSummary', projectId: string, projectName: string, status: ConstructionProjectStatus, contractAmount: number, totalBudget: number, totalActual: number, billingTotal: number, variancePct: number }> };

export type BudgetDashboardQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
}>;


export type BudgetDashboardQuery = { __typename?: 'Query', budgetDashboard: { __typename?: 'BudgetDashboard', projectId: string, projectName: string, contractAmount: number, totalEstimate: number, totalBudget: number, totalCommitted: number, totalActual: number, totalForecast: number, varianceAmount: number, variancePct: number, completionPct: number, estimateBudgetTotal: number, grossMarginPct: number, inquiryProfitTotal: number, billingTotal: number, billingBalance: number, generatedAt: string, monthlyCosts: Array<{ __typename?: 'MonthlyCostMetric', month: string, amount: number }>, reconciliation: Array<{ __typename?: 'BillingReconciliationItem', billingRecordId: string, title: string, billingAmount: number, costAmount: number, varianceAmount: number, status: string, billingDate: string | null }>, lineItems: Array<{ __typename?: 'BudgetLineItem', id: string, budgetId: string, categoryCode: string, categoryName: string, wbsCode: string, description: string, estimateAmount: number, budgetAmount: number, committedAmount: number, actualAmount: number, varianceAmount: number, variancePct: number, sortOrder: number, createdAt: string }>, recentCosts: Array<{ __typename?: 'CostEntry', id: string, projectId: string, projectName: string, lineItemId: string, lineItemName: string, entryType: CostEntryType, vendorName: string, description: string, amount: number, entryDate: string, invoiceNo: string, recordedBy: string, createdAt: string }>, categorySummary: Array<{ __typename?: 'BudgetCategorySummary', categoryCode: string, categoryName: string, budgetAmount: number, actualAmount: number, varianceAmount: number }> } };

export type ProjectBudgetsQueryVariables = Exact<{
  projectId?: InputMaybe<Scalars['ID']['input']>;
  budgetType?: InputMaybe<BudgetType>;
}>;


export type ProjectBudgetsQuery = { __typename?: 'Query', projectBudgets: Array<{ __typename?: 'ProjectBudget', id: string, projectId: string, projectName: string, name: string, budgetType: BudgetType, status: BudgetStatus, versionNo: number, contractAmount: number, totalEstimate: number, totalBudget: number, totalCommitted: number, totalActual: number, notes: string, approvedAt: string | null, createdAt: string }> };

export type CostEntriesQueryVariables = Exact<{
  projectId: Scalars['ID']['input'];
  lineItemId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type CostEntriesQuery = { __typename?: 'Query', costEntries: Array<{ __typename?: 'CostEntry', id: string, projectId: string, projectName: string, lineItemId: string, lineItemName: string, entryType: CostEntryType, vendorName: string, description: string, amount: number, entryDate: string, invoiceNo: string, recordedBy: string, createdAt: string }> };

export type CreateCostEntryMutationVariables = Exact<{
  input: CreateCostEntryInput;
}>;


export type CreateCostEntryMutation = { __typename?: 'Mutation', createCostEntry: { __typename?: 'CostEntry', id: string, projectId: string, projectName: string, lineItemId: string, lineItemName: string, entryType: CostEntryType, vendorName: string, description: string, amount: number, entryDate: string, invoiceNo: string, recordedBy: string, createdAt: string } };

export type CreateBudgetLineItemMutationVariables = Exact<{
  input: CreateBudgetLineItemInput;
}>;


export type CreateBudgetLineItemMutation = { __typename?: 'Mutation', createBudgetLineItem: { __typename?: 'BudgetLineItem', id: string, budgetId: string, categoryCode: string, categoryName: string, wbsCode: string, description: string, estimateAmount: number, budgetAmount: number, committedAmount: number, actualAmount: number, varianceAmount: number, variancePct: number, sortOrder: number, createdAt: string } };

export type CreateCostFromBillingMutationVariables = Exact<{
  billingRecordId: Scalars['ID']['input'];
  projectId: Scalars['ID']['input'];
}>;


export type CreateCostFromBillingMutation = { __typename?: 'Mutation', createCostFromBilling: { __typename?: 'CostEntry', id: string, projectId: string, projectName: string, lineItemId: string, lineItemName: string, entryType: CostEntryType, vendorName: string, description: string, amount: number, entryDate: string, invoiceNo: string, recordedBy: string, createdAt: string } };

export type ApproveProjectBudgetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ApproveProjectBudgetMutation = { __typename?: 'Mutation', approveProjectBudget: { __typename?: 'ProjectBudget', id: string, projectId: string, projectName: string, name: string, budgetType: BudgetType, status: BudgetStatus, versionNo: number, contractAmount: number, totalEstimate: number, totalBudget: number, totalCommitted: number, totalActual: number, notes: string, approvedAt: string | null, createdAt: string } };

export type CreateProjectBudgetMutationVariables = Exact<{
  input: CreateProjectBudgetInput;
}>;


export type CreateProjectBudgetMutation = { __typename?: 'Mutation', createProjectBudget: { __typename?: 'ProjectBudget', id: string, projectId: string, projectName: string, name: string, budgetType: BudgetType, status: BudgetStatus, versionNo: number, contractAmount: number, totalEstimate: number, totalBudget: number, totalCommitted: number, totalActual: number, notes: string, approvedAt: string | null, createdAt: string } };

export type ConstructionProjectFieldsFragment = { __typename?: 'ConstructionProject', id: string, name: string, siteAddress: string, status: ConstructionProjectStatus, managerName: string, startDate: string | null, endDate: string | null, recordCount: number, createdAt: string };

export type ProjectModuleRecordFieldsFragment = { __typename?: 'ProjectModuleRecord', id: string, projectId: string, projectName: string, moduleCode: SaasModuleCode, title: string, status: string, detail: string, amount: number | null, personName: string, recordDate: string | null, createdAt: string };

export type ConstructionProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type ConstructionProjectsQuery = { __typename?: 'Query', constructionProjects: Array<{ __typename?: 'ConstructionProject', id: string, name: string, siteAddress: string, status: ConstructionProjectStatus, managerName: string, startDate: string | null, endDate: string | null, recordCount: number, createdAt: string }> };

export type ProjectModuleRecordsQueryVariables = Exact<{
  moduleCode: SaasModuleCode;
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type ProjectModuleRecordsQuery = { __typename?: 'Query', projectModuleRecords: Array<{ __typename?: 'ProjectModuleRecord', id: string, projectId: string, projectName: string, moduleCode: SaasModuleCode, title: string, status: string, detail: string, amount: number | null, personName: string, recordDate: string | null, createdAt: string }> };

export type CreateConstructionProjectMutationVariables = Exact<{
  input: CreateConstructionProjectInput;
}>;


export type CreateConstructionProjectMutation = { __typename?: 'Mutation', createConstructionProject: { __typename?: 'ConstructionProject', id: string, name: string, siteAddress: string, status: ConstructionProjectStatus, managerName: string, startDate: string | null, endDate: string | null, recordCount: number, createdAt: string } };

export type CreateProjectModuleRecordMutationVariables = Exact<{
  input: CreateProjectModuleRecordInput;
}>;


export type CreateProjectModuleRecordMutation = { __typename?: 'Mutation', createProjectModuleRecord: { __typename?: 'ProjectModuleRecord', id: string, projectId: string, projectName: string, moduleCode: SaasModuleCode, title: string, status: string, detail: string, amount: number | null, personName: string, recordDate: string | null, createdAt: string } };

export type DashboardPageQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardPageQuery = { __typename?: 'Query', dashboard: { __typename?: 'DashboardStats', videosTotal: number, learningPathsTotal: number, quizzesTotal: number, completionsThisMonth: number, watchHoursThisMonth: number, activeLearners: number }, featuredVideos: Array<{ __typename?: 'Video', id: string, title: string, category: VideoCategory, skillLevel: SkillLevel, durationSec: number, thumbnailUrl: string, instructorName: string | null, viewCount: number }>, learningPaths: Array<{ __typename?: 'LearningPath', id: string, title: string, category: VideoCategory, skillLevel: SkillLevel, estimatedMinutes: number, enrolledCount: number }> };

export type AndpadAnalyticsKpiFieldsFragment = { __typename?: 'AndpadAnalyticsKpi', label: string, value: number, unit: string | null, trendPct: number | null };

export type AndpadAnalyticsDashboardFieldsFragment = { __typename?: 'AndpadAnalyticsDashboard', periodDays: number, billingTotal: number, activeProjects: number, recordsByWeek: Array<number>, projectHealthScore: number, budgetTotal: number, costTotal: number, budgetVariancePct: number, generatedAt: string, kpis: Array<{ __typename?: 'AndpadAnalyticsKpi', label: string, value: number, unit: string | null, trendPct: number | null }>, projectsByStatus: Array<{ __typename?: 'ProjectStatusCount', status: ConstructionProjectStatus, count: number }>, moduleUsage: Array<{ __typename?: 'ModuleUsageMetric', moduleCode: SaasModuleCode, moduleName: string, recordCount: number }>, costByMonth: Array<{ __typename?: 'MonthlyCostMetric', month: string, amount: number }> };

export type AndpadAnalyticsQueryVariables = Exact<{
  periodDays?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AndpadAnalyticsQuery = { __typename?: 'Query', andpadAnalytics: { __typename?: 'AndpadAnalyticsDashboard', periodDays: number, billingTotal: number, activeProjects: number, recordsByWeek: Array<number>, projectHealthScore: number, budgetTotal: number, costTotal: number, budgetVariancePct: number, generatedAt: string, kpis: Array<{ __typename?: 'AndpadAnalyticsKpi', label: string, value: number, unit: string | null, trendPct: number | null }>, projectsByStatus: Array<{ __typename?: 'ProjectStatusCount', status: ConstructionProjectStatus, count: number }>, moduleUsage: Array<{ __typename?: 'ModuleUsageMetric', moduleCode: SaasModuleCode, moduleName: string, recordCount: number }>, costByMonth: Array<{ __typename?: 'MonthlyCostMetric', month: string, amount: number }> } };

export type ApiIntegrationFieldsFragment = { __typename?: 'ApiIntegration', id: string, name: string, provider: string, endpointUrl: string, apiKeyHint: string, status: string, lastSyncAt: string | null, createdAt: string };

export type ApiIntegrationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ApiIntegrationsQuery = { __typename?: 'Query', apiIntegrations: Array<{ __typename?: 'ApiIntegration', id: string, name: string, provider: string, endpointUrl: string, apiKeyHint: string, status: string, lastSyncAt: string | null, createdAt: string }> };

export type CreateApiIntegrationMutationVariables = Exact<{
  input: CreateApiIntegrationInput;
}>;


export type CreateApiIntegrationMutation = { __typename?: 'Mutation', createApiIntegration: { __typename?: 'ApiIntegration', id: string, name: string, provider: string, endpointUrl: string, apiKeyHint: string, status: string, lastSyncAt: string | null, createdAt: string } };

export type SyncApiIntegrationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SyncApiIntegrationMutation = { __typename?: 'Mutation', syncApiIntegration: { __typename?: 'ApiIntegration', id: string, name: string, provider: string, endpointUrl: string, apiKeyHint: string, status: string, lastSyncAt: string | null, createdAt: string } };

export type BimModelFieldsFragment = { __typename?: 'BimModel', id: string, projectId: string, projectName: string, title: string, format: string, viewerUrl: string, fileSizeMb: number | null, status: string, uploadedBy: string, createdAt: string };

export type BimModelsQueryVariables = Exact<{
  projectId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type BimModelsQuery = { __typename?: 'Query', bimModels: Array<{ __typename?: 'BimModel', id: string, projectId: string, projectName: string, title: string, format: string, viewerUrl: string, fileSizeMb: number | null, status: string, uploadedBy: string, createdAt: string }> };

export type BimModelDetailQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type BimModelDetailQuery = { __typename?: 'Query', bimModel: { __typename?: 'BimModel', id: string, projectId: string, projectName: string, title: string, format: string, viewerUrl: string, fileSizeMb: number | null, status: string, uploadedBy: string, createdAt: string } | null };

export type CreateBimModelMutationVariables = Exact<{
  input: CreateBimModelInput;
}>;


export type CreateBimModelMutation = { __typename?: 'Mutation', createBimModel: { __typename?: 'BimModel', id: string, projectId: string, projectName: string, title: string, format: string, viewerUrl: string, fileSizeMb: number | null, status: string, uploadedBy: string, createdAt: string } };

export type InstructorsPageQueryVariables = Exact<{ [key: string]: never; }>;


export type InstructorsPageQuery = { __typename?: 'Query', instructors: Array<{ __typename?: 'Instructor', id: string, name: string, title: string, specialty: string, bio: string, avatarUrl: string, videoCount: number }> };

export type LearningPageQueryVariables = Exact<{
  learnerId: Scalars['ID']['input'];
}>;


export type LearningPageQuery = { __typename?: 'Query', myProgress: Array<{ __typename?: 'WatchProgress', id: string, videoId: string, positionSec: number, completed: boolean, updatedAt: string }>, myBookmarks: Array<{ __typename?: 'Bookmark', id: string, videoId: string, createdAt: string }>, myCertificates: Array<{ __typename?: 'Certificate', id: string, pathId: string, title: string, issuedAt: string }>, videos: { __typename?: 'VideoPage', items: Array<{ __typename?: 'Video', id: string, title: string, thumbnailUrl: string, durationSec: number, category: VideoCategory }> }, learningPaths: Array<{ __typename?: 'LearningPath', id: string, title: string, videoIds: Array<string> }> };

export type UpdateWatchProgressMutationVariables = Exact<{
  input: UpdateWatchProgressInput;
}>;


export type UpdateWatchProgressMutation = { __typename?: 'Mutation', updateWatchProgress: { __typename?: 'WatchProgress', id: string, videoId: string, positionSec: number, completed: boolean, updatedAt: string } };

export type CreateVideoNoteMutationVariables = Exact<{
  input: CreateVideoNoteInput;
}>;


export type CreateVideoNoteMutation = { __typename?: 'Mutation', createVideoNote: { __typename?: 'VideoNote', id: string, videoId: string, timestampSec: number, body: string, createdAt: string } };

export type ToggleBookmarkMutationVariables = Exact<{
  videoId: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
}>;


export type ToggleBookmarkMutation = { __typename?: 'Mutation', toggleBookmark: { __typename?: 'Bookmark', id: string, videoId: string, learnerId: string } | null };

export type EnrollLearningPathMutationVariables = Exact<{
  pathId: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
}>;


export type EnrollLearningPathMutation = { __typename?: 'Mutation', enrollLearningPath: { __typename?: 'LearningPath', id: string, title: string, enrolledCount: number } };

export type SubmitQuizAttemptMutationVariables = Exact<{
  input: SubmitQuizAttemptInput;
}>;


export type SubmitQuizAttemptMutation = { __typename?: 'Mutation', submitQuizAttempt: { __typename?: 'QuizAttempt', id: string, score: number, passed: boolean, completedAt: string } };

export type PathsPageQueryVariables = Exact<{
  category?: InputMaybe<VideoCategory>;
  skillLevel?: InputMaybe<SkillLevel>;
}>;


export type PathsPageQuery = { __typename?: 'Query', learningPaths: Array<{ __typename?: 'LearningPath', id: string, title: string, description: string, category: VideoCategory, skillLevel: SkillLevel, videoIds: Array<string>, estimatedMinutes: number, enrolledCount: number, certificateTitle: string }> };

export type PathDetailPageQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PathDetailPageQuery = { __typename?: 'Query', learningPath: { __typename?: 'LearningPath', id: string, title: string, description: string, category: VideoCategory, skillLevel: SkillLevel, videoIds: Array<string>, estimatedMinutes: number, enrolledCount: number, certificateTitle: string } | null, videos: { __typename?: 'VideoPage', items: Array<{ __typename?: 'Video', id: string, title: string, durationSec: number, thumbnailUrl: string, category: VideoCategory, skillLevel: SkillLevel }> } };

export type QuizzesPageQueryVariables = Exact<{
  learnerId: Scalars['ID']['input'];
}>;


export type QuizzesPageQuery = { __typename?: 'Query', quizzes: Array<{ __typename?: 'Quiz', id: string, videoId: string | null, title: string, passingScore: number, questions: Array<{ __typename?: 'QuizQuestion', id: string }> }>, myQuizAttempts: Array<{ __typename?: 'QuizAttempt', id: string, quizId: string, score: number, passed: boolean, completedAt: string }> };

export type QuizTakePageQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type QuizTakePageQuery = { __typename?: 'Query', quiz: { __typename?: 'Quiz', id: string, videoId: string | null, title: string, passingScore: number, questions: Array<{ __typename?: 'QuizQuestion', id: string, prompt: string, correctIndex: number, choices: Array<{ __typename?: 'QuizChoice', id: string, label: string }> }> } | null };

export type RecordVideoViewMutationVariables = Exact<{
  videoId: Scalars['ID']['input'];
}>;


export type RecordVideoViewMutation = { __typename?: 'Mutation', recordVideoView: { __typename?: 'Video', id: string, viewCount: number } };

export type DxInitiativeFieldsFragment = { __typename?: 'DxInitiative', id: string, title: string, description: string, status: string, progressPct: number, ownerName: string, dueDate: string | null, taskCount: number, tasksDone: number, createdAt: string };

export type DxInitiativesQueryVariables = Exact<{ [key: string]: never; }>;


export type DxInitiativesQuery = { __typename?: 'Query', dxInitiatives: Array<{ __typename?: 'DxInitiative', id: string, title: string, description: string, status: string, progressPct: number, ownerName: string, dueDate: string | null, taskCount: number, tasksDone: number, createdAt: string }> };

export type CreateDxInitiativeMutationVariables = Exact<{
  input: CreateDxInitiativeInput;
}>;


export type CreateDxInitiativeMutation = { __typename?: 'Mutation', createDxInitiative: { __typename?: 'DxInitiative', id: string, title: string, description: string, status: string, progressPct: number, ownerName: string, dueDate: string | null, taskCount: number, tasksDone: number, createdAt: string } };

export type CrmContactFieldsFragment = { __typename?: 'CrmContact', id: string, name: string, email: string, phone: string, company: string, stage: string, notes: string, createdAt: string };

export type CrmInteractionFieldsFragment = { __typename?: 'CrmInteraction', id: string, contactId: string, kind: string, summary: string, occurredAt: string };

export type CrmContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type CrmContactsQuery = { __typename?: 'Query', crmContacts: Array<{ __typename?: 'CrmContact', id: string, name: string, email: string, phone: string, company: string, stage: string, notes: string, createdAt: string }> };

export type CrmInteractionsQueryVariables = Exact<{
  contactId: Scalars['ID']['input'];
}>;


export type CrmInteractionsQuery = { __typename?: 'Query', crmInteractions: Array<{ __typename?: 'CrmInteraction', id: string, contactId: string, kind: string, summary: string, occurredAt: string }> };

export type CreateCrmContactMutationVariables = Exact<{
  input: CreateCrmContactInput;
}>;


export type CreateCrmContactMutation = { __typename?: 'Mutation', createCrmContact: { __typename?: 'CrmContact', id: string, name: string, email: string, phone: string, company: string, stage: string, notes: string, createdAt: string } };

export type CreateCrmInteractionMutationVariables = Exact<{
  contactId: Scalars['ID']['input'];
  kind: Scalars['String']['input'];
  summary: Scalars['String']['input'];
}>;


export type CreateCrmInteractionMutation = { __typename?: 'Mutation', createCrmInteraction: { __typename?: 'CrmInteraction', id: string, contactId: string, kind: string, summary: string, occurredAt: string } };

export type AttendanceRecordFieldsFragment = { __typename?: 'AttendanceRecord', id: string, userId: string, userName: string, clockIn: string, clockOut: string | null, note: string };

export type LeaveRequestFieldsFragment = { __typename?: 'LeaveRequest', id: string, userId: string, userName: string, startDate: string, endDate: string, reason: string, status: string, createdAt: string };

export type AttendanceModuleQueryVariables = Exact<{ [key: string]: never; }>;


export type AttendanceModuleQuery = { __typename?: 'Query', attendanceRecords: Array<{ __typename?: 'AttendanceRecord', id: string, userId: string, userName: string, clockIn: string, clockOut: string | null, note: string }>, leaveRequests: Array<{ __typename?: 'LeaveRequest', id: string, userId: string, userName: string, startDate: string, endDate: string, reason: string, status: string, createdAt: string }> };

export type ClockInMutationVariables = Exact<{
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type ClockInMutation = { __typename?: 'Mutation', clockIn: { __typename?: 'AttendanceRecord', id: string, userId: string, userName: string, clockIn: string, clockOut: string | null, note: string } };

export type ClockOutMutationVariables = Exact<{ [key: string]: never; }>;


export type ClockOutMutation = { __typename?: 'Mutation', clockOut: { __typename?: 'AttendanceRecord', id: string, userId: string, userName: string, clockIn: string, clockOut: string | null, note: string } };

export type CreateLeaveRequestMutationVariables = Exact<{
  input: CreateLeaveRequestInput;
}>;


export type CreateLeaveRequestMutation = { __typename?: 'Mutation', createLeaveRequest: { __typename?: 'LeaveRequest', id: string, userId: string, userName: string, startDate: string, endDate: string, reason: string, status: string, createdAt: string } };

export type ApproveLeaveRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ApproveLeaveRequestMutation = { __typename?: 'Mutation', approveLeaveRequest: { __typename?: 'LeaveRequest', id: string, userId: string, userName: string, startDate: string, endDate: string, reason: string, status: string, createdAt: string } };

export type ContractTemplateFieldsFragment = { __typename?: 'ContractTemplate', id: string, name: string, body: string, createdAt: string };

export type ContractFieldsFragment = { __typename?: 'Contract', id: string, templateId: string | null, title: string, partyName: string, partyEmail: string, body: string, status: string, createdAt: string, signedAt: string | null };

export type ContractsModuleQueryVariables = Exact<{ [key: string]: never; }>;


export type ContractsModuleQuery = { __typename?: 'Query', contractTemplates: Array<{ __typename?: 'ContractTemplate', id: string, name: string, body: string, createdAt: string }>, contracts: Array<{ __typename?: 'Contract', id: string, templateId: string | null, title: string, partyName: string, partyEmail: string, body: string, status: string, createdAt: string, signedAt: string | null }> };

export type CreateContractMutationVariables = Exact<{
  input: CreateContractInput;
}>;


export type CreateContractMutation = { __typename?: 'Mutation', createContract: { __typename?: 'Contract', id: string, templateId: string | null, title: string, partyName: string, partyEmail: string, body: string, status: string, createdAt: string, signedAt: string | null } };

export type SignContractMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SignContractMutation = { __typename?: 'Mutation', signContract: { __typename?: 'Contract', id: string, templateId: string | null, title: string, partyName: string, partyEmail: string, body: string, status: string, createdAt: string, signedAt: string | null } };

export type ConsultMessageFieldsFragment = { __typename?: 'ConsultMessage', id: string, role: string, content: string, createdAt: string };

export type ConsultThreadFieldsFragment = { __typename?: 'ConsultThread', id: string, title: string, createdAt: string, messages: Array<{ __typename?: 'ConsultMessage', id: string, role: string, content: string, createdAt: string }> };

export type ConsultThreadsQueryVariables = Exact<{ [key: string]: never; }>;


export type ConsultThreadsQuery = { __typename?: 'Query', consultThreads: Array<{ __typename?: 'ConsultThread', id: string, title: string, createdAt: string }> };

export type ConsultThreadQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ConsultThreadQuery = { __typename?: 'Query', consultThread: { __typename?: 'ConsultThread', id: string, title: string, createdAt: string, messages: Array<{ __typename?: 'ConsultMessage', id: string, role: string, content: string, createdAt: string }> } | null };

export type SendConsultMessageMutationVariables = Exact<{
  threadId?: InputMaybe<Scalars['ID']['input']>;
  message: Scalars['String']['input'];
}>;


export type SendConsultMessageMutation = { __typename?: 'Mutation', sendConsultMessage: { __typename?: 'ConsultMessageReply', threadId: string, userMessage: { __typename?: 'ConsultMessage', id: string, role: string, content: string, createdAt: string }, assistantMessage: { __typename?: 'ConsultMessage', id: string, role: string, content: string, createdAt: string } } };

export type RagDocumentFieldsFragment = { __typename?: 'RagDocument', id: string, title: string, content: string, tags: Array<string>, createdAt: string };

export type RagSearchHitFieldsFragment = { __typename?: 'RagSearchHit', documentId: string, title: string, snippet: string, score: number };

export type RagDocumentsQueryVariables = Exact<{ [key: string]: never; }>;


export type RagDocumentsQuery = { __typename?: 'Query', ragDocuments: Array<{ __typename?: 'RagDocument', id: string, title: string, content: string, tags: Array<string>, createdAt: string }> };

export type RagAnswerQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type RagAnswerQuery = { __typename?: 'Query', ragAnswer: { __typename?: 'RagAnswer', answer: string, sources: Array<{ __typename?: 'RagSearchHit', documentId: string, title: string, snippet: string, score: number }> } };

export type CreateRagDocumentMutationVariables = Exact<{
  input: CreateRagDocumentInput;
}>;


export type CreateRagDocumentMutation = { __typename?: 'Mutation', createRagDocument: { __typename?: 'RagDocument', id: string, title: string, content: string, tags: Array<string>, createdAt: string } };

export type CurrentSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentSessionQuery = { __typename?: 'Query', currentSession: { __typename?: 'Session', role: MemberRole, user: { __typename?: 'User', id: string, email: string, name: string }, organization: { __typename?: 'Organization', id: string, name: string, slug: string, planTier: PlanTier, subscriptionStatus: SubscriptionStatus, seatCount: number, memberCount: number } } | null };

export type OrganizationSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationSettingsQuery = { __typename?: 'Query', organization: { __typename?: 'Organization', id: string, name: string, slug: string, planTier: PlanTier, subscriptionStatus: SubscriptionStatus, seatCount: number, timezone: string, memberCount: number, createdAt: string, enabledModules: Array<{ __typename?: 'SaasModule', code: SaasModuleCode, name: string, description: string, enabled: boolean }> }, usageSummary: { __typename?: 'UsageSummary', members: number, membersLimit: number, videos: number, videosLimit: number, apiCallsThisMonth: number, apiCallsLimit: number, consultTokensMonth: number }, teamMembers: Array<{ __typename?: 'TeamMember', id: string, role: MemberRole, joinedAt: string, user: { __typename?: 'User', id: string, email: string, name: string } }> };

export type SaasModulesQueryVariables = Exact<{ [key: string]: never; }>;


export type SaasModulesQuery = { __typename?: 'Query', saasModules: Array<{ __typename?: 'SaasModule', code: SaasModuleCode, name: string, description: string, enabled: boolean }> };

export type UpdateOrganizationMutationVariables = Exact<{
  input: UpdateOrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization: { __typename?: 'Organization', id: string, name: string, slug: string, seatCount: number, timezone: string, enabledModules: Array<{ __typename?: 'SaasModule', code: SaasModuleCode, enabled: boolean }> } };

export type SetSaasModuleEnabledMutationVariables = Exact<{
  code: SaasModuleCode;
  enabled: Scalars['Boolean']['input'];
}>;


export type SetSaasModuleEnabledMutation = { __typename?: 'Mutation', setSaasModuleEnabled: { __typename?: 'SaasModule', code: SaasModuleCode, name: string, description: string, enabled: boolean } };

export type DashboardUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DashboardUpdatedSubscription = { __typename?: 'Subscription', dashboardUpdated: { __typename?: 'DashboardStats', videosTotal: number, learningPathsTotal: number, quizzesTotal: number, completionsThisMonth: number, watchHoursThisMonth: number, activeLearners: number } };

export type ProgressUpdatedSubscriptionVariables = Exact<{
  learnerId: Scalars['ID']['input'];
}>;


export type ProgressUpdatedSubscription = { __typename?: 'Subscription', progressUpdated: { __typename?: 'WatchProgress', id: string, videoId: string, positionSec: number, completed: boolean, updatedAt: string } };

export type LearningActivitySubscriptionVariables = Exact<{
  learnerId: Scalars['ID']['input'];
}>;


export type LearningActivitySubscription = { __typename?: 'Subscription', learningActivity: { __typename?: 'LearningActivityEvent', kind: LearningActivityKind, learnerId: string, videoId: string | null, pathId: string | null, quizId: string | null, message: string, occurredAt: string } };

export type VideosPageQueryVariables = Exact<{
  category?: InputMaybe<VideoCategory>;
  skillLevel?: InputMaybe<SkillLevel>;
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type VideosPageQuery = { __typename?: 'Query', videos: { __typename?: 'VideoPage', items: Array<{ __typename?: 'Video', id: string, title: string, description: string, category: VideoCategory, procedure: string, skillLevel: SkillLevel, durationSec: number, thumbnailUrl: string, instructorName: string | null, viewCount: number, featured: boolean }>, pageInfo: { __typename?: 'PageInfo', total: number, page: number, pageSize: number, totalPages: number } } };

export type VideoDetailPageQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
}>;


export type VideoDetailPageQuery = { __typename?: 'Query', video: { __typename?: 'Video', id: string, title: string, description: string, category: VideoCategory, procedure: string, skillLevel: SkillLevel, durationSec: number, thumbnailUrl: string, videoUrl: string, instructorId: string, instructorName: string | null, tags: Array<string>, viewCount: number, publishedAt: string } | null, videoNotes: Array<{ __typename?: 'VideoNote', id: string, timestampSec: number, body: string, createdAt: string }>, quizzes: Array<{ __typename?: 'Quiz', id: string, title: string, passingScore: number, questions: Array<{ __typename?: 'QuizQuestion', id: string, prompt: string, choices: Array<{ __typename?: 'QuizChoice', id: string, label: string }> }> }>, myProgress: Array<{ __typename?: 'WatchProgress', videoId: string, positionSec: number, completed: boolean }>, myBookmarks: Array<{ __typename?: 'Bookmark', videoId: string }> };

export const BudgetLineItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetLineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryCode"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"wbsCode"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estimateAmount"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAmount"}},{"kind":"Field","name":{"kind":"Name","value":"committedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"variancePct"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<BudgetLineItemFieldsFragment, unknown>;
export const CostEntryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CostEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CostEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemName"}},{"kind":"Field","name":{"kind":"Name","value":"entryType"}},{"kind":"Field","name":{"kind":"Name","value":"vendorName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"entryDate"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}},{"kind":"Field","name":{"kind":"Name","value":"recordedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CostEntryFieldsFragment, unknown>;
export const BudgetCategorySummaryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetCategorySummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetCategorySummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryCode"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}}]}}]} as unknown as DocumentNode<BudgetCategorySummaryFieldsFragment, unknown>;
export const BudgetDashboardFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetDashboardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetDashboard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"contractAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalEstimate"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"totalCommitted"}},{"kind":"Field","name":{"kind":"Name","value":"totalActual"}},{"kind":"Field","name":{"kind":"Name","value":"totalForecast"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"variancePct"}},{"kind":"Field","name":{"kind":"Name","value":"completionPct"}},{"kind":"Field","name":{"kind":"Name","value":"estimateBudgetTotal"}},{"kind":"Field","name":{"kind":"Name","value":"grossMarginPct"}},{"kind":"Field","name":{"kind":"Name","value":"inquiryProfitTotal"}},{"kind":"Field","name":{"kind":"Name","value":"billingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"billingBalance"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyCosts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reconciliation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"billingRecordId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"billingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"costAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"billingDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lineItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BudgetLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recentCosts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CostEntryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categorySummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BudgetCategorySummaryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetLineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryCode"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"wbsCode"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estimateAmount"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAmount"}},{"kind":"Field","name":{"kind":"Name","value":"committedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"variancePct"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CostEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CostEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemName"}},{"kind":"Field","name":{"kind":"Name","value":"entryType"}},{"kind":"Field","name":{"kind":"Name","value":"vendorName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"entryDate"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}},{"kind":"Field","name":{"kind":"Name","value":"recordedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetCategorySummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetCategorySummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryCode"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}}]}}]} as unknown as DocumentNode<BudgetDashboardFieldsFragment, unknown>;
export const ProjectBudgetFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectBudgetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectBudget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budgetType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"versionNo"}},{"kind":"Field","name":{"kind":"Name","value":"contractAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalEstimate"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"totalCommitted"}},{"kind":"Field","name":{"kind":"Name","value":"totalActual"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ProjectBudgetFieldsFragment, unknown>;
export const ConstructionProjectFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConstructionProjectFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConstructionProject"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"siteAddress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"managerName"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"recordCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ConstructionProjectFieldsFragment, unknown>;
export const ProjectModuleRecordFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectModuleRecordFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectModuleRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"moduleCode"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"personName"}},{"kind":"Field","name":{"kind":"Name","value":"recordDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ProjectModuleRecordFieldsFragment, unknown>;
export const AndpadAnalyticsKpiFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AndpadAnalyticsKpiFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndpadAnalyticsKpi"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"trendPct"}}]}}]} as unknown as DocumentNode<AndpadAnalyticsKpiFieldsFragment, unknown>;
export const AndpadAnalyticsDashboardFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AndpadAnalyticsDashboardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndpadAnalyticsDashboard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"periodDays"}},{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AndpadAnalyticsKpiFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projectsByStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moduleUsage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moduleCode"}},{"kind":"Field","name":{"kind":"Name","value":"moduleName"}},{"kind":"Field","name":{"kind":"Name","value":"recordCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjects"}},{"kind":"Field","name":{"kind":"Name","value":"recordsByWeek"}},{"kind":"Field","name":{"kind":"Name","value":"projectHealthScore"}},{"kind":"Field","name":{"kind":"Name","value":"budgetTotal"}},{"kind":"Field","name":{"kind":"Name","value":"costTotal"}},{"kind":"Field","name":{"kind":"Name","value":"budgetVariancePct"}},{"kind":"Field","name":{"kind":"Name","value":"costByMonth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AndpadAnalyticsKpiFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndpadAnalyticsKpi"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"trendPct"}}]}}]} as unknown as DocumentNode<AndpadAnalyticsDashboardFieldsFragment, unknown>;
export const ApiIntegrationFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ApiIntegrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ApiIntegration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"endpointUrl"}},{"kind":"Field","name":{"kind":"Name","value":"apiKeyHint"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ApiIntegrationFieldsFragment, unknown>;
export const BimModelFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BimModelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BimModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"viewerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeMb"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<BimModelFieldsFragment, unknown>;
export const DxInitiativeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DxInitiativeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DxInitiative"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progressPct"}},{"kind":"Field","name":{"kind":"Name","value":"ownerName"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"taskCount"}},{"kind":"Field","name":{"kind":"Name","value":"tasksDone"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<DxInitiativeFieldsFragment, unknown>;
export const CrmContactFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CrmContactFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CrmContact"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"stage"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CrmContactFieldsFragment, unknown>;
export const CrmInteractionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CrmInteractionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CrmInteraction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contactId"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]} as unknown as DocumentNode<CrmInteractionFieldsFragment, unknown>;
export const AttendanceRecordFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttendanceRecordFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AttendanceRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"clockIn"}},{"kind":"Field","name":{"kind":"Name","value":"clockOut"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<AttendanceRecordFieldsFragment, unknown>;
export const LeaveRequestFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LeaveRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LeaveRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<LeaveRequestFieldsFragment, unknown>;
export const ContractTemplateFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractTemplateFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContractTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ContractTemplateFieldsFragment, unknown>;
export const ContractFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contract"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"templateId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"partyName"}},{"kind":"Field","name":{"kind":"Name","value":"partyEmail"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}}]}}]} as unknown as DocumentNode<ContractFieldsFragment, unknown>;
export const ConsultMessageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConsultMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConsultMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ConsultMessageFieldsFragment, unknown>;
export const ConsultThreadFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConsultThreadFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConsultThread"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConsultMessageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConsultMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConsultMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ConsultThreadFieldsFragment, unknown>;
export const RagDocumentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RagDocumentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RagDocument"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RagDocumentFieldsFragment, unknown>;
export const RagSearchHitFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RagSearchHitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RagSearchHit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"snippet"}},{"kind":"Field","name":{"kind":"Name","value":"score"}}]}}]} as unknown as DocumentNode<RagSearchHitFieldsFragment, unknown>;
export const BoardAnalyticsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BoardAnalyticsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"andpadAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"periodDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AndpadAnalyticsDashboardFields"}},{"kind":"Field","name":{"kind":"Name","value":"recordsByWeek"}},{"kind":"Field","name":{"kind":"Name","value":"projectHealthScore"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AndpadAnalyticsKpiFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndpadAnalyticsKpi"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"trendPct"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AndpadAnalyticsDashboardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndpadAnalyticsDashboard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"periodDays"}},{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AndpadAnalyticsKpiFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projectsByStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moduleUsage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moduleCode"}},{"kind":"Field","name":{"kind":"Name","value":"moduleName"}},{"kind":"Field","name":{"kind":"Name","value":"recordCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjects"}},{"kind":"Field","name":{"kind":"Name","value":"recordsByWeek"}},{"kind":"Field","name":{"kind":"Name","value":"projectHealthScore"}},{"kind":"Field","name":{"kind":"Name","value":"budgetTotal"}},{"kind":"Field","name":{"kind":"Name","value":"costTotal"}},{"kind":"Field","name":{"kind":"Name","value":"budgetVariancePct"}},{"kind":"Field","name":{"kind":"Name","value":"costByMonth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}}]} as unknown as DocumentNode<BoardAnalyticsPageQuery, BoardAnalyticsPageQueryVariables>;
export const GenerateAnalyticsInsightDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateAnalyticsInsight"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateAnalyticsInsight"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"periodDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"strengths"}},{"kind":"Field","name":{"kind":"Name","value":"risks"}},{"kind":"Field","name":{"kind":"Name","value":"recommendations"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}}]}}]} as unknown as DocumentNode<GenerateAnalyticsInsightMutation, GenerateAnalyticsInsightMutationVariables>;
export const ProjectBudgetSummariesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectBudgetSummaries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectBudgetSummaries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"contractAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"totalActual"}},{"kind":"Field","name":{"kind":"Name","value":"billingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"variancePct"}}]}}]}}]} as unknown as DocumentNode<ProjectBudgetSummariesQuery, ProjectBudgetSummariesQueryVariables>;
export const BudgetDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BudgetDashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"budgetDashboard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BudgetDashboardFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetLineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryCode"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"wbsCode"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estimateAmount"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAmount"}},{"kind":"Field","name":{"kind":"Name","value":"committedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"variancePct"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CostEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CostEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemName"}},{"kind":"Field","name":{"kind":"Name","value":"entryType"}},{"kind":"Field","name":{"kind":"Name","value":"vendorName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"entryDate"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}},{"kind":"Field","name":{"kind":"Name","value":"recordedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetCategorySummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetCategorySummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryCode"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetDashboardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetDashboard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"contractAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalEstimate"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"totalCommitted"}},{"kind":"Field","name":{"kind":"Name","value":"totalActual"}},{"kind":"Field","name":{"kind":"Name","value":"totalForecast"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"variancePct"}},{"kind":"Field","name":{"kind":"Name","value":"completionPct"}},{"kind":"Field","name":{"kind":"Name","value":"estimateBudgetTotal"}},{"kind":"Field","name":{"kind":"Name","value":"grossMarginPct"}},{"kind":"Field","name":{"kind":"Name","value":"inquiryProfitTotal"}},{"kind":"Field","name":{"kind":"Name","value":"billingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"billingBalance"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyCosts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reconciliation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"billingRecordId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"billingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"costAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"billingDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lineItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BudgetLineItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recentCosts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CostEntryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categorySummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BudgetCategorySummaryFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}}]} as unknown as DocumentNode<BudgetDashboardQuery, BudgetDashboardQueryVariables>;
export const ProjectBudgetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectBudgets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"budgetType"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectBudgets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"budgetType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"budgetType"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectBudgetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectBudgetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectBudget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budgetType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"versionNo"}},{"kind":"Field","name":{"kind":"Name","value":"contractAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalEstimate"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"totalCommitted"}},{"kind":"Field","name":{"kind":"Name","value":"totalActual"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ProjectBudgetsQuery, ProjectBudgetsQueryVariables>;
export const CostEntriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CostEntries"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"lineItemId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"costEntries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}},{"kind":"Argument","name":{"kind":"Name","value":"lineItemId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"lineItemId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CostEntryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CostEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CostEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemName"}},{"kind":"Field","name":{"kind":"Name","value":"entryType"}},{"kind":"Field","name":{"kind":"Name","value":"vendorName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"entryDate"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}},{"kind":"Field","name":{"kind":"Name","value":"recordedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CostEntriesQuery, CostEntriesQueryVariables>;
export const CreateCostEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCostEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCostEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCostEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CostEntryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CostEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CostEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemName"}},{"kind":"Field","name":{"kind":"Name","value":"entryType"}},{"kind":"Field","name":{"kind":"Name","value":"vendorName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"entryDate"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}},{"kind":"Field","name":{"kind":"Name","value":"recordedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateCostEntryMutation, CreateCostEntryMutationVariables>;
export const CreateBudgetLineItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBudgetLineItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBudgetLineItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBudgetLineItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BudgetLineItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BudgetLineItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BudgetLineItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"budgetId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryCode"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"wbsCode"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"estimateAmount"}},{"kind":"Field","name":{"kind":"Name","value":"budgetAmount"}},{"kind":"Field","name":{"kind":"Name","value":"committedAmount"}},{"kind":"Field","name":{"kind":"Name","value":"actualAmount"}},{"kind":"Field","name":{"kind":"Name","value":"varianceAmount"}},{"kind":"Field","name":{"kind":"Name","value":"variancePct"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateBudgetLineItemMutation, CreateBudgetLineItemMutationVariables>;
export const CreateCostFromBillingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCostFromBilling"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"billingRecordId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCostFromBilling"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"billingRecordId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"billingRecordId"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CostEntryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CostEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CostEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemId"}},{"kind":"Field","name":{"kind":"Name","value":"lineItemName"}},{"kind":"Field","name":{"kind":"Name","value":"entryType"}},{"kind":"Field","name":{"kind":"Name","value":"vendorName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"entryDate"}},{"kind":"Field","name":{"kind":"Name","value":"invoiceNo"}},{"kind":"Field","name":{"kind":"Name","value":"recordedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateCostFromBillingMutation, CreateCostFromBillingMutationVariables>;
export const ApproveProjectBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveProjectBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveProjectBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectBudgetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectBudgetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectBudget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budgetType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"versionNo"}},{"kind":"Field","name":{"kind":"Name","value":"contractAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalEstimate"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"totalCommitted"}},{"kind":"Field","name":{"kind":"Name","value":"totalActual"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ApproveProjectBudgetMutation, ApproveProjectBudgetMutationVariables>;
export const CreateProjectBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProjectBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectBudgetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProjectBudget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectBudgetFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectBudgetFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectBudget"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"budgetType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"versionNo"}},{"kind":"Field","name":{"kind":"Name","value":"contractAmount"}},{"kind":"Field","name":{"kind":"Name","value":"totalEstimate"}},{"kind":"Field","name":{"kind":"Name","value":"totalBudget"}},{"kind":"Field","name":{"kind":"Name","value":"totalCommitted"}},{"kind":"Field","name":{"kind":"Name","value":"totalActual"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"approvedAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateProjectBudgetMutation, CreateProjectBudgetMutationVariables>;
export const ConstructionProjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ConstructionProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"constructionProjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConstructionProjectFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConstructionProjectFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConstructionProject"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"siteAddress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"managerName"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"recordCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ConstructionProjectsQuery, ConstructionProjectsQueryVariables>;
export const ProjectModuleRecordsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProjectModuleRecords"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"moduleCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaasModuleCode"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"projectModuleRecords"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"moduleCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"moduleCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectModuleRecordFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectModuleRecordFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectModuleRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"moduleCode"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"personName"}},{"kind":"Field","name":{"kind":"Name","value":"recordDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ProjectModuleRecordsQuery, ProjectModuleRecordsQueryVariables>;
export const CreateConstructionProjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateConstructionProject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateConstructionProjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createConstructionProject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConstructionProjectFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConstructionProjectFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConstructionProject"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"siteAddress"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"managerName"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"recordCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateConstructionProjectMutation, CreateConstructionProjectMutationVariables>;
export const CreateProjectModuleRecordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProjectModuleRecord"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProjectModuleRecordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProjectModuleRecord"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProjectModuleRecordFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProjectModuleRecordFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProjectModuleRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"moduleCode"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detail"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"personName"}},{"kind":"Field","name":{"kind":"Name","value":"recordDate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateProjectModuleRecordMutation, CreateProjectModuleRecordMutationVariables>;
export const DashboardPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videosTotal"}},{"kind":"Field","name":{"kind":"Name","value":"learningPathsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"quizzesTotal"}},{"kind":"Field","name":{"kind":"Name","value":"completionsThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"watchHoursThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"activeLearners"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredVideos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"instructorName"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"learningPaths"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledCount"}}]}}]}}]} as unknown as DocumentNode<DashboardPageQuery, DashboardPageQueryVariables>;
export const AndpadAnalyticsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AndpadAnalytics"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"andpadAnalytics"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"periodDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AndpadAnalyticsDashboardFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AndpadAnalyticsKpiFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndpadAnalyticsKpi"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"trendPct"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AndpadAnalyticsDashboardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AndpadAnalyticsDashboard"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"periodDays"}},{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AndpadAnalyticsKpiFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"projectsByStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moduleUsage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moduleCode"}},{"kind":"Field","name":{"kind":"Name","value":"moduleName"}},{"kind":"Field","name":{"kind":"Name","value":"recordCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"billingTotal"}},{"kind":"Field","name":{"kind":"Name","value":"activeProjects"}},{"kind":"Field","name":{"kind":"Name","value":"recordsByWeek"}},{"kind":"Field","name":{"kind":"Name","value":"projectHealthScore"}},{"kind":"Field","name":{"kind":"Name","value":"budgetTotal"}},{"kind":"Field","name":{"kind":"Name","value":"costTotal"}},{"kind":"Field","name":{"kind":"Name","value":"budgetVariancePct"}},{"kind":"Field","name":{"kind":"Name","value":"costByMonth"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"month"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}}]} as unknown as DocumentNode<AndpadAnalyticsQuery, AndpadAnalyticsQueryVariables>;
export const ApiIntegrationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ApiIntegrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apiIntegrations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ApiIntegrationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ApiIntegrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ApiIntegration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"endpointUrl"}},{"kind":"Field","name":{"kind":"Name","value":"apiKeyHint"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ApiIntegrationsQuery, ApiIntegrationsQueryVariables>;
export const CreateApiIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateApiIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateApiIntegrationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createApiIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ApiIntegrationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ApiIntegrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ApiIntegration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"endpointUrl"}},{"kind":"Field","name":{"kind":"Name","value":"apiKeyHint"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateApiIntegrationMutation, CreateApiIntegrationMutationVariables>;
export const SyncApiIntegrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncApiIntegration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncApiIntegration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ApiIntegrationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ApiIntegrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ApiIntegration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"endpointUrl"}},{"kind":"Field","name":{"kind":"Name","value":"apiKeyHint"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"lastSyncAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<SyncApiIntegrationMutation, SyncApiIntegrationMutationVariables>;
export const BimModelsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BimModels"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bimModels"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"projectId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"projectId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BimModelFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BimModelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BimModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"viewerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeMb"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<BimModelsQuery, BimModelsQueryVariables>;
export const BimModelDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BimModelDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bimModel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BimModelFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BimModelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BimModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"viewerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeMb"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<BimModelDetailQuery, BimModelDetailQueryVariables>;
export const CreateBimModelDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBimModel"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateBimModelInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBimModel"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"BimModelFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"BimModelFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"BimModel"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"projectId"}},{"kind":"Field","name":{"kind":"Name","value":"projectName"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"format"}},{"kind":"Field","name":{"kind":"Name","value":"viewerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"fileSizeMb"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"uploadedBy"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateBimModelMutation, CreateBimModelMutationVariables>;
export const InstructorsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InstructorsPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instructors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"specialty"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"videoCount"}}]}}]}}]} as unknown as DocumentNode<InstructorsPageQuery, InstructorsPageQueryVariables>;
export const LearningPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearningPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"positionSec"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myBookmarks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myCertificates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pathId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"learningPaths"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"videoIds"}}]}}]}}]} as unknown as DocumentNode<LearningPageQuery, LearningPageQueryVariables>;
export const UpdateWatchProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWatchProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateWatchProgressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWatchProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"positionSec"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateWatchProgressMutation, UpdateWatchProgressMutationVariables>;
export const CreateVideoNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateVideoNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVideoNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVideoNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"timestampSec"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateVideoNoteMutation, CreateVideoNoteMutationVariables>;
export const ToggleBookmarkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleBookmark"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"videoId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleBookmark"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"videoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"videoId"}}},{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"learnerId"}}]}}]}}]} as unknown as DocumentNode<ToggleBookmarkMutation, ToggleBookmarkMutationVariables>;
export const EnrollLearningPathDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnrollLearningPath"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pathId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enrollLearningPath"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pathId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pathId"}}},{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledCount"}}]}}]}}]} as unknown as DocumentNode<EnrollLearningPathMutation, EnrollLearningPathMutationVariables>;
export const SubmitQuizAttemptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitQuizAttempt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitQuizAttemptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitQuizAttempt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<SubmitQuizAttemptMutation, SubmitQuizAttemptMutationVariables>;
export const PathsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PathsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VideoCategory"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skillLevel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SkillLevel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"learningPaths"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"skillLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skillLevel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"videoIds"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledCount"}},{"kind":"Field","name":{"kind":"Name","value":"certificateTitle"}}]}}]}}]} as unknown as DocumentNode<PathsPageQuery, PathsPageQueryVariables>;
export const PathDetailPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PathDetailPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"learningPath"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"videoIds"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledCount"}},{"kind":"Field","name":{"kind":"Name","value":"certificateTitle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}}]}}]}}]}}]} as unknown as DocumentNode<PathDetailPageQuery, PathDetailPageQueryVariables>;
export const QuizzesPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"QuizzesPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizzes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"passingScore"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"myQuizAttempts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<QuizzesPageQuery, QuizzesPageQueryVariables>;
export const QuizTakePageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"QuizTakePage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quiz"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"passingScore"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"correctIndex"}}]}}]}}]}}]} as unknown as DocumentNode<QuizTakePageQuery, QuizTakePageQueryVariables>;
export const RecordVideoViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordVideoView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"videoId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordVideoView"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"videoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"videoId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}}]}}]}}]} as unknown as DocumentNode<RecordVideoViewMutation, RecordVideoViewMutationVariables>;
export const DxInitiativesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DxInitiatives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dxInitiatives"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DxInitiativeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DxInitiativeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DxInitiative"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progressPct"}},{"kind":"Field","name":{"kind":"Name","value":"ownerName"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"taskCount"}},{"kind":"Field","name":{"kind":"Name","value":"tasksDone"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<DxInitiativesQuery, DxInitiativesQueryVariables>;
export const CreateDxInitiativeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDxInitiative"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDxInitiativeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDxInitiative"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DxInitiativeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DxInitiativeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DxInitiative"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"progressPct"}},{"kind":"Field","name":{"kind":"Name","value":"ownerName"}},{"kind":"Field","name":{"kind":"Name","value":"dueDate"}},{"kind":"Field","name":{"kind":"Name","value":"taskCount"}},{"kind":"Field","name":{"kind":"Name","value":"tasksDone"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateDxInitiativeMutation, CreateDxInitiativeMutationVariables>;
export const CrmContactsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CrmContacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crmContacts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CrmContactFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CrmContactFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CrmContact"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"stage"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CrmContactsQuery, CrmContactsQueryVariables>;
export const CrmInteractionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CrmInteractions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contactId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"crmInteractions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"contactId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contactId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CrmInteractionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CrmInteractionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CrmInteraction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contactId"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]} as unknown as DocumentNode<CrmInteractionsQuery, CrmInteractionsQueryVariables>;
export const CreateCrmContactDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCrmContact"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCrmContactInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCrmContact"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CrmContactFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CrmContactFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CrmContact"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"company"}},{"kind":"Field","name":{"kind":"Name","value":"stage"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateCrmContactMutation, CreateCrmContactMutationVariables>;
export const CreateCrmInteractionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCrmInteraction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"contactId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"kind"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"summary"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCrmInteraction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"contactId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"contactId"}}},{"kind":"Argument","name":{"kind":"Name","value":"kind"},"value":{"kind":"Variable","name":{"kind":"Name","value":"kind"}}},{"kind":"Argument","name":{"kind":"Name","value":"summary"},"value":{"kind":"Variable","name":{"kind":"Name","value":"summary"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CrmInteractionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CrmInteractionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CrmInteraction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"contactId"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]} as unknown as DocumentNode<CreateCrmInteractionMutation, CreateCrmInteractionMutationVariables>;
export const AttendanceModuleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AttendanceModule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attendanceRecords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AttendanceRecordFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"leaveRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LeaveRequestFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttendanceRecordFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AttendanceRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"clockIn"}},{"kind":"Field","name":{"kind":"Name","value":"clockOut"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LeaveRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LeaveRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<AttendanceModuleQuery, AttendanceModuleQueryVariables>;
export const ClockInDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClockIn"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clockIn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AttendanceRecordFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttendanceRecordFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AttendanceRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"clockIn"}},{"kind":"Field","name":{"kind":"Name","value":"clockOut"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<ClockInMutation, ClockInMutationVariables>;
export const ClockOutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClockOut"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clockOut"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AttendanceRecordFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AttendanceRecordFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AttendanceRecord"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"clockIn"}},{"kind":"Field","name":{"kind":"Name","value":"clockOut"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]} as unknown as DocumentNode<ClockOutMutation, ClockOutMutationVariables>;
export const CreateLeaveRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateLeaveRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateLeaveRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createLeaveRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LeaveRequestFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LeaveRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LeaveRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateLeaveRequestMutation, CreateLeaveRequestMutationVariables>;
export const ApproveLeaveRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApproveLeaveRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approveLeaveRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LeaveRequestFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LeaveRequestFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LeaveRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userName"}},{"kind":"Field","name":{"kind":"Name","value":"startDate"}},{"kind":"Field","name":{"kind":"Name","value":"endDate"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<ApproveLeaveRequestMutation, ApproveLeaveRequestMutationVariables>;
export const ContractsModuleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ContractsModule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contractTemplates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContractTemplateFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contracts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContractFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractTemplateFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContractTemplate"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contract"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"templateId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"partyName"}},{"kind":"Field","name":{"kind":"Name","value":"partyEmail"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}}]}}]} as unknown as DocumentNode<ContractsModuleQuery, ContractsModuleQueryVariables>;
export const CreateContractDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateContract"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateContractInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createContract"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContractFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contract"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"templateId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"partyName"}},{"kind":"Field","name":{"kind":"Name","value":"partyEmail"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}}]}}]} as unknown as DocumentNode<CreateContractMutation, CreateContractMutationVariables>;
export const SignContractDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignContract"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signContract"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContractFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contract"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"templateId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"partyName"}},{"kind":"Field","name":{"kind":"Name","value":"partyEmail"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"signedAt"}}]}}]} as unknown as DocumentNode<SignContractMutation, SignContractMutationVariables>;
export const ConsultThreadsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ConsultThreads"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consultThreads"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<ConsultThreadsQuery, ConsultThreadsQueryVariables>;
export const ConsultThreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ConsultThread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"consultThread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConsultThreadFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConsultMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConsultMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConsultThreadFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConsultThread"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConsultMessageFields"}}]}}]}}]} as unknown as DocumentNode<ConsultThreadQuery, ConsultThreadQueryVariables>;
export const SendConsultMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendConsultMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendConsultMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threadId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threadId"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"threadId"}},{"kind":"Field","name":{"kind":"Name","value":"userMessage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConsultMessageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"assistantMessage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ConsultMessageFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ConsultMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ConsultMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<SendConsultMessageMutation, SendConsultMessageMutationVariables>;
export const RagDocumentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RagDocuments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ragDocuments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RagDocumentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RagDocumentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RagDocument"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<RagDocumentsQuery, RagDocumentsQueryVariables>;
export const RagAnswerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RagAnswer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ragAnswer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"answer"}},{"kind":"Field","name":{"kind":"Name","value":"sources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RagSearchHitFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RagSearchHitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RagSearchHit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"documentId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"snippet"}},{"kind":"Field","name":{"kind":"Name","value":"score"}}]}}]} as unknown as DocumentNode<RagAnswerQuery, RagAnswerQueryVariables>;
export const CreateRagDocumentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateRagDocument"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRagDocumentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createRagDocument"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RagDocumentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RagDocumentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RagDocument"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]} as unknown as DocumentNode<CreateRagDocumentMutation, CreateRagDocumentMutationVariables>;
export const CurrentSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"planTier"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionStatus"}},{"kind":"Field","name":{"kind":"Name","value":"seatCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CurrentSessionQuery, CurrentSessionQueryVariables>;
export const OrganizationSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"planTier"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionStatus"}},{"kind":"Field","name":{"kind":"Name","value":"seatCount"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"enabledModules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"usageSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"members"}},{"kind":"Field","name":{"kind":"Name","value":"membersLimit"}},{"kind":"Field","name":{"kind":"Name","value":"videos"}},{"kind":"Field","name":{"kind":"Name","value":"videosLimit"}},{"kind":"Field","name":{"kind":"Name","value":"apiCallsThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"apiCallsLimit"}},{"kind":"Field","name":{"kind":"Name","value":"consultTokensMonth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teamMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<OrganizationSettingsQuery, OrganizationSettingsQueryVariables>;
export const SaasModulesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SaasModules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saasModules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]} as unknown as DocumentNode<SaasModulesQuery, SaasModulesQueryVariables>;
export const UpdateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"seatCount"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"enabledModules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const SetSaasModuleEnabledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetSaasModuleEnabled"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SaasModuleCode"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setSaasModuleEnabled"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}},{"kind":"Argument","name":{"kind":"Name","value":"enabled"},"value":{"kind":"Variable","name":{"kind":"Name","value":"enabled"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]} as unknown as DocumentNode<SetSaasModuleEnabledMutation, SetSaasModuleEnabledMutationVariables>;
export const DashboardUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"DashboardUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videosTotal"}},{"kind":"Field","name":{"kind":"Name","value":"learningPathsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"quizzesTotal"}},{"kind":"Field","name":{"kind":"Name","value":"completionsThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"watchHoursThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"activeLearners"}}]}}]}}]} as unknown as DocumentNode<DashboardUpdatedSubscription, DashboardUpdatedSubscriptionVariables>;
export const ProgressUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ProgressUpdated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"progressUpdated"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"positionSec"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ProgressUpdatedSubscription, ProgressUpdatedSubscriptionVariables>;
export const LearningActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"LearningActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"learningActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"learnerId"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"pathId"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]}}]} as unknown as DocumentNode<LearningActivitySubscription, LearningActivitySubscriptionVariables>;
export const VideosPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VideosPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VideoCategory"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skillLevel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SkillLevel"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"skillLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skillLevel"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"procedure"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"instructorName"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"featured"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]}}]} as unknown as DocumentNode<VideosPageQuery, VideosPageQueryVariables>;
export const VideoDetailPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VideoDetailPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"video"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"procedure"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"videoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"instructorId"}},{"kind":"Field","name":{"kind":"Name","value":"instructorName"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoNotes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"videoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestampSec"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quizzes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"videoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"passingScore"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"myProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"positionSec"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myBookmarks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}}]}}]}}]} as unknown as DocumentNode<VideoDetailPageQuery, VideoDetailPageQueryVariables>;