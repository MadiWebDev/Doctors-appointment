import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ message = 'No data found' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="w-16 h-16 text-slate-300 mb-4" />
      <p className="text-slate-500">{message}</p>
    </div>
  );
};

export default EmptyState;
