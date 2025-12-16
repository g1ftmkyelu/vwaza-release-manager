import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import clsx from 'clsx';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg-primary">
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> 

      <div className="flex flex-1 pt-16 md:pl-60"> 
        <main
          className={clsx(
            "flex-1 p-4 md:p-6 transition-all duration-300 ease-in-out"

          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;