'use client';

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';

interface TenantContextType {
  tenantId: string | null;
  companyName: string | null;
  companyId: string | null;
  setTenant: (tenantId: string, companyName: string, companyId: string) => void;
  clearTenant: () => void;
  isLoaded: boolean;
}

// Create the context with a default value
const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  companyName: null,
  companyId: null,
  setTenant: () => {},
  clearTenant: () => {},
  isLoaded: false,
});

// Create a provider component
export const TenantProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize state from localStorage on component mount
  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    const storedCompanyName = localStorage.getItem('companyName');
    const storedCompanyId = localStorage.getItem('companyId');

    if (storedTenantId) {
      setTenantId(storedTenantId);
    }

    if (storedCompanyName) {
      setCompanyName(storedCompanyName);
    }

    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }

    setIsLoaded(true);
  }, []);

  // Method to set tenant info
  const setTenant = (tenId: string, companyName: string, companyId: string) => {
    setTenantId(tenId);
    setCompanyName(companyName);
    setCompanyId(companyId);
    localStorage.setItem('tenantId', tenId);
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('companyId', companyId);
  };

  // Method to clear tenant info
  const clearTenant = () => {
    setTenantId(null);
    setCompanyName(null);
    setCompanyId(null);
    localStorage.removeItem('tenantId');
    localStorage.removeItem('companyName');
    localStorage.removeItem('companyId');
  };

  return (
    <TenantContext.Provider
      value={{
        tenantId,
        companyName,
        companyId,
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