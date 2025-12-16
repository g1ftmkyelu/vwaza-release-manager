import React from 'react';
import { Outlet } from 'react-router-dom';
import { APP_LOGO_URL } from '../utils/constants';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg-primary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-2">
          <img src={APP_LOGO_URL} alt="Vwaza Logo" className="h-32 mx-auto " />
          <p className="text-gray-400  text-lg">Release your music to the world.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;