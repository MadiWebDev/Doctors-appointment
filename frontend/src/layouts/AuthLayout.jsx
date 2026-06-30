import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Stethoscope } from "lucide-react";

const AuthLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background">
      {/* Left side - Branding/Illustration */}
      <div className="hidden md:flex flex-col justify-center items-center bg-primary/5 p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-3xl" />
        </div>
        
        <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 text-primary">
          <Stethoscope className="w-8 h-8" />
          <span className="text-xl font-display font-bold">MediConnect</span>
        </Link>
        
        <div className="max-w-md z-10 text-center space-y-6">
          <img 
            src="/auth-illustration.svg" 
            alt="Healthcare" 
            className="w-full max-w-[320px] mx-auto mb-8 drop-shadow-xl"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-display font-bold text-foreground">
            Your Health, Our Priority
          </h1>
          <p className="text-muted-foreground">
            Connect with top doctors, manage your appointments, and take control of your healthcare journey.
          </p>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 h-full overflow-y-auto">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="md:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center space-x-2 text-primary">
              <Stethoscope className="w-8 h-8" />
              <span className="text-2xl font-display font-bold">MediConnect</span>
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
