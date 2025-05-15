import React from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { useRouter } from 'next/navigation'; // Change to next/navigation

const TenantInfo: React.FC = () => {
  const { companyName, clearTenant } = useTenant();
  const router = useRouter();

  if (!companyName) return null;

  const handleChangeTenant = () => {
    clearTenant();
    router.push('/select-company');
  };

  return (
    <li className="nav-item dropdown">
      <a className="nav-link" data-toggle="dropdown" href="#">
        <i className="fas fa-building mr-1"></i>
        <span>{companyName}</span>
      </a>
      <div className="dropdown-menu dropdown-menu-right">
        <span className="dropdown-item dropdown-header">Tenant Settings</span>
        <div className="dropdown-divider"></div>
        <button
          onClick={handleChangeTenant}
          className="dropdown-item"
        >
          <i className="fas fa-exchange-alt mr-2"></i> Switch Company
        </button>
      </div>
    </li>
  );
};

export default TenantInfo;