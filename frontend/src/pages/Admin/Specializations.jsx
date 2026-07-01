import React, { useEffect, useState } from 'react';
import { Plus, X, Edit2, Check, Tag } from 'lucide-react';
import Spinner from '../../Components/shared/Spinner';
import Modal from '../../Components/shared/Modal';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Specializations = () => {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName]           = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Edit modal
  const [editTarget, setEditTarget]     = useState(null); // { _id, name, description, isActive }
  const [editName, setEditName]         = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/v1/specialization');
      setSpecializations(res.data.specializations || []);
    } catch {
      toast.error('Failed to load specializations');
    } finally {
      setLoading(false);
    }
  };

  // ── CREATE ────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('Please enter a name'); return; }
    setActionLoading(true);
    try {
      const res = await api.post('/v1/specialization', {
        name: newName.trim(),
        description: newDescription.trim(),
      });
      setSpecializations((prev) => [...prev, res.data.specialization]);
      toast.success('Specialization created');
      setShowAddModal(false);
      setNewName('');
      setNewDescription('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setActionLoading(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const openEdit = (spec) => {
    setEditTarget(spec);
    setEditName(spec.name);
    setEditDescription(spec.description || '');
  };

  const handleEdit = async () => {
    if (!editName.trim()) { toast.error('Please enter a name'); return; }
    setActionLoading(true);
    try {
      const res = await api.put(`/v1/specialization/${editTarget._id}`, {
        name: editName.trim(),
        description: editDescription.trim(),
      });
      setSpecializations((prev) =>
        prev.map((s) => (s._id === editTarget._id ? res.data.specialization : s))
      );
      toast.success('Specialization updated');
      setEditTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  // ── TOGGLE ACTIVE ─────────────────────────────────────────────────────────
  const handleToggleActive = async (spec) => {
    try {
      const res = await api.put(`/v1/specialization/${spec._id}`, {
        isActive: !spec.isActive,
      });
      setSpecializations((prev) =>
        prev.map((s) => (s._id === spec._id ? res.data.specialization : s))
      );
      toast.success(`Specialization ${!spec.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/v1/specialization/${deleteTarget._id}`);
      setSpecializations((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      toast.success('Specialization deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const active   = specializations.filter((s) => s.isActive);
  const inactive = specializations.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Specializations</h1>
          <p className="page-subtitle">Manage available medical specializations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:from-violet-700 hover:to-purple-800 transition-all shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total',    value: specializations.length, color: 'text-violet-600' },
          { label: 'Active',   value: active.length,          color: 'text-emerald-600' },
          { label: 'Inactive', value: inactive.length,        color: 'text-slate-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      {specializations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 py-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-14 h-14 bg-violet-50 rounded-full flex items-center justify-center mb-3">
            <Tag className="w-7 h-7 text-violet-400" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">No specializations yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add New" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specializations.map((spec) => (
            <div
              key={spec._id}
              className={`bg-white dark:bg-slate-900 rounded-xl border shadow-sm p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md ${
                spec.isActive
                  ? 'border-slate-100 dark:border-slate-800'
                  : 'border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    spec.isActive ? 'bg-violet-100 dark:bg-violet-900/40' : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    <Tag className={`w-4 h-4 ${spec.isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{spec.name}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  spec.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {spec.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {spec.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{spec.description}</p>
              )}

              <div className="flex items-center gap-2 mt-auto pt-1 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={() => openEdit(spec)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-violet-600 transition-colors px-2 py-1 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleToggleActive(spec)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 transition-colors px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  {spec.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setDeleteTarget(spec)}
                  className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD MODAL ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setNewName(''); setNewDescription(''); }}
        title="Add Specialization"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input"
              placeholder="e.g., Neurology"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="input"
              rows={2}
              placeholder="Optional description..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => { setShowAddModal(false); setNewName(''); setNewDescription(''); }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-medium disabled:opacity-50 hover:from-violet-700 hover:to-purple-800 transition-all"
            >
              {actionLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── EDIT MODAL ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Specialization"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="input"
              rows={2}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setEditTarget(null)} className="btn btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleEdit}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-medium disabled:opacity-50 hover:from-violet-700 hover:to-purple-800 transition-all"
            >
              {actionLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── DELETE CONFIRM MODAL ────────────────────────────────────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Specialization"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{deleteTarget?.name}</span>?
            This cannot be undone, and will fail if doctors are using this specialization.
          </p>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-medium disabled:opacity-50 hover:from-rose-600 hover:to-red-700 transition-all"
            >
              {actionLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Specializations;
