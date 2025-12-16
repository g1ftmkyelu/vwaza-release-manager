import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../components/common/PublicHeader'; 

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg-primary">
      <PublicHeader /> 
      <main className="flex-1 p-4 md:p-6 pt-20"> 
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;