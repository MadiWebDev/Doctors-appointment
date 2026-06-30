import React from 'react';

const Spinner = ({ fullPage = false }) => {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'min-h-screen' : 'h-64'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
};

export default Spinner;
