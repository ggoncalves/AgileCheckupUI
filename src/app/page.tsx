'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Change to next/navigation
import { useTenant } from '@/contexts/TenantContext';

export default function Home() {
  const router = useRouter();
  const { tenantId, isLoaded } = useTenant();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceSelect = params.get('forceSelect') === 'true';
    console.log('forceSelect', forceSelect);
    // Once tenant is loaded, check if it exists
    if (isLoaded) {
      if (tenantId && !forceSelect) {
        // If tenant is selected, go to home
        router.push('/home');
      } else {
        // If no tenant is selected, go to select company page
        router.push('/select-company');
      }
    }
  }, [tenantId, isLoaded, router]);

  // Show loading spinner while checking tenant
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}