import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { FaUsers, FaChartBar, FaList } from 'react-icons/fa'; 

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-full bg-dark-bg-primary text-gray-100 p-6">
      <h1 className="text-4xl font-bold text-lime-light glow-text-lime mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">



        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <FaList className="text-lime-accent text-4xl" />
            <h2 className="text-2xl font-semibold text-gray-50">Release Review</h2>
          </div>
          <p className="text-gray-300 mb-4">
            Access and manage the queue of releases awaiting administrative review.
          </p>
          <Link to="/admin/review-queue">
            <Button variant="primary" className="w-full">
              Go to Review Queue
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;