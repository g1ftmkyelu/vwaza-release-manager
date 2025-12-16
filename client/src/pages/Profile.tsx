import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FaUserCircle, FaEnvelope, FaUserTag } from 'react-icons/fa';

const Profile: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg-primary">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-red-500 text-center mt-20">
        You must be logged in to view your profile.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-lime-light glow-text-lime mb-8 text-center">My Profile</h1>

      <Card className="p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <FaUserCircle className="text-lime-accent text-7xl" />
          <h2 className="text-3xl font-semibold text-gray-50">{user.email}</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-300">
            <FaEnvelope className="text-lime-light" />
            <span className="font-medium">Email:</span>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <FaUserTag className="text-lime-light" />
            <span className="font-medium">Role:</span>
            <span>{user.role}</span>
          </div>
        </div>

        {/* Potentially add more user details or options here */}
        {/* For now, just basic info */}
      </Card>
    </div>
  );
};

export default Profile;