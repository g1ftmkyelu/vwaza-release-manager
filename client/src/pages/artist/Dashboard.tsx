import React from 'react';
import StatusTracker from '../../components/artist/StatusTracker';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const ArtistDashboard: React.FC = () => {
  return (
    <div className="min-h-full bg-dark-bg-primary text-gray-100">
      <div className="flex justify-end mb-6">
        <Link to="/artist/releases/new">
          <Button variant="primary" className="flex items-center gap-2">
            <FaPlus /> Create New Release
          </Button>
        </Link>
      </div>
      <StatusTracker />
    </div>
  );
};

export default ArtistDashboard;