import React, { useEffect } from 'react';
import { Bell, Check, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from '../../features/notifications/notificationSlice';
import Spinner from '../../Components/shared/Spinner';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    return format(d, 'MMM dd, yyyy · hh:mm a');
  } catch {
    return '';
  }
};

const typeConfig = {
  appointment_booked:    { icon: Calendar,     bg: 'bg-blue-100',   text: 'text-blue-600' },
  appointment_confirmed: { icon: Calendar,     bg: 'bg-green-100',  text: 'text-green-600' },
  appointment_cancelled: { icon: Calendar,     bg: 'bg-red-100',    text: 'text-red-600' },
  appointment_completed: { icon: Calendar,     bg: 'bg-teal-100',   text: 'text-teal-600' },
  appointment_reminder:  { icon: Clock,        bg: 'bg-yellow-100', text: 'text-yellow-600' },
  doctor_verified:       { icon: User,         bg: 'bg-green-100',  text: 'text-green-600' },
  doctor_rejected:       { icon: User,         bg: 'bg-red-100',    text: 'text-red-600' },
  message_received:      { icon: Bell,         bg: 'bg-slate-100',  text: 'text-slate-600' },
  system:                { icon: AlertCircle,  bg: 'bg-slate-100',  text: 'text-slate-600' },
};

const Notifications = () => {
  const dispatch = useDispatch();
  const { list: notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markAsRead(id)).unwrap();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllAsRead()).unwrap();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  if (loading && notifications.length === 0) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Stay updated with your appointments</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => {
              const cfg = typeConfig[notification.type] || typeConfig.system;
              const IconComponent = cfg.icon;
              const isUnread = !notification.isRead;

              return (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                    isUnread ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                  }`}
                  onClick={() => isUnread && handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.text}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification._id);
                            }}
                            className="p-1 text-slate-400 hover:text-primary-600 flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
