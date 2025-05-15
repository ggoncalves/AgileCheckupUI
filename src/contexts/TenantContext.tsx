'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TenantContextType {
  tenantId: string | null;
  companyName: string | null;
  setTenant: (tenantId: string, companyName: string) => void;
  clearTenant: () => void;
  isLoaded: boolean;
}

// Create the context with a default value
const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  companyName: null,
  setTenant: () => {},
  clearTenant: () => {},
  isLoaded: false,
});

// Create a provider component
export const TenantProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize state from localStorage on component mount
  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    const storedCompanyName = localStorage.getItem('companyName');

    if (storedTenantId) {
      setTenantId(storedTenantId);
    }

    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
    }

    setIsLoaded(true);
  }, []);

  // Method to set tenant info
  const setTenant = (id: string, name: string) => {
    setTenantId(id);
    setCompanyName(name);
    localStorage.setItem('tenantId', id);
    localStorage.setItem('companyName', name);
  };

  // Method to clear tenant info
  const clearTenant = () => {
    setTenantId(null);
    setCompanyName(null);
    localStorage.removeItem('tenantId');
    localStorage.removeItem('companyName');
  };

  return (
    <TenantContext.Provider
      value={{
        tenantId,
        companyName,
        setTenant,
        clearTenant,
        isLoaded
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

// Custom hook to use the tenant context
export const useTenant = () => useContext(TenantContext);

export default TenantContext;