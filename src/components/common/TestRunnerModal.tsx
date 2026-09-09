// In-App Automated Test Runner Modal
// FACTORY OS - One Platform for the Shop Floor
// Validates pure business logic, calculations, status transitions, and RBAC rules

import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';
import { runFactoryOsBusinessLogicTests, TestResult } from '../../core/tests/businessLogic';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runFactoryOsBusinessLogicTests();
      setResults(res);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen && results.length === 0) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  // Group by suite
  const suites: Record<string, TestResult[]> = {};
  results.forEach((r) => {
    if (!suites[r.suite]) suites[r.suite] = [];
    suites[r.suite].push(r);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Pure Business Logic Verification Suite
              </h3>
              <p className="text-xs text-slate-400">
                Unit verification for shop-floor calculations, transitions, RBAC, and lifecycle rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Banner */}
        <div className="px-6 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold">
              Status:
              {allPassed ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCheck className="w-4 h-4" /> All Tests Passed ({passedCount}/{totalCount})
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-bold">
                  {passedCount}/{totalCount} Passed
                </span>
              )}
            </span>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors disabled:opacity-50 text-xs shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            Re-run Tests
          </button>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {Object.entries(suites).map(([suiteName, tests]) => (
            <div key={suiteName} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                <span>{suiteName}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {tests.filter((t) => t.passed).length}/{tests.length} OK
                </span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {tests.map((test, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2.5 flex items-start justify-between gap-3 text-xs hover:bg-slate-900/50"
                  >
                    <div className="flex items-start gap-2.5">
                      {test.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${test.passed ? 'text-slate-200' : 'text-rose-300'}`}>
                          {test.name}
                        </p>
                        {test.error && (
                          <p className="text-[11px] text-rose-400 font-mono mt-1 bg-rose-950/40 p-1.5 rounded border border-rose-900/60">
                            {test.error}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {test.durationMs}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Zero external mocks required • Pure deterministic execution</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
