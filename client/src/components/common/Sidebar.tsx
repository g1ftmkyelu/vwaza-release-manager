import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';
import { FaHome, FaPlus, FaList, FaUserShield, FaMusic } from 'react-icons/fa';
import Card from './Card';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = user?.role === 'ARTIST' ? [
    { name: 'Dashboard', icon: FaHome, path: '/artist/dashboard' },
    { name: 'Create Release', icon: FaPlus, path: '/artist/releases/new' },

  ] : user?.role === 'ADMIN' ? [
    { name: 'Dashboard', icon: FaUserShield, path: '/admin/dashboard' },
    { name: 'Review Queue', icon: FaList, path: '/admin/review-queue' }, 
  ] : [];

  return (
    <>
   
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <Card
        className={clsx(
          "glass-sidebar fixed top-0 left-0 h-full w-60 p-4 z-40 transition-transform duration-300 ease-in-out",
          "flex flex-col space-y-4",
          isOpen ? "translate-x-0" : "-translate-x-full",
         
          "md:translate-x-0 md:border-r md:border-white/10 md:top-16 md:h-[calc(100vh-4rem)]" 
        )}
      >
        <nav className="flex-grow">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={toggleSidebar} 
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-md text-gray-300 hover:bg-white/10 hover:text-lime-light transition-colors duration-200",
                    location.pathname === item.path && "bg-lime-accent/20 text-lime-light shadow-lime-glow-sm"
                  )}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Card>
    </>
  );
};

export default Sidebar;