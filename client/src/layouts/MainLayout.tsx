
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-bg-primary text-gray-100">

      <Outlet />
    </div>
  );
};

export default MainLayout;