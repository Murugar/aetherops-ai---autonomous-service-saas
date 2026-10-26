import React, { useState } from 'react';
import {
  Server,
  Database,
  Cpu,
  Layers,
  Terminal,
  Play,
  CheckCircle2,
  HardDrive,
  Cloud,
  Box,
  Radio,
  Code2,
} from 'lucide-react';

export const InfrastructureView: React.FC = () => {
  const [activeApiEndpoint, setActiveApiEndpoint] = useState<string>('/api/health');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'topology' | 'explorer' | 'schema' | 'docker'>('topology');

  const testEndpoints = [
    { method: 'GET', path: '/api/health', desc: 'System health check and live service cluster status' },
    { method: 'GET', path: '/api/customers', desc: 'Enterprise accounts and registered equipment assets' },
    { method: 'GET', path: '/api/jobs', desc: 'Active work orders, assigned technicians, and SLA times' },
    { method: 'GET', path: '/api/technicians', desc: 'Field technician roster with GPS coordinates and van inventory' },
    { method: 'GET', path: '/api/knowledge', desc: 'Vector-indexed SOPs and equipment manuals' },
    { method: 'GET', path: '/api/analytics', desc: 'Operational revenue, SLA compliance, and dispatch yield' },
  ];

  const handleExecuteApi = async (path: string) => {
    setActiveApiEndpoint(path);
    setApiLoading(true);
    setApiResponse(null);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setApiResponse({ status: res.status, data });
    } catch (err: any) {
      setApiResponse({ status: 500, error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Cloud Infrastructure & Backend Microservices
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Multi-tier architecture topology: React SPA, Flutter Mobile, Node.js API Gateway, Python AI services, PostgreSQL, and Docker container mesh.
        </p>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-lg border border-slate-800 w-fit">
        {[
          { id: 'topology', label: 'Architecture Topology' },
          { id: 'explorer', label: 'Interactive REST API Explorer' },
          { id: 'schema', label: 'PostgreSQL Relational Schema' },
          { id: 'docker', label: 'Docker & Deployment Spec' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-1.5 text-xs rounded-md font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. Topology Diagram View */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Frontend Tier */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>01. Client Presentation Tier</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200">Web Operations Hub</div>
                  <div className="text-[11px] text-slate-400">React 19 · Vite 8 · Tailwind CSS v4</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200">Mobile Field Companion</div>
                  <div className="text-[11px] text-slate-400">Flutter / React Native · Offline SQLite Queue</div>
                </div>
              </div>
            </div>

            {/* Application & Microservices Tier */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <Server className="w-4 h-4" />
                <span>02. Microservices Tier</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200">API Gateway & Dispatch Core</div>
                  <div className="text-[11px] text-slate-400">Node.js / Express · tsx · RESTful Endpoints</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200">Python AI Service (FastAPI)</div>
                  <div className="text-[11px] text-slate-400">Gemini 3.8 Flash SDK · LangChain · Vector RAG</div>
                </div>
              </div>
            </div>

            {/* Persistence & Data Tier */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <Database className="w-4 h-4" />
                <span>03. Data & Queue Tier</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200">PostgreSQL Primary Cluster</div>
                  <div className="text-[11px] text-slate-400">ACID Relational Engine · Connection Pooling</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200">Redis Message Broker</div>
                  <div className="text-[11px] text-slate-400">Asynchronous Job Queue & WebSocket Pub/Sub</div>
                </div>
              </div>
            </div>
          </div>

          {/* Docker & Cloud Infrastructure Overview */}
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Cloud Container Orchestration (AWS ECS / GCP Cloud Run)
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                CONTAINERS: 6 RUNNING
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">web-client-pod</div>
                <div className="text-emerald-400 font-semibold mt-0.5">HEALTHY</div>
                <div className="text-slate-500 text-[10px] font-mono mt-1">CPU: 4% · RAM: 142MB</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">api-gateway-service</div>
                <div className="text-emerald-400 font-semibold mt-0.5">HEALTHY</div>
                <div className="text-slate-500 text-[10px] font-mono mt-1">CPU: 12% · RAM: 210MB</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">python-ai-worker</div>
                <div className="text-emerald-400 font-semibold mt-0.5">HEALTHY</div>
                <div className="text-slate-500 text-[10px] font-mono mt-1">CPU: 28% · RAM: 580MB</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">postgres-statefulset</div>
                <div className="text-emerald-400 font-semibold mt-0.5">HEALTHY</div>
                <div className="text-slate-500 text-[10px] font-mono mt-1">CPU: 9% · RAM: 430MB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive REST API Explorer */}
      {activeTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Endpoint selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Available Backend Endpoints</h3>
            <div className="space-y-2">
              {testEndpoints.map((ep) => (
                <div
                  key={ep.path}
                  onClick={() => handleExecuteApi(ep.path)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activeApiEndpoint === ep.path
                      ? 'bg-slate-900 border-cyan-500 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded text-[10px] border border-emerald-800">
                        {ep.method}
                      </span>
                      <span className="font-mono text-slate-200 font-semibold">{ep.path}</span>
                    </div>
                    <Play className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ep.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Response Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400">Endpoint:</span>
                <span className="text-cyan-400 font-semibold">{activeApiEndpoint}</span>
              </div>
              {apiResponse && (
                <span className="text-emerald-400 font-mono font-bold">
                  HTTP {apiResponse.status}
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-auto max-h-[420px]">
              {apiLoading ? (
                <div className="text-slate-500 italic">Executing query against server...</div>
              ) : apiResponse ? (
                <pre>{JSON.stringify(apiResponse.data, null, 2)}</pre>
              ) : (
                <div className="text-slate-500 italic">Select an endpoint on the left to inspect real-time JSON payload.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PostgreSQL Relational Schema */}
      {activeTab === 'schema' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">
              PostgreSQL DDL & Relational Schema (aether_production_db)
            </h3>
            <span className="text-xs font-mono text-cyan-400">PostgreSQL 16.4</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
{`-- Enterprise Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    primary_contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    service_address TEXT NOT NULL,
    contract_tier VARCHAR(50) NOT NULL CHECK (contract_tier IN ('Enterprise', 'Premium Care', 'Standard SLA')),
    lifetime_value NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Field Service Technicians
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Available', 'En Route', 'On Site', 'Off Duty')),
    specialties TEXT[] NOT NULL,
    current_lat NUMERIC(9, 6),
    current_lng NUMERIC(9, 6),
    customer_rating NUMERIC(3, 2) DEFAULT 5.00
);

-- Work Orders & Tickets
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Critical', 'High', 'Normal', 'Low')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Unassigned', 'Dispatched', 'En Route', 'In Progress', 'Completed', 'Invoiced')),
    category VARCHAR(100) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    cost_estimate NUMERIC(10, 2),
    technician_notes TEXT,
    customer_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
          </div>
        </div>
      )}

      {/* 4. Docker & Deployment Spec */}
      {activeTab === 'docker' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">
              docker-compose.production.yml Configuration
            </h3>
            <span className="text-xs font-mono text-cyan-400">Docker Engine 26.0+</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
{`version: '3.8'

services:
  app-gateway:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - DATABASE_URL=postgresql://aether:\${POSTGRES_PASSWORD}@postgres:5432/aether_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: always

  python-ai-service:
    build:
      context: ./python-ai
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    restart: always

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: aether
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: aether_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

volumes:
  postgres_data:`}
          </div>
        </div>
      )}
    </div>
  );
};
