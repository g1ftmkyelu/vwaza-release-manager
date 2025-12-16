import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  // Redirect to public home if not authenticated, otherwise to their dashboard
  const homePath = isAuthenticated ? (user?.role === 'ADMIN' ? '/admin/dashboard' : '/artist/dashboard') : '/';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-bg-primary text-gray-100 p-4 text-center">
      <FaExclamationTriangle className="text-lime-accent text-8xl mb-6 glow-text-lime" />
      <h1 className="text-5xl font-bold mb-4 text-lime-light glow-text-lime">404 - Page Not Found</h1>
      <p className="text-xl text-gray-300 mb-8">
        Oops! The page you are looking for does not exist.
      </p>
      <Link to={homePath}>
        <Button variant="primary">Go to Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;