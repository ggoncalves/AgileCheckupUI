import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation'; // Change to next/navigation
import apiService from '@/services/apiService';
import {useTenant} from '@/infrastructure/auth';

// Define types for our company data
interface Company {
  id: string;
  name: string;
  tenantId: string;
}

const CompanySelector: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setTenant } = useTenant();

  useEffect(() => {
    // Fetch companies from the API
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCompanies();

        if (data) {
          setCompanies(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please try again later.');
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = event.target.value;
    setSelectedCompanyId(companyId);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedCompanyId) return;

    // Find the selected company to get its tenantId
    const selectedCompany = companies.find(company => company.id === selectedCompanyId);

    if (selectedCompany) {
      // Update tenant context
      setTenant(selectedCompany.tenantId, selectedCompany.name, selectedCompany.id);

      // Redirect to the companies page (TODO: Must be /home)
      // router.push('/home');
      router.push('/admin/companies');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="card">
          <div className="card-body text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="card">
          <div className="card-body text-center">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Welcome to AgileCheckup</h4>
            </div>
            <div className="card-body">
              <p className="card-text">Please select a company to continue:</p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <select
                    className="form-select form-select-lg mb-3"
                    value={selectedCompanyId}
                    onChange={handleCompanySelect}
                    required
                  >
                    <option value="">Select a company...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name} | {company.tenantId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-lg btn-primary"
                    disabled={!selectedCompanyId}
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;