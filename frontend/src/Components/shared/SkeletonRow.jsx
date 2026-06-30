import React from 'react';

const SkeletonRow = ({ columns = 4 }) => {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="flex-1">
          <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonRow;
