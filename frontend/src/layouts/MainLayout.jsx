import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/Components/NavBar/NavBar";
import Footer from "@/Components/Footer/Footer";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
