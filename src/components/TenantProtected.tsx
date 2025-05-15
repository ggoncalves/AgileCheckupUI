'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Change to next/navigation
import { useTenant } from '@/contexts/TenantContext';

interface TenantProtectedProps {
  children: ReactNode;
}

const TenantProtected: React.FC<TenantProtectedProps> = ({ children }) => {
  const { tenantId, isLoaded } = useTenant();
  const router = useRouter();

  useEffect(() => {
    // Once we've confirmed tenant is loaded, check if it exists
    if (isLoaded && !tenantId) {
      // If no tenant is selected, redirect to select company page
      router.push('/select-company');
    }
  }, [tenantId, isLoaded, router]);

  // Show loading while checking tenant status
  if (!isLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If tenant is loaded but doesn't exist, don't render anything (we're redirecting)
  if (!tenantId) {
    return null;
  }

  // If tenant exists, render the children
  return <>{children}</>;
};

export default TenantProtected;