import React from 'react';
import ReleaseWizard from '../../components/artist/ReleaseWizard';

const CreateRelease: React.FC = () => {
  return (
    <div className="min-h-full bg-dark-bg-primary text-gray-100">
      <h1 className="text-4xl font-bold text-lime-light glow-text-lime mb-8 text-center">Create New Release</h1>
      <ReleaseWizard />
    </div>
  );
};

export default CreateRelease;