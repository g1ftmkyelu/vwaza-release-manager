import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import clsx from 'clsx';
import { FaUserCircle, FaSignOutAlt, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { APP_LOGO_URL } from '../../utils/constants';
import Card from './Card';
import SearchBar from './SearchBar';

interface PublicHeaderProps {
  toggleSidebar?: () => void; 
  isSidebarOpen?: boolean; 
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
    navigate(`/tracks?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-40 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <Button variant="icon" onClick={toggleSidebar} className="md:hidden text-lime-light">
            {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </Button>
        )}
        <Link to="/" className="text-2xl font-bold text-lime-light glow-text-lime">
          <img src={APP_LOGO_URL} alt="Vwaza Logo" className="h-16" />
        </Link>
      </div>


      <div className="flex-grow max-w-md mx-4 hidden md:block">
        <SearchBar onSearch={handleSearch} placeholder="Search tracks, albums, artists..." />
      </div>

      <div className="relative flex items-center gap-4">

        <Button variant="icon" className="md:hidden text-lime-light">
          <FaSearch size={20} />
        </Button>

        {!isAuthenticated ? (
          <>
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Register</Button>
            </Link>
          </>
        ) : (
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
                  to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/artist/dashboard'}
                  onClick={() => setShowUserMenu(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-lime-light transition-colors duration-200 flex items-center gap-2"
                >
                  <FaUserCircle /> My Dashboard
                </Link>
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
        )}
      </div>
    </header>
  );
};

export default PublicHeader;