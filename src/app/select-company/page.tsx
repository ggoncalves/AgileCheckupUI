'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Change to next/navigation
import CompanySelector from '@/components/CompanySelector';
import { useTenant } from '@/contexts/TenantContext';

export default function SelectCompany() {
  const router = useRouter();
  const { tenantId, isLoaded } = useTenant();

  // Check if a tenantId already exists, if so, redirect to dashboard
  useEffect(() => {
    // if (isLoaded && tenantId) {
    //   router.push('/dashboard');
    // }
  }, [isLoaded, tenantId, router]);

  // Don't render anything until we've checked for existing tenant
  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="select-company-page">
      <div className="wrapper">
        <div className="content-wrapper d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', margin: 0 }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="text-center mb-4">
                  <img src="/img/logo.png" alt="AgileCheckup Logo" style={{ maxWidth: '200px' }} />
                  <h1 className="mt-3 mb-4">AgileCheckup</h1>
                </div>
                <CompanySelector />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}