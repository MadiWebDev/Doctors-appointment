import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
 return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
        <div className="mb-4">
          <h1 className="text-gray-900 font-bold text-xl mb-2">Oops!</h1>
          <p className="text-gray-700 text-base">
            Something went wrong. Please try again later.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Link to="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go Home
          </Link>
          <Link to="/contact" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
 );
};

export default ErrorPage;
