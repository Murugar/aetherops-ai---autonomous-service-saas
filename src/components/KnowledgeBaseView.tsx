import React, { useState } from 'react';
import { KnowledgeDoc } from '../types';
import {
  Search,
  BookOpen,
  Sparkles,
  Tag,
  Clock,
  Shield,
  FileText,
  ChevronRight,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface KnowledgeBaseViewProps {
  initialDocs: KnowledgeDoc[];
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({ initialDocs }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [docs, setDocs] = useState<KnowledgeDoc[]>(initialDocs);
  const [aiSynthesis, setAiSynthesis] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [activeDoc, setActiveDoc] = useState<KnowledgeDoc | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, category: selectedCategory }),
      });
      const data = await res.json();
      setDocs(data.results || []);
      setAiSynthesis(data.aiSynthesis || '');
    } catch (err) {
      console.error('Semantic search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const sampleQueries = [
    'How do I troubleshoot Siemens G120 F0002 fault?',
    'Cascade refrigeration -80C emergency protocol',
    'What is our emergency hourly rate for enterprise clients?',
    'LOTO zero energy capacitor discharge rules',
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          Semantic Knowledge Retrieval & Field SOPs
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          RAG-indexed vector search across OEM manuals, emergency standard operating procedures, and safety compliance.
        </p>
      </div>

      {/* Semantic Search Box */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a technical service question, symptom, or search SOPs (e.g. 'suction pressure on R448A cascade')..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-32 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-md"
          />
          <button
            type="submit"
            disabled={searching}
            className="absolute right-2 top-2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {searching ? 'Synthesizing...' : 'Search RAG'}
          </button>
        </div>

        {/* Quick query tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Suggested queries:</span>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(q);
                // Trigger immediate search with this query
                setTimeout(() => {
                  fetch('/api/knowledge/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: q, category: selectedCategory }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      setDocs(data.results || []);
                      setAiSynthesis(data.aiSynthesis || '');
                    });
                }, 50);
              }}
              className="text-slate-400 hover:text-cyan-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800 text-[11px] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </form>

      {/* AI Technical Synthesis Panel */}
      {aiSynthesis && (
        <div className="p-5 bg-slate-900/90 border border-cyan-800/80 rounded-2xl space-y-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Technical Retrieval Synthesis</span>
          </div>
          <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-normal">
            {aiSynthesis}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900/90 rounded-lg border border-slate-800">
        {['ALL', 'SOP', 'Equipment Manual', 'Rate Card', 'Safety & Compliance'].map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              // search with updated category
              fetch('/api/knowledge/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, category: cat }),
              })
                .then((res) => res.json())
                .then((data) => {
                  setDocs(data.results || []);
                });
            }}
            className={`px-3 py-1.5 text-xs rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-800 text-cyan-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'ALL' ? 'All Documentation' : cat}
          </button>
        ))}
      </div>

      {/* Docs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setActiveDoc(doc)}
            className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 transition-all cursor-pointer space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                {doc.category}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {doc.lastUpdated}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-100 hover:text-cyan-300 transition-colors">
              {doc.title}
            </h3>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {doc.snippet}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex flex-wrap gap-1">
                {doc.tags.map((t) => (
                  <span key={t} className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Doc Modal Reader */}
      {activeDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  {activeDoc.category}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">
                  {activeDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDoc(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Close
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {activeDoc.content}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verified by Engineering SOP Committee</span>
              </div>
              <span>Last revised: {activeDoc.lastUpdated}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
