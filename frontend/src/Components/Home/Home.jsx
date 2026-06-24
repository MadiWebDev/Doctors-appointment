import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="max-h-full max-w-full">
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center h-full w-full bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center justify-center h-1/2 w-1/2">
            <img src="./sethoscope.jpeg" className="h-1/2 w-1/2" />
          </div>
          <div className="flex flex-col items-center justify-center h-1/2 w-1/2">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome to the home page
            </h1>
            <p className="text-xl text-gray-600">
              This is the home page of the application
            </p>
            <Link
              to="/signUp"
              className="text-lg p-2.5 underline rounded-md font-semibold leading-6 text-gray-900 hover:text-[#7e3e4a]"
            >
              Register Yourself First
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
