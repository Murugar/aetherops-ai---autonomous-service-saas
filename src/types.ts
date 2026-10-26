export type ViewMode = 'web' | 'mobile' | 'split';

export type ActiveTab =
  | 'overview'
  | 'jobs'
  | 'customers'
  | 'calendar'
  | 'workflows'
  | 'knowledge'
  | 'copilot'
  | 'analytics'
  | 'infrastructure';

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  contractTier: 'Enterprise' | 'Premium Care' | 'Standard SLA';
  lifetimeValue: number;
  openJobsCount: number;
  satisfactionScore: number;
  equipment: {
    name: string;
    model: string;
    installedYear: number;
    status: 'Optimal' | 'Inspection Due' | 'Urgent Attention';
  }[];
  lastServiceDate: string;
}

export interface Job {
  id: string;
  ticketNumber: string;
  title: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  technicianId: string | null;
  technicianName: string | null;
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  status: 'Unassigned' | 'Dispatched' | 'En Route' | 'In Progress' | 'Completed' | 'Invoiced';
  category: 'HVAC' | 'Electrical' | 'Hydraulics' | 'Refrigeration' | 'Industrial Automation';
  scheduledTime: string;
  estimatedDurationHours: number;
  slaDeadline: string;
  costEstimate: number;
  notes: string;
  partsRequired: string[];
  diagnosticPhotos: string[];
  customerSignature?: string;
}

export interface Technician {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: 'Available' | 'En Route' | 'On Site' | 'Off Duty';
  specialties: string[];
  currentJobId: string | null;
  rating: number;
  completedJobsToday: number;
  location: { lat: number; lng: number; area: string };
  truckInventory: { part: string; qty: number }[];
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'SOP' | 'Equipment Manual' | 'Rate Card' | 'Safety & Compliance';
  snippet: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: 'JOB_CREATED' | 'JOB_COMPLETED' | 'SLA_NEAR_BREACH' | 'CUSTOMER_COMPLAINT' | 'DIAGNOSTIC_SUBMITTED';
  conditions: string[];
  aiAction: 'AUTO_DISPATCH_OPTIMAL_TECH' | 'GENERATE_INVOICE_AND_SMS' | 'GENERATE_AI_WORK_SUMMARY' | 'TRIGGER_CHURN_PREVENTION';
  active: boolean;
  executionsCount: number;
  lastRun: string;
}

export interface AIWorkSummary {
  executiveSummary: string;
  rootCause: string;
  actionItems: string[];
  estimatedBilledHours: number;
  partsTotal: string;
  laborTotal: string;
  totalCost: string;
  customerSentiment: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface AIRecommendation {
  bestTechnician?: {
    id: string;
    name: string;
    matchScore: number;
    reasoning: string;
    etaMinutes: number;
  };
  preventiveAdvice: string;
  upsellOpportunity: string;
  slaRisk: string;
}

export interface AnalyticsData {
  totalMonthlyRevenue: number;
  revenueGrowthMoM: string;
  completedJobsThisMonth: number;
  firstTimeFixRate: number;
  avgResponseTimeMinutes: number;
  activeSlaComplianceRate: number;
  technicianUtilizationRate: number;
  categoryBreakdown: { name: string; count: number; percentage: number }[];
  weeklyTrend: { day: string; jobs: number; revenue: number }[];
}
