import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [companies, setCompanies]         = useState([]);
  const [activeCompany, setActiveCompanyState] = useState(null);
  const [loading, setLoading]             = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data);
      // Restore previously selected company or pick first
      const savedId = localStorage.getItem('activeCompanyId');
      const found   = data.find(c => c.id === savedId) ?? data[0] ?? null;
      setActiveCompanyState(found);
    } catch {
      // Not logged in yet — ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setActiveCompany = (company) => {
    setActiveCompanyState(company);
    if (company) localStorage.setItem('activeCompanyId', company.id);
    else localStorage.removeItem('activeCompanyId');
  };

  const refresh = load;

  return (
    <CompanyContext.Provider value={{ companies, activeCompany, setActiveCompany, loading, refresh }}>
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => useContext(CompanyContext);
