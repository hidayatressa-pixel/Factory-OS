// Material & Line-side Kanban Module
// Stock Levels, Shortage Escalation, Kanban Cards & FIFO Sequence Validation

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Barcode,
  Truck,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useData } from '../../core/data/DataContext';
import { useAudit } from '../../core/audit/AuditContext';
import { useAuth } from '../../core/auth/AuthContext';
import {
  MaterialItem,
  MaterialRequest,
} from '../../types';

interface MaterialPageProps {
  selectedLineId: string;
}

export const MaterialPage: React.FC<MaterialPageProps> = ({ selectedLineId }) => {
  const { materialRepo, dataVersion, notifyDataChanged } = useData();
  const { recordAudit } = useAudit();
  const { currentUser, currentRole, checkPermission } = useAuth();

  const [items, setItems] = useState<MaterialItem[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showReplenishModal, setShowReplenishModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaterialItem | null>(null);
  const [reqQty, setReqQty] = useState(100);
  const [reqPriority, setReqPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('NORMAL');

  // Stock Adjust Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');

  // FIFO Verification Test Modal
  const [showFifoModal, setShowFifoModal] = useState(false);
  const [scannedLot, setScannedLot] = useState('');
  const [fifoResult, setFifoResult] = useState<{ valid: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadMaterialData() {
      const [allItems, allReqs] = await Promise.all([
        materialRepo.getItems(),
        materialRepo.getRequests(),
      ]);
      setItems(allItems);
      setRequests(allReqs);
    }
    loadMaterialData();
  }, [dataVersion, materialRepo]);

  const filteredItems = items.filter((item) => {
    if (selectedLineId !== 'ALL' && !item.location.includes(selectedLineId.replace('line-0', 'L-0'))) {
      // allow flexible matching on line location
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.partNumber.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const shortageItems = items.filter((i) => i.status === 'SHORTAGE');
  const lowStockItems = items.filter((i) => i.status === 'LOW_STOCK');

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const req = await materialRepo.createRequest({
        partNumber: selectedItem.partNumber,
        lineId: selectedLineId !== 'ALL' ? selectedLineId : 'line-01',
        requestedQty: Number(reqQty),
        urgency: reqPriority === 'CRITICAL' || reqPriority === 'URGENT' ? 'URGENT' : 'NORMAL',
        requesterName: currentUser?.name || 'Line Operator',
      });

      recordAudit({
        action: 'CREATE',
        module: 'material',
        entity: 'MaterialRequest',
        entityId: req.requestId,
        oldValue: null,
        newValue: `Part: ${selectedItem.partNumber}, Qty: ${reqQty}, Urgency: ${reqPriority}`,
        reason: `Triggered Kanban replenishment to ${selectedItem.location}`,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowReplenishModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustReason.trim()) return;

    try {
      const oldStock = selectedItem.currentStock;
      const updated = await materialRepo.adjustStock(selectedItem.id, Number(adjustQty), adjustReason);

      recordAudit({
        action: 'UPDATE',
        module: 'material',
        entity: 'MaterialItem',
        entityId: selectedItem.partNumber,
        oldValue: `Current Stock: ${oldStock}`,
        newValue: `Current Stock: ${updated.currentStock} (Status: ${updated.status})`,
        reason: adjustReason,
        customUser: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentRole } : undefined,
      });

      notifyDataChanged();
      setShowAdjustModal(false);
      setSelectedItem(null);
      setAdjustReason('');
      setAdjustQty(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyFifo = () => {
    if (!selectedItem || !scannedLot.trim()) return;
    // The expected lot is the activeFifoLot
    const expected = selectedItem.activeFifoLot;
    if (scannedLot.trim().toUpperCase() === expected.toUpperCase()) {
      setFifoResult({
        valid: true,
        message: `VALID FIFO: Scanned lot ${scannedLot.toUpperCase()} matches required oldest active sequence lot.`,
      });
    } else {
      setFifoResult({
        valid: false,
        message: `FIFO VIOLATION: Scanned lot ${scannedLot.toUpperCase()} violates sequence! Required active lot is ${expected}.`,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
              Pull Production & Kanban
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Material & Line-Side Kanban
          </h2>
          <p className="text-xs text-slate-400">
            Real-time buffer stock monitoring, automated replenishment cards, and FIFO lot sequence integrity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search part or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 w-56"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Critical Shortages</span>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            {shortageItems.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Stock depleted below zero buffer</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Low Buffer Warnings</span>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">
            {lowStockItems.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Below required safety stock</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Active Kanban Pulls</span>
          <div className="text-2xl font-black font-mono text-cyan-300 mt-1">
            {requests.filter((r) => r.status !== 'FULFILLED').length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending warehouse replenishment</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-semibold">Total Tracked SKUs</span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {items.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across stamping, welding & assembly</p>
        </div>
      </div>

      {/* Visual Kanban Cards Grid */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-amber-400" />
          <span>Line-Side Kanban Buffer Cards</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const stockPct =
              item.safetyStock > 0
                ? Math.round((item.currentStock / (item.safetyStock * 2)) * 100)
                : 100;

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {item.partNumber}
                      </span>
                      <h4 className="font-bold text-sm text-white leading-tight">
                        {item.description}
                      </h4>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>Location: <strong className="text-slate-200 font-mono">{item.location}</strong></span>
                    <span>WIP: <strong className="text-slate-200 font-mono">{item.wipQuantity} {item.unit}</strong></span>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="my-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Current / Safety:</span>
                      <span className="font-mono font-bold text-white">
                        {item.currentStock} / {item.safetyStock} {item.unit}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${
                          item.status === 'NORMAL'
                            ? 'bg-emerald-500'
                            : item.status === 'LOW_STOCK'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(stockPct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* FIFO lot tag */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 px-2.5 py-1.5 rounded border border-slate-800">
                    <span className="flex items-center gap-1 font-mono">
                      <Barcode className="w-3 h-3 text-cyan-400" /> Active FIFO Lot:
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {item.activeFifoLot}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setScannedLot('');
                      setFifoResult(null);
                      setShowFifoModal(true);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> FIFO Verify
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setAdjustQty(item.currentStock);
                        setShowAdjustModal(true);
                      }}
                      disabled={!checkPermission('material:adjust_stock')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] transition-colors disabled:opacity-40"
                    >
                      Adjust
                    </button>

                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setReqQty(item.safetyStock);
                        setReqPriority(item.status === 'SHORTAGE' ? 'CRITICAL' : 'NORMAL');
                        setShowReplenishModal(true);
                      }}
                      disabled={!checkPermission('material:create_request')}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors disabled:opacity-40"
                    >
                      Call Kanban
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Kanban Pull Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-cyan-400" />
          <span>Active Material Pull Requests & Warehouse Dispatch</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] text-slate-400 uppercase">
                <th className="py-3 px-3">Kanban #</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Part</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Requested By</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-850 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                    {r.requestId}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white whitespace-nowrap">
                    {r.partNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap font-mono">
                    {r.lineId}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-cyan-300 text-right whitespace-nowrap">
                    {r.requestedQty}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={r.urgency} size="sm" showIcon={false} />
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {r.requesterName}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {r.status === 'PENDING' && (
                      <button
                        onClick={async () => {
                          await materialRepo.updateRequestStatus(r.id, 'DELIVERED');
                          notifyDataChanged();
                        }}
                        disabled={!checkPermission('material:dispatch')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors disabled:opacity-40"
                      >
                        Dispatch / Deliver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Call Kanban Replenishment */}
      {showReplenishModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Trigger Kanban Replenishment
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Part: <span className="font-mono text-amber-300 font-bold">{selectedItem.partNumber}</span> to {selectedItem.location}
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Replenishment Quantity ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={reqQty}
                  onChange={(e) => setReqQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL (Line Stop Imminent)</option>
                  <option value="HIGH">HIGH (Below Buffer)</option>
                  <option value="NORMAL">NORMAL (Standard Pull)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplenishModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow"
                >
                  Send Kanban Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Stock with Audit Record */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Adjust Physical Stock Inventory
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              All inventory adjustments require a mandatory reason and are logged to the immutable audit log.
            </p>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Physical On-Hand Stock ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Inventory Adjustment <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Cycle count discrepancy resolved, damaged parts scrapped"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow"
                >
                  Save & Audit Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: FIFO Lot Sequence Validator */}
      {showFifoModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              FIFO Sequence Validation Gate
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Scan material bin barcode to verify First-In-First-Out compliance before loading to production line.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 mb-4 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Target Part:</span>
                <span className="text-white font-bold">{selectedItem.partNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Oldest Active FIFO Lot:</span>
                <span className="text-amber-300 font-bold">{selectedItem.activeFifoLot}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scan / Enter Lot Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedLot}
                    onChange={(e) => setScannedLot(e.target.value)}
                    placeholder={`e.g. ${selectedItem.activeFifoLot}`}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleVerifyFifo}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow"
                  >
                    Verify
                  </button>
                </div>
              </div>

              {fifoResult && (
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    fifoResult.valid
                      ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-700 text-rose-300 font-bold'
                  }`}
                >
                  {fifoResult.message}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFifoModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
