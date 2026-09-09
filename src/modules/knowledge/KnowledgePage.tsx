// Manufacturing Knowledge Vault
// Symptom, Root Cause & Countermeasure Knowledge Base with AI Adapter Interface

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Tag,
  Wrench,
  Clock,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useData } from '../../core/data/DataContext';
import { useAudit } from '../../core/audit/AuditContext';
import { useAuth } from '../../core/auth/AuthContext';
import { KnowledgeCase } from '../../types';

export const KnowledgePage: React.FC = () => {
  const { knowledgeRepo, aiService, dataVersion, notifyDataChanged } = useData();
  const { recordAudit } = useAudit();
  const { currentUser, currentRole, checkPermission } = useAuth();

  const [cases, setCases] = useState<KnowledgeCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<KnowledgeCase | null>(null);

  // AI Assistant Search State
  const [aiAssistantQuery, setAiAssistantQuery] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Create Case Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [problem, setProblem] = useState('');
  const [lineName, setLineName] = useState('Main Assembly Line 01');
  const [machineName, setMachineName] = useState('Komatsu 600T Press');
  const [processVal, setProcessVal] = useState('Stamping');
  const [category, setCategory] = useState<'TOOLING' | 'ELECTRICAL' | 'PNEUMATICS' | 'QUALITY' | 'OPERATIONAL'>('TOOLING');
  const [symptom, setSymptom] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [countermeasure, setCountermeasure] = useState('');
  const [result, setResult] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [tags, setTags] = useState('sensor, jam');

  useEffect(() => {
    async function loadCases() {
      const allCases = await knowledgeRepo.getCases();
      setCases(allCases);
      if (allCases.length > 0 && !selectedCase) {
        setSelectedCase(allCases[0]);
      }
    }
    loadCases();
  }, [dataVersion, knowledgeRepo, selectedCase]);

  const filteredCases = cases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.problem.toLowerCase().includes(q) ||
      c.symptom.toLowerCase().includes(q) ||
      c.rootCause.toLowerCase().includes(q) ||
      (c.machineName && c.machineName.toLowerCase().includes(q)) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiAssistantQuery.trim()) return;

    setIsAiSearching(true);
    const res = await aiService.findRelevantSolutions(aiAssistantQuery, cases);
    setAiRecommendation(res.synthesizedRecommendation);
    setIsAiSearching(false);

    if (res.matchedCaseIds.length > 0) {
      const matched = cases.find((c) => c.id === res.matchedCaseIds[0]);
      if (matched) setSelectedCase(matched);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim() || !symptom.trim() || !rootCause.trim() || !countermeasure.trim()) return;

    try {
      const created = await knowledgeRepo.createCase({
        problem,
        lineId: 'line-01',
        lineName,
        machineName,
        process: processVal,
        category,
        symptom,
        rootCause,
        countermeasure,
        evidenceNotes: evidenceNotes || 'Logged from shop-floor incident.',
        result: result || 'Eliminated recurring stop; tested for 3 shifts without error.',
        tags: tags.split(',').map((t) => t.trim()),
        createdBy: currentUser?.name || 'Engineer',
        verifiedBy: 'Engineering Manager',
      });

      recordAudit({
        action: 'CREATE',
        module: 'knowledge',
        entity: 'KnowledgeCase',
        entityId: created.caseNumber,
        oldValue: null,
        newValue: `Problem: ${problem}, Machine: ${machineName}`,
        reason: 'Added verified shop-floor troubleshooting standard',
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowCreateModal(false);
      setSelectedCase(created);
      setProblem('');
      setSymptom('');
      setRootCause('');
      setCountermeasure('');
      setResult('');
      setEvidenceNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Tribal Knowledge Retention
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              FOUNDATION ONLY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Manufacturing Knowledge Vault
          </h2>
          <p className="text-xs text-slate-400">
            Structured symptom, root-cause, and countermeasure library preserving critical problem-solving know-how
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!checkPermission('knowledge:create')}
          className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" /> Add Verified Case
        </button>
      </div>

      {/* AI Semantic Troubleshooting Assistant */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-cyan-500/40 rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono">
            AI Troubleshooting Search Assistant (Provider Interface)
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300">
            Local Deterministic Adapter Active
          </span>
        </div>
        <p className="text-xs text-slate-300 mb-3">
          Describe the observed symptom or alarm code to match historical countermeasures instantly.
        </p>

        <form onSubmit={handleAiSearch} className="flex gap-2">
          <input
            type="text"
            value={aiAssistantQuery}
            onChange={(e) => setAiAssistantQuery(e.target.value)}
            placeholder="Describe symptom (e.g. pneumatic sensor delay, feed misalignment, hydraulic overheating)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isAiSearching}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-40"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isAiSearching ? 'Matching...' : 'Query Knowledge Vault'}</span>
          </button>
        </form>

        {aiRecommendation && (
          <div className="mt-3 p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-xs text-cyan-200">
            <span className="font-bold text-cyan-400 block mb-1">Synthesized Recommendation:</span>
            {aiRecommendation}
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Verified Cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, symptom, machine, tags..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-slate-600"
            />
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
            {filteredCases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-amber-400">
                      {c.caseNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{c.category}</span>
                  </div>
                  <h4 className="font-bold text-white mb-1">{c.problem}</h4>
                  <p className="text-slate-400 line-clamp-2 text-[11px] mb-2">{c.symptom}</p>
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Case Detail Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {selectedCase ? (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {selectedCase.caseNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Category: <strong className="text-slate-200">{selectedCase.category}</strong>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedCase.problem}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Location: <strong className="text-slate-200">{selectedCase.lineName}</strong> | Machine: <strong className="text-slate-200">{selectedCase.machineName}</strong>
                </p>
              </div>

              {/* Problem Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-rose-400 font-mono uppercase block mb-1">
                    Observed Symptom
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedCase.symptom}</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-amber-400 font-mono uppercase block mb-1">
                    Root Cause (Ishikawa / 5-Why)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedCase.rootCause}</p>
                </div>
              </div>

              {/* Permanent Countermeasure */}
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-5">
                <span className="text-xs font-bold text-emerald-400 font-mono uppercase block mb-2">
                  Verified Permanent Countermeasure
                </span>
                <p className="text-xs text-slate-100 leading-relaxed whitespace-pre-line">
                  {selectedCase.countermeasure}
                </p>
              </div>

              {/* Verification & Outcome */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs font-bold text-cyan-400 font-mono uppercase block mb-1">
                  Standardization & Measured Result
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedCase.result}</p>
              </div>

              {/* Footer Audit Sign-Off */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Created by: <strong className="text-slate-200">{selectedCase.createdBy}</strong></span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified by {selectedCase.verifiedBy}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              Select a knowledge case from the library to review details.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Verified Case */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white mb-1">
              Add Verified Troubleshooting Standard
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Preserve empirical engineering solutions for machine breakdowns and quality defects.
            </p>

            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Problem Title
                </label>
                <input
                  type="text"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="e.g. Feeder Arm Stroke Misalignment at Indexer"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="TOOLING">TOOLING</option>
                    <option value="ELECTRICAL">ELECTRICAL</option>
                    <option value="PNEUMATICS">PNEUMATICS</option>
                    <option value="QUALITY">QUALITY</option>
                    <option value="OPERATIONAL">OPERATIONAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Machine Name</label>
                  <input
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observed Symptom
                </label>
                <textarea
                  rows={2}
                  value={symptom}
                  onChange={(e) => setSymptom(e.target.value)}
                  placeholder="e.g. Audible chattering noise during advance stroke; machine pauses intermittently."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Verified Root Cause
                </label>
                <textarea
                  rows={2}
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="e.g. Pneumatic regulator diaphragm micro-leak causing pressure drop below 0.55 MPa."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Countermeasure Applied
                </label>
                <textarea
                  rows={2}
                  value={countermeasure}
                  onChange={(e) => setCountermeasure(e.target.value)}
                  placeholder="e.g. Replaced regulator assembly with reinforced model and added monthly pressure drop check."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Search Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. sensor, pneumatic, pressure, stamping"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow"
                >
                  Save Standard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
