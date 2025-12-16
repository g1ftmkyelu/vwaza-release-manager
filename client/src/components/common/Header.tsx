import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import clsx from 'clsx';
import { FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { APP_LOGO_URL } from '../../utils/constants';
import Card from './Card'; 

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    let breadcrumbs: { name: string; path: string }[] = [];

    if (user?.role === 'ARTIST') {
      breadcrumbs.push({ name: 'Artist Dashboard', path: '/artist/dashboard' });
    } else if (user?.role === 'ADMIN') {
      breadcrumbs.push({ name: 'Admin Dashboard', path: '/admin/dashboard' });
    }

    pathnames.forEach((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const displayName = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      // Special handling for IDs
      if (name.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {

        const prevName = pathnames[index - 1];
        if (prevName === 'releases') {
          breadcrumbs.push({ name: 'Release Details', path: routeTo });
        } else if (prevName === 'review') {
          breadcrumbs.push({ name: 'Review', path: routeTo });
        } else {
          breadcrumbs.push({ name: 'Details', path: routeTo });
        }
      } else if (displayName === 'New') {
        breadcrumbs.push({ name: 'Create New Release', path: routeTo });
      } else if (displayName === 'Review') {
        breadcrumbs.push({ name: 'Review Release', path: routeTo });
      } else if (displayName === 'Profile') { 
        breadcrumbs.push({ name: 'My Profile', path: routeTo });
      }
      else {
        breadcrumbs.push({ name: displayName, path: routeTo });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="icon" onClick={toggleSidebar} className="md:hidden text-lime-light">
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </Button>
        <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/artist/dashboard'} className="text-2xl font-bold text-lime-light glow-text-lime">
          <img src={APP_LOGO_URL} alt="Vwaza Logo" className="h-16" />
        </Link>
      </div>

      <nav className="hidden md:flex items-center space-x-2 text-gray-300">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <span className="text-gray-500">/</span>}
            <Link
              to={crumb.path}
              className={clsx(
                "hover:text-lime-light transition-colors duration-200",
                index === breadcrumbs.length - 1 ? "text-lime-light font-semibold" : ""
              )}
            >
              {crumb.name}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      <div className="relative">
        <Button variant="icon" onClick={() => setShowUserMenu(!showUserMenu)} className="text-lime-light">
          <FaUserCircle size={24} />
        </Button>
        {showUserMenu && (
          <Card className="absolute right-0 mt-2 w-48 py-2 rounded-md shadow-lg z-50">
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-white/10">
              Signed in as <span className="font-semibold text-lime-light">{user?.email}</span>
            </div>
         
            <Link
              to="/profile"
              onClick={() => setShowUserMenu(false)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-lime-light transition-colors duration-200 flex items-center gap-2"
            >
              <FaUserCircle /> Profile
            </Link>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 rounded-none"
            >
              <FaSignOutAlt /> Logout
            </Button>
          </Card>
        )}
      </div>
    </header>
  );
};

export default Header;