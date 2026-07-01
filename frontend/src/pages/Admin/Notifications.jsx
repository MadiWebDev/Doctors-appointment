import React, { useEffect, useState, useCallback } from 'react';
import {
  Bell, Check, CheckCheck, Trash2, Send, Search,
  Filter, Calendar, Clock, User, AlertCircle,
  Stethoscope, RefreshCw, ChevronLeft, ChevronRight,
  Megaphone, X,
} from 'lucide-react';
import Modal from '../../Components/shared/Modal';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const formatDateTime = (d) => {
  if (!d) return '';
  try {
    const dt = typeof d === 'string' ? parseISO(d) : new Date(d);
    return format(dt, 'MMM dd, yyyy · hh:mm a');
  } catch { return ''; }
};

const TYPE_CONFIG = {
  appointment_booked:      { label: 'Booked',      icon: Calendar,     color: 'bg-blue-100 text-blue-600' },
  appointment_confirmed:   { label: 'Confirmed',   icon: Calendar,     color: 'bg-emerald-100 text-emerald-600' },
  appointment_cancelled:   { label: 'Cancelled',   icon: Calendar,     color: 'bg-rose-100 text-rose-600' },
  appointment_rescheduled: { label: 'Rescheduled', icon: Calendar,     color: 'bg-orange-100 text-orange-600' },
  appointment_reminder:    { label: 'Reminder',    icon: Clock,        color: 'bg-yellow-100 text-yellow-600' },
  appointment_completed:   { label: 'Completed',   icon: Calendar,     color: 'bg-teal-100 text-teal-600' },
  payment_received:        { label: 'Payment',     icon: Calendar,     color: 'bg-green-100 text-green-600' },
  doctor_verified:         { label: 'Verified',    icon: Stethoscope,  color: 'bg-emerald-100 text-emerald-600' },
  doctor_rejected:         { label: 'Rejected',    icon: Stethoscope,  color: 'bg-rose-100 text-rose-600' },
  new_review:              { label: 'Review',      icon: User,         color: 'bg-purple-100 text-purple-600' },
  message_received:        { label: 'Message',     icon: Bell,         color: 'bg-slate-100 text-slate-600' },
  system:                  { label: 'System',      icon: AlertCircle,  color: 'bg-violet-100 text-violet-600' },
};

const PRIORITY_BADGE = {
  low:    'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const TYPES    = Object.keys(TYPE_CONFIG);
const LIMIT    = 15;
const TARGETS  = [
  { value: 'all',      label: 'All Users' },
  { value: 'patients', label: 'Patients only' },
  { value: 'doctors',  label: 'Doctors only' },
  { value: 'user',     label: 'Specific user (by ID)' },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
const AdminNotifications = () => {
  /* list state */
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [total, setTotal]                 = useState(0);
  const [unreadTotal, setUnreadTotal]     = useState(0);
  const [page, setPage]                   = useState(1);

  /* filters */
  const [search, setSearch]       = useState('');
  const [filterType, setFilterType]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterRead, setFilterRead]     = useState('');
  const [showFilters, setShowFilters]   = useState(false);

  /* broadcast modal */
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcast, setBroadcast]         = useState({
    title: '', message: '', priority: 'medium', target: 'all', userId: '',
  });
  const [sending, setSending] = useState(false);

  /* delete confirm */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  /* bulk cleanup */
  const [bulkDays, setBulkDays]   = useState(30);
  const [cleaning, setCleaning]   = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */
  const fetchNotifications = useCallback(async (opts = {}) => {
    const isRefresh = opts.refresh;
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await api.get('/v1/admin/notifications', {
        params: {
          page,
          limit: LIMIT,
          ...(search       ? { search }         : {}),
          ...(filterType   ? { type: filterType } : {}),
          ...(filterPriority ? { priority: filterPriority } : {}),
          ...(filterRead !== '' ? { isRead: filterRead } : {}),
        },
      });
      setNotifications(res.data.notifications || []);
      setTotal(res.data.pagination?.total || 0);
      setUnreadTotal(res.data.unreadTotal || 0);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, filterType, filterPriority, filterRead]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  /* Reset page when filters change */
  useEffect(() => { setPage(1); }, [search, filterType, filterPriority, filterRead]);

  /* ── Delete single ─────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/v1/admin/notifications/${deleteTarget._id}`);
      toast.success('Notification deleted');
      setDeleteTarget(null);
      fetchNotifications({ refresh: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Bulk cleanup ──────────────────────────────────────────────────────── */
  const handleBulkClean = async () => {
    setCleaning(true);
    try {
      const res = await api.delete('/v1/admin/notifications/bulk-delete', {
        params: { days: bulkDays },
      });
      toast.success(res.data.message);
      fetchNotifications({ refresh: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cleanup failed');
    } finally {
      setCleaning(false);
    }
  };

  /* ── Broadcast ─────────────────────────────────────────────────────────── */
  const handleBroadcast = async () => {
    if (!broadcast.title.trim() || !broadcast.message.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (broadcast.target === 'user' && !broadcast.userId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/v1/admin/notifications/broadcast', broadcast);
      toast.success(res.data.message);
      setShowBroadcast(false);
      setBroadcast({ title: '', message: '', priority: 'medium', target: 'all', userId: '' });
      fetchNotifications({ refresh: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Broadcast failed');
    } finally {
      setSending(false);
    }
  };

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            All platform notifications ·{' '}
            <span className="text-rose-500 font-semibold">{unreadTotal} unread</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchNotifications({ refresh: true })}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-medium rounded-xl hover:from-violet-700 hover:to-purple-800 transition-all shadow-sm"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',   value: total,        color: 'text-slate-900 dark:text-white' },
          { label: 'Unread',  value: unreadTotal,   color: 'text-rose-600' },
          { label: 'Read',    value: total - unreadTotal, color: 'text-emerald-600' },
          { label: 'Page',    value: `${page} / ${totalPages || 1}`, color: 'text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recipient, title or message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-colors ${
              showFilters || filterType || filterPriority || filterRead !== ''
                ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 text-violet-700 dark:text-violet-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Type */}
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">All types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_CONFIG[t]?.label || t}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">All priorities</option>
                {['low', 'medium', 'high', 'urgent'].map((p) => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </select>
            </div>

            {/* Read status */}
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Read status</label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="">All</option>
                <option value="false">Unread</option>
                <option value="true">Read</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Notifications list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/30 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-violet-400" />
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">No notifications found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {notifications.map((n) => {
              const cfg      = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
              const Icon     = cfg.icon;
              const isUnread = !n.isRead;

              return (
                <div
                  key={n._id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    isUnread ? 'border-l-4 border-violet-500 bg-violet-50/30 dark:bg-violet-900/10' : ''
                  }`}
                >
                  {/* Type icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-0.5">
                      <p className={`text-sm font-semibold leading-snug ${
                        isUnread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {n.title}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${PRIORITY_BADGE[n.priority] || PRIORITY_BADGE.medium}`}>
                        {n.priority}
                      </span>
                      {isUnread && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>

                    {/* Recipient row */}
                    {n.recipient && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Avatar name={n.recipient.name} size="sm" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {n.recipient.name}
                          <span className="ml-1 opacity-60">({n.recipient.role})</span>
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-violet-500 mt-0.5" title="Unread" />
                    )}
                    <button
                      onClick={() => setDeleteTarget(n)}
                      className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk cleanup */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Bulk Cleanup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Delete all <span className="font-medium">read</span> notifications older than the selected number of days.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={bulkDays}
              onChange={(e) => setBulkDays(Number(e.target.value))}
              className="text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {[7, 14, 30, 60, 90].map((d) => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
            <button
              onClick={handleBulkClean}
              disabled={cleaning}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {cleaning ? 'Cleaning…' : 'Run Cleanup'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Broadcast Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Send Broadcast Notification" size="md">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
            <Megaphone className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-violet-700 dark:text-violet-300">
              This will create a <strong>system</strong> notification for every matched recipient simultaneously.
            </p>
          </div>

          <div>
            <label className="label">Target audience</label>
            <select
              value={broadcast.target}
              onChange={(e) => setBroadcast({ ...broadcast, target: e.target.value, userId: '' })}
              className="input"
            >
              {TARGETS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {broadcast.target === 'user' && (
            <div>
              <label className="label">User ID</label>
              <input
                type="text"
                value={broadcast.userId}
                onChange={(e) => setBroadcast({ ...broadcast, userId: e.target.value })}
                className="input font-mono text-sm"
                placeholder="MongoDB ObjectId…"
              />
            </div>
          )}

          <div>
            <label className="label">Priority</label>
            <select
              value={broadcast.priority}
              onChange={(e) => setBroadcast({ ...broadcast, priority: e.target.value })}
              className="input capitalize"
            >
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={broadcast.title}
              onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
              className="input"
              placeholder="e.g. Scheduled maintenance"
              maxLength={100}
            />
          </div>

          <div>
            <label className="label">Message <span className="text-rose-500">*</span></label>
            <textarea
              value={broadcast.message}
              onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
              className="input"
              rows={4}
              placeholder="Write the notification message…"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{broadcast.message.length}/500</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setShowBroadcast(false)}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleBroadcast}
              disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-800 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending…' : 'Send Broadcast'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete confirm ──────────────────────────────────────────────────── */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Notification" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to permanently delete the notification{' '}
            <span className="font-semibold text-slate-900 dark:text-white">"{deleteTarget?.title}"</span>?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="btn btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-red-700 transition-all disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminNotifications;
