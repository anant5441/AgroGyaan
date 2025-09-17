import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardOverview from '@/components/DashboardOverview';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <DashboardLayout>
      <DashboardOverview />
      <Footer />
    </DashboardLayout>
  );
};

export default Index;