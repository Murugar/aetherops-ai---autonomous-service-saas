import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI server-side with User-Agent telemetry
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-Memory Database for rapid SaaS simulation & mutations
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
  equipment: { name: string; model: string; installedYear: number; status: 'Optimal' | 'Inspection Due' | 'Urgent Attention' }[];
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

// Initial Seed Data
const customers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Sarah Jenkins',
    company: 'Apex BioLabs & Cold Storage',
    email: 's.jenkins@apexbio.com',
    phone: '+1 (555) 392-8811',
    address: '840 Gateway Blvd, South San Francisco, CA',
    contractTier: 'Enterprise',
    lifetimeValue: 48500,
    openJobsCount: 2,
    satisfactionScore: 98,
    equipment: [
      { name: 'Ultra-Low Cryo Chiller #04', model: 'ThermoVortex 900X', installedYear: 2021, status: 'Urgent Attention' },
      { name: 'Backup Power Conditioning System', model: 'Eaton PowerPro 80kVA', installedYear: 2023, status: 'Optimal' },
    ],
    lastServiceDate: '2026-10-18',
  },
  {
    id: 'cust-2',
    name: 'Marcus Vance',
    company: 'Vance Logistics Terminal 4',
    email: 'm.vance@vanceterminals.net',
    phone: '+1 (555) 741-2099',
    address: '1200 Maritime Way, Oakland, CA',
    contractTier: 'Premium Care',
    lifetimeValue: 31200,
    openJobsCount: 1,
    satisfactionScore: 92,
    equipment: [
      { name: 'Hydraulic Freight Lift Alpha', model: 'TitanHoist 12T', installedYear: 2019, status: 'Inspection Due' },
      { name: 'Automated Conveyor Inverter', model: 'Siemens Simovert G120', installedYear: 2022, status: 'Optimal' },
    ],
    lastServiceDate: '2026-09-30',
  },
  {
    id: 'cust-3',
    name: 'Elena Rostova',
    company: 'Metropolitan Data Centers',
    email: 'e.rostova@metrodata.io',
    phone: '+1 (555) 819-3344',
    address: '400 Minna St, San Francisco, CA',
    contractTier: 'Enterprise',
    lifetimeValue: 74900,
    openJobsCount: 1,
    satisfactionScore: 100,
    equipment: [
      { name: 'CRAC Unit Data Hall B', model: 'Liebert DSE High-Efficiency', installedYear: 2024, status: 'Optimal' },
      { name: 'Dual Loop Water Chiller', model: 'Carrier AquaForce 30XW', installedYear: 2020, status: 'Inspection Due' },
    ],
    lastServiceDate: '2026-10-22',
  },
  {
    id: 'cust-4',
    name: 'David Kalu',
    company: 'Presidio Heritage Hotels',
    email: 'dkalu@presidiohotels.com',
    phone: '+1 (555) 602-4412',
    address: '50 Moraga Ave, San Francisco, CA',
    contractTier: 'Standard SLA',
    lifetimeValue: 18400,
    openJobsCount: 0,
    satisfactionScore: 89,
    equipment: [
      { name: 'Central Commercial Boiler', model: 'Raypak MVB 1500', installedYear: 2018, status: 'Urgent Attention' },
    ],
    lastServiceDate: '2026-08-14',
  },
];

const technicians: Technician[] = [
  {
    id: 'tech-1',
    name: 'Alex Rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    phone: '+1 (555) 431-7782',
    status: 'On Site',
    specialties: ['HVAC', 'Refrigeration', 'Cryogenics'],
    currentJobId: 'job-101',
    rating: 4.96,
    completedJobsToday: 2,
    location: { lat: 37.654, lng: -122.408, area: 'South San Francisco' },
    truckInventory: [
      { part: 'TXV Expansion Valve R448A', qty: 3 },
      { part: 'Digital Compressor Inverter Board', qty: 2 },
      { part: 'High-Pressure Refrigerant Sensor', qty: 6 },
    ],
  },
  {
    id: 'tech-2',
    name: 'Devon Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    phone: '+1 (555) 902-1144',
    status: 'En Route',
    specialties: ['Industrial Automation', 'Electrical', 'PLC Controls'],
    currentJobId: 'job-102',
    rating: 4.88,
    completedJobsToday: 1,
    location: { lat: 37.798, lng: -122.271, area: 'Oakland Harbor' },
    truckInventory: [
      { part: 'Siemens S7-1200 PLC Module', qty: 2 },
      { part: '480V Heavy Duty Contactor', qty: 4 },
      { part: 'Opto-Coupler Relay Kit', qty: 8 },
    ],
  },
  {
    id: 'tech-3',
    name: 'Maya Chen',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    phone: '+1 (555) 234-8899',
    status: 'Available',
    specialties: ['Hydraulics', 'Heavy Machinery', 'Boilers'],
    currentJobId: null,
    rating: 4.98,
    completedJobsToday: 3,
    location: { lat: 37.774, lng: -122.419, area: 'Downtown San Francisco' },
    truckInventory: [
      { part: 'High-Temp Seal Kit 2.5in', qty: 5 },
      { part: 'Hydraulic Directional Spool Valve', qty: 2 },
      { part: 'Burner Flame Sensor Electrode', qty: 4 },
    ],
  },
  {
    id: 'tech-4',
    name: 'Liam Thorne',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    phone: '+1 (555) 551-7890',
    status: 'Available',
    specialties: ['HVAC', 'Electrical', 'Smart IoT Sensors'],
    currentJobId: null,
    rating: 4.91,
    completedJobsToday: 2,
    location: { lat: 37.783, lng: -122.401, area: 'SOMA / Mission' },
    truckInventory: [
      { part: 'BACnet Gateway Unit', qty: 3 },
      { part: 'Solid State Thermostat Relay', qty: 6 },
      { part: 'Differential Airflow Switch', qty: 4 },
    ],
  },
];

let jobs: Job[] = [
  {
    id: 'job-101',
    ticketNumber: 'WO-8849',
    title: 'Emergency Cryo Chiller Thermal Spike & Pressure Fluctuation',
    customerId: 'cust-1',
    customerName: 'Apex BioLabs & Cold Storage',
    customerAddress: '840 Gateway Blvd, South San Francisco, CA',
    technicianId: 'tech-1',
    technicianName: 'Alex Rivera',
    priority: 'Critical',
    status: 'In Progress',
    category: 'Refrigeration',
    scheduledTime: '2026-10-26T09:30:00Z',
    estimatedDurationHours: 2.5,
    slaDeadline: '2026-10-26T12:00:00Z',
    costEstimate: 1450,
    notes: 'Primary biological specimen holding freezer #4 logged temperature rise from -80C to -68C. Inverter compressor cycling intermittently.',
    partsRequired: ['TXV Expansion Valve R448A', 'Digital Compressor Inverter Board'],
    diagnosticPhotos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'job-102',
    ticketNumber: 'WO-8850',
    title: 'Freight Lift VFD Error Code F0002 Overcurrent Fault',
    customerId: 'cust-2',
    customerName: 'Vance Logistics Terminal 4',
    customerAddress: '1200 Maritime Way, Oakland, CA',
    technicianId: 'tech-2',
    technicianName: 'Devon Vance',
    priority: 'High',
    status: 'En Route',
    category: 'Industrial Automation',
    scheduledTime: '2026-10-26T11:00:00Z',
    estimatedDurationHours: 2.0,
    slaDeadline: '2026-10-26T14:30:00Z',
    costEstimate: 890,
    notes: 'Conveyor interlock tripped during loading cycle. Drive diagnostics show motor winding impedance spike.',
    partsRequired: ['Siemens S7-1200 PLC Module', '480V Heavy Duty Contactor'],
    diagnosticPhotos: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'job-103',
    ticketNumber: 'WO-8851',
    title: 'CRAC Unit Quarterly Airflow Calibration & Glycol Loop Flush',
    customerId: 'cust-3',
    customerName: 'Metropolitan Data Centers',
    customerAddress: '400 Minna St, San Francisco, CA',
    technicianId: null,
    technicianName: null,
    priority: 'Normal',
    status: 'Unassigned',
    category: 'HVAC',
    scheduledTime: '2026-10-26T14:00:00Z',
    estimatedDurationHours: 3.0,
    slaDeadline: '2026-10-26T18:00:00Z',
    costEstimate: 1200,
    notes: 'Scheduled preventive maintenance protocol #HV-202. Verify differential pressure sensors across cooling coils.',
    partsRequired: ['Differential Airflow Switch', 'Glycol Concentration Test Strips'],
    diagnosticPhotos: [],
  },
  {
    id: 'job-104',
    ticketNumber: 'WO-8848',
    title: 'Commercial Boiler Flame Ignition Pilot Failure',
    customerId: 'cust-4',
    customerName: 'Presidio Heritage Hotels',
    customerAddress: '50 Moraga Ave, San Francisco, CA',
    technicianId: 'tech-3',
    technicianName: 'Maya Chen',
    priority: 'High',
    status: 'Completed',
    category: 'HVAC',
    scheduledTime: '2026-10-26T07:00:00Z',
    estimatedDurationHours: 1.5,
    slaDeadline: '2026-10-26T10:00:00Z',
    costEstimate: 620,
    notes: 'Cleaned flame rod sensor and replaced worn pilot ignition lead. Hot water service restored with zero guest disruption.',
    partsRequired: ['Burner Flame Sensor Electrode'],
    diagnosticPhotos: ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80'],
    customerSignature: 'David Kalu (Signed via Mobile Field Companion at 08:32 AM)',
  },
];

const knowledgeDocs: KnowledgeDoc[] = [
  {
    id: 'kb-1',
    title: 'SOP-204: Ultra-Low Temperature Cascade Refrigeration Emergency Triage',
    category: 'SOP',
    tags: ['Cryo', 'Refrigeration', 'Cascade', 'R448A', 'Emergency'],
    snippet: 'Immediate diagnostic steps for -80°C freezers experiencing thermal excursions above -65°C.',
    content: `When ultra-low cryo freezers excursion above -65°C:
1. Verify secondary stage suction pressure: Normal is 12-15 PSIG. If below 5 PSIG, inspect oil separator bypass solenoid.
2. Check inverter DC bus voltage. Voltage sag under 380V will trigger thermal shutdown cycle F-42.
3. If specimen preservation is critical, attach liquid nitrogen (LN2) emergency back-up injection valve immediately.
4. Replace high-pressure sensor and TXV valve if differential exceeds 35 PSI.`,
    lastUpdated: '2026-09-12',
  },
  {
    id: 'kb-2',
    title: 'Siemens G120 & S7-1200 Variable Frequency Fault Resolution Manual',
    category: 'Equipment Manual',
    tags: ['Siemens', 'VFD', 'PLC', 'Inverter', 'F0002'],
    snippet: 'Code F0002 denotes motor overcurrent or earth leakage during acceleration/deceleration ramps.',
    content: `Troubleshooting Siemens G120 Drive Fault F0002:
1. Check motor cable insulation resistance using a 500V Megohmmeter (must be > 5 Megaohms).
2. Inspect parameter P1120 (Ramp-up time). If acceleration is set < 1.8s for high-inertia conveyors, increase to 3.2s.
3. Test braking chopper resistor resistance across terminals DC+ and R-.
4. In wet terminal environments, check moisture condensation inside terminal junction box.`,
    lastUpdated: '2026-10-01',
  },
  {
    id: 'kb-3',
    title: 'Commercial Service Rate Card & Tier Surcharges (FY2026-2027)',
    category: 'Rate Card',
    tags: ['Pricing', 'Billing', 'Rates', 'Overtime', 'Contracts'],
    snippet: 'Standard hourly rates, emergency dispatch multipliers, and parts markup schedules.',
    content: `AetherOps Service Rates:
- Standard Tech Rate: $165.00/hr (billed in 15-min increments after 1st hour).
- Specialized Cryo/Automation Senior Tech: $225.00/hr.
- Emergency Dispatch (SLA < 2 hrs): 1.5x labor multiplier.
- Parts & Materials Markup: Cost + 22% (Enterprise accounts capped at Cost + 12%).
- Holiday/Midnight Emergency Callout: Flat $350 dispatch base + 2.0x hourly.`,
    lastUpdated: '2026-08-01',
  },
  {
    id: 'kb-4',
    title: 'OSHA & Cal/OSHA Lockout/Tagout (LOTO) Zero Energy Compliance',
    category: 'Safety & Compliance',
    tags: ['Safety', 'OSHA', 'LOTO', 'Compliance', 'High Voltage'],
    snippet: 'Mandatory zero-energy state verification procedures before opening electrical cabinets or hydraulic systems.',
    content: `Zero-Energy Verification Protocol:
1. Notify on-duty facility supervisor before isolating mains.
2. Disconnect primary 480V/208V disconnect switch and apply padlocked hasp with technician identifier tag.
3. Discharge all high-capacitance DC bus banks (wait minimum 5 minutes and test with calibrated meter < 10V DC).
4. Depressurize hydraulic accumulators using manual bleed valve until pressure gauge reads 0 PSI.`,
    lastUpdated: '2026-07-15',
  },
];

let workflowRules: WorkflowRule[] = [
  {
    id: 'wf-1',
    name: 'Critical SLA Auto-Dispatch & Tech Route Pairing',
    description: 'When a Critical work order is submitted, find the closest available certified technician with matching truck inventory and dispatch automatically.',
    trigger: 'JOB_CREATED',
    conditions: ['Priority == Critical', 'Technician == null'],
    aiAction: 'AUTO_DISPATCH_OPTIMAL_TECH',
    active: true,
    executionsCount: 38,
    lastRun: '12 minutes ago',
  },
  {
    id: 'wf-2',
    name: 'Smart Post-Service Invoicing & Customer Feedback SMS',
    description: 'Upon job completion, trigger AI line-item validation, format invoice with contract tier discount, and send instant SMS approval request.',
    trigger: 'JOB_COMPLETED',
    conditions: ['Job Status == Completed', 'Signature Captured == true'],
    aiAction: 'GENERATE_INVOICE_AND_SMS',
    active: true,
    executionsCount: 142,
    lastRun: '1 hour ago',
  },
  {
    id: 'wf-3',
    name: 'Predictive Equipment Churn & Maintenance Alert',
    description: 'Scan client equipment age and service history. When equipment exceeds 5 years and has >=2 incidents, notify account manager with upsell proposal.',
    trigger: 'DIAGNOSTIC_SUBMITTED',
    conditions: ['Equipment Age > 5 Years', 'Incident Count >= 2'],
    aiAction: 'TRIGGER_CHURN_PREVENTION',
    active: true,
    executionsCount: 29,
    lastRun: 'Yesterday at 4:15 PM',
  },
  {
    id: 'wf-4',
    name: 'Automated Shift Briefing & Work Order Distillation',
    description: 'Distill technician audio field notes, diagnostic photos, and sensor telemetry into a clean executive summary for client managers.',
    trigger: 'JOB_COMPLETED',
    conditions: ['Customer Tier in [Enterprise, Premium Care]'],
    aiAction: 'GENERATE_AI_WORK_SUMMARY',
    active: true,
    executionsCount: 97,
    lastRun: '2 hours ago',
  },
];

// Helper fallback generator if Gemini API key is missing or offline
function fallbackAIResponse(type: string, payload: any): string {
  if (type === 'chat') {
    const q = (payload.prompt || '').toLowerCase();
    if (q.includes('chiller') || q.includes('cryo') || q.includes('apex')) {
      return `Based on live AetherOps telemetry for **Apex BioLabs**:
- **Work Order**: WO-8849 is currently active under Lead Tech **Alex Rivera** (On Site).
- **Current Status**: Investigating thermal spike (-80°C rising to -68°C) on the ThermoVortex 900X.
- **Recommended Action**: Technicians should inspect secondary stage suction pressure and replace the TXV Expansion Valve R448A (3 units stocked on Truck #1). SLA window expires in 74 minutes.`;
    }
    if (q.includes('dispatch') || q.includes('assign') || q.includes('who')) {
      return `**Autonomous Dispatch Recommendation**:
- **Devon Vance**: Currently En Route to Terminal 4 for Lift VFD fault.
- **Alex Rivera**: On site at Apex BioLabs.
- **Maya Chen**: **Available** in Downtown SF (Rating 4.98, completed 3 jobs today). Best match for pending Job #103 or emergency plumbing/hydraulics.
- **Liam Thorne**: **Available** in SOMA (Rating 4.91). Certified in HVAC & BACnet IoT controllers.`;
    }
    return `Hello! I am **Aether Copilot**, your enterprise field service intelligence engine.
I monitor real-time work orders, technician telematics, parts inventory, and SLA compliance across your service fleet.
You can ask me to:
- "Assign the closest certified tech to WO-8851"
- "Summarize today's completed jobs and total revenue"
- "Check warranty terms or SOP for Siemens G120 VFD errors"
- "Trigger an automated follow-up invoice for Presidio Hotels"`;
  }

  if (type === 'summarize') {
    return JSON.stringify({
      executiveSummary: 'Work order executed swiftly within 1.5 hours. Commercial boiler flame sensor cleaned and burner electrode replaced to eliminate safety ignition lockout. Hot water supply completely normalized for 240 guest rooms.',
      rootCause: 'Carbon accumulation on flame ionization rod accompanied by deteriorated pilot spark electrode lead wire.',
      actionItems: [
        'Perform annual combustion gas analysis during next quarterly inspection.',
        'Replenish 2x Burner Flame Sensor Electrodes in Maya Chen’s truck inventory.',
        'Send verified invoice #INV-2026-8848 to Presidio Hotels accounting.',
      ],
      estimatedBilledHours: 1.5,
      partsTotal: '$120.00',
      laborTotal: '$247.50',
      totalCost: '$367.50',
      customerSentiment: 'Positive / Relieved',
      riskLevel: 'Low',
    });
  }

  if (type === 'recommend') {
    return JSON.stringify({
      bestTechnician: {
        id: 'tech-3',
        name: 'Maya Chen',
        matchScore: 98,
        reasoning: 'Located 1.2 miles away in Downtown SF with available status, 4.98 rating, and full inventory of required differential airflow switches.',
        etaMinutes: 14,
      },
      preventiveAdvice: 'The Carrier AquaForce chiller at Metropolitan Data Centers is approaching its 6-year operational cycle. Recommend proposing a proactive condenser tube descaling package during today’s visit.',
      upsellOpportunity: 'High probability of closing a 2-year Enterprise Extended Warranty upgrade with Vance Logistics (+ $4,200 ARR).',
      slaRisk: 'WO-8849 has 74 minutes remaining before Enterprise SLA penalty. Alex Rivera is currently verifying system pressure on site.',
    });
  }

  return 'OK';
}

// REST Endpoints

// 1. Health & Infrastructure Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    geminiActive: !!process.env.GEMINI_API_KEY,
    services: {
      apiGateway: { status: 'ONLINE', latencyMs: 4, version: 'v2.4.0' },
      postgresCluster: { status: 'ONLINE', activePools: 14, maxConnections: 100, db: 'aether_production_db' },
      redisMessageBus: { status: 'ONLINE', queuedJobs: 3, memoryUsedMb: 42.8 },
      dockerOrchestrator: { status: 'ONLINE', runningNodes: 6, region: 'us-west1-docker' },
      pythonAIService: { status: 'ONLINE', engine: 'Gemini 3.8 / Vector RAG', statusNotes: 'Embeddings Index Synced' },
    },
  });
});

// 2. Customers
app.get('/api/customers', (req: Request, res: Response) => {
  res.json(customers);
});

app.post('/api/customers', (req: Request, res: Response) => {
  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    name: req.body.name || 'New Client',
    company: req.body.company || 'Enterprise Corp',
    email: req.body.email || 'contact@client.com',
    phone: req.body.phone || '+1 (555) 000-0000',
    address: req.body.address || 'San Francisco, CA',
    contractTier: req.body.contractTier || 'Standard SLA',
    lifetimeValue: req.body.lifetimeValue || 0,
    openJobsCount: 0,
    satisfactionScore: 95,
    equipment: req.body.equipment || [],
    lastServiceDate: new Date().toISOString().split('T')[0],
  };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// 3. Jobs / Work Orders
app.get('/api/jobs', (req: Request, res: Response) => {
  res.json(jobs);
});

app.post('/api/jobs', (req: Request, res: Response) => {
  const newJob: Job = {
    id: `job-${Date.now()}`,
    ticketNumber: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
    title: req.body.title || 'Service Ticket',
    customerId: req.body.customerId || 'cust-1',
    customerName: req.body.customerName || 'Apex BioLabs',
    customerAddress: req.body.customerAddress || 'San Francisco, CA',
    technicianId: req.body.technicianId || null,
    technicianName: req.body.technicianName || null,
    priority: req.body.priority || 'Normal',
    status: req.body.technicianId ? 'Dispatched' : 'Unassigned',
    category: req.body.category || 'HVAC',
    scheduledTime: req.body.scheduledTime || new Date().toISOString(),
    estimatedDurationHours: req.body.estimatedDurationHours || 2,
    slaDeadline: req.body.slaDeadline || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    costEstimate: req.body.costEstimate || 550,
    notes: req.body.notes || '',
    partsRequired: req.body.partsRequired || [],
    diagnosticPhotos: req.body.diagnosticPhotos || [],
  };
  jobs.unshift(newJob);
  res.status(201).json(newJob);
});

app.patch('/api/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Job not found' });
  }
  jobs[idx] = { ...jobs[idx], ...req.body };
  res.json(jobs[idx]);
});

// 4. Technicians
app.get('/api/technicians', (req: Request, res: Response) => {
  res.json(technicians);
});

// 5. Workflows
app.get('/api/workflows', (req: Request, res: Response) => {
  res.json(workflowRules);
});

app.post('/api/workflows/trigger', (req: Request, res: Response) => {
  const { workflowId, triggerPayload } = req.body;
  const wf = workflowRules.find((w) => w.id === workflowId);
  if (!wf) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  wf.executionsCount += 1;
  wf.lastRun = 'Just now';

  // Simulate execution outcome
  const steps = [
    { step: 'Trigger Event Received', status: 'SUCCESS', details: `Event ${wf.trigger} received with context` },
    { step: 'Condition Evaluation', status: 'SUCCESS', details: `Conditions evaluated to true: ${wf.conditions.join(', ')}` },
    { step: 'AI Logic Synthesis', status: 'SUCCESS', details: `AI Engine computed payload for action: ${wf.aiAction}` },
    { step: 'Action Execution', status: 'SUCCESS', details: 'Dispatched webhook notifications & database record update' },
  ];

  res.json({
    executionId: `exec-${Date.now()}`,
    workflowName: wf.name,
    timestamp: new Date().toISOString(),
    status: 'COMPLETED',
    steps,
  });
});

// 6. Knowledge Retrieval (Semantic Search & RAG)
app.get('/api/knowledge', (req: Request, res: Response) => {
  res.json(knowledgeDocs);
});

app.post('/api/knowledge/search', async (req: Request, res: Response) => {
  const { query, category } = req.body;
  if (!query) {
    return res.json(knowledgeDocs);
  }

  const q = String(query).toLowerCase();
  let matches = knowledgeDocs.filter(
    (doc) =>
      (!category || category === 'ALL' || doc.category === category) &&
      (doc.title.toLowerCase().includes(q) ||
        doc.snippet.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.tags.some((t) => t.toLowerCase().includes(q)))
  );

  // If AI is available, ask Gemini to rank and synthesize answers
  let aiSummary = '';
  if (ai) {
    try {
      const prompt = `You are the AetherOps Knowledge RAG Assistant. A field technician asked: "${query}".
Given the following service documentation:
${knowledgeDocs.map((d) => `[${d.title}]: ${d.content}`).join('\n\n')}

Provide a direct, concise technical response with exact action steps, safety precautions, and parts needed. Max 3 bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      aiSummary = response.text || '';
    } catch (err) {
      console.error('Gemini Knowledge error:', err);
    }
  }

  if (!aiSummary && matches.length > 0) {
    aiSummary = `Found ${matches.length} matching operational procedures. Highlight: ${matches[0].snippet}`;
  }

  res.json({
    query,
    totalMatches: matches.length,
    results: matches,
    aiSynthesis: aiSummary,
  });
});

// 7. Conversational AI Assistant
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { prompt, conversationHistory = [] } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (ai) {
    try {
      const systemInstruction = `You are Aether Copilot, the AI service operations assistant for AetherOps SaaS platform.
You assist service dispatchers, operations managers, and field technicians for commercial HVAC, electrical, industrial automation, and hydraulics businesses.
Platform state:
- Customers: ${JSON.stringify(customers.map((c) => ({ name: c.name, company: c.company, tier: c.contractTier })))}
- Active Work Orders: ${JSON.stringify(jobs.map((j) => ({ id: j.id, ticket: j.ticketNumber, title: j.title, status: j.status, tech: j.technicianName, priority: j.priority })))}
- Technicians: ${JSON.stringify(technicians.map((t) => ({ name: t.name, status: t.status, rating: t.rating, area: t.location.area })))}

Provide direct, actionable, professional answers. Formulate clear bullet points. Offer next steps (e.g. reassigning jobs, preparing invoices, checking inventory). Never use code comments or fake technical jargon.`;

      const contents = [
        ...conversationHistory.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: prompt }] },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      return res.json({ reply: response.text });
    } catch (err: any) {
      console.error('Gemini Chat error:', err);
      // Fallback gracefully
      return res.json({ reply: fallbackAIResponse('chat', { prompt }) });
    }
  }

  res.json({ reply: fallbackAIResponse('chat', { prompt }) });
});

// 8. AI Summarization Endpoint
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  const { notes, jobTitle, customerName } = req.body;

  if (ai) {
    try {
      const prompt = `Summarize this field service work order:
Job Title: ${jobTitle || 'Field Maintenance'}
Customer: ${customerName || 'Commercial Client'}
Technician Notes: ${notes || 'Cleaned sensor, replaced worn valve, verified system normal.'}

Return a valid JSON object with the following fields:
{
  "executiveSummary": "string (concise 2-sentence summary for the client)",
  "rootCause": "string (technical reason for breakdown)",
  "actionItems": ["array", "of", "concrete", "follow-up", "steps"],
  "estimatedBilledHours": number,
  "partsTotal": "string formatted dollar amount",
  "laborTotal": "string formatted dollar amount",
  "totalCost": "string formatted dollar amount",
  "customerSentiment": "string (e.g. Positive / Delighted, Satisfied, or Needs Follow-up)",
  "riskLevel": "Low" | "Medium" | "High"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.error('Gemini summarize error:', err);
    }
  }

  res.json(JSON.parse(fallbackAIResponse('summarize', { notes, jobTitle })));
});

// 9. AI Smart Recommendations Endpoint
app.post('/api/ai/recommend', async (req: Request, res: Response) => {
  const { jobId } = req.body;
  const targetJob = jobs.find((j) => j.id === jobId) || jobs[0];

  if (ai) {
    try {
      const prompt = `Analyze this unassigned or active work order and recommend the best technician and proactive actions:
Job: ${JSON.stringify(targetJob)}
Available Technicians: ${JSON.stringify(technicians)}

Return a JSON object with:
{
  "bestTechnician": {
    "id": "tech id",
    "name": "tech name",
    "matchScore": number (1-100),
    "reasoning": "why this technician is optimal based on skills, location, and inventory",
    "etaMinutes": number
  },
  "preventiveAdvice": "proactive equipment maintenance tip for this customer",
  "upsellOpportunity": "potential contract upgrade or preventive part replacement",
  "slaRisk": "risk assessment regarding SLA window"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.error('Gemini recommend error:', err);
    }
  }

  res.json(JSON.parse(fallbackAIResponse('recommend', { jobId })));
});

// 10. Operational Analytics
app.get('/api/analytics', (req: Request, res: Response) => {
  res.json({
    totalMonthlyRevenue: 184500,
    revenueGrowthMoM: '+18.4%',
    completedJobsThisMonth: 342,
    firstTimeFixRate: 91.2,
    avgResponseTimeMinutes: 28,
    activeSlaComplianceRate: 98.6,
    technicianUtilizationRate: 88.5,
    categoryBreakdown: [
      { name: 'HVAC & Climate', count: 124, percentage: 36 },
      { name: 'Refrigeration & Cryo', count: 86, percentage: 25 },
      { name: 'Industrial Automation', count: 68, percentage: 20 },
      { name: 'Electrical & Power', count: 42, percentage: 12 },
      { name: 'Hydraulics', count: 22, percentage: 7 },
    ],
    weeklyTrend: [
      { day: 'Mon', jobs: 48, revenue: 24800 },
      { day: 'Tue', jobs: 54, revenue: 29100 },
      { day: 'Wed', jobs: 51, revenue: 26400 },
      { day: 'Thu', jobs: 62, revenue: 33800 },
      { day: 'Fri', jobs: 58, revenue: 31200 },
      { day: 'Sat', jobs: 35, revenue: 19500 },
      { day: 'Sun', jobs: 34, revenue: 19700 },
    ],
  });
});

// Mount Vite or Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AetherOps AI Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
