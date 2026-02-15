const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// Depots
export const fetchDepots = () => request<any[]>('/depots');
export const fetchDepot = (id: string) => request<any>(`/depots/${id}`);

// Gas Stations
export const fetchStations = () => request<any[]>('/stations');
export const fetchStation = (id: string) => request<any>(`/stations/${id}`);

// Transactions
export const fetchTransactions = () => request<any[]>('/transactions');
export const fetchTransaction = (id: string) => request<any>(`/transactions/${id}`);
export const createTransaction = (data: any) =>
  request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) });
export const updateTransactionStatus = (id: string, status: string) =>
  request<any>(`/transactions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// Stock Data
export const fetchStockData = () => request<any[]>('/stock');

// Incidents
export const fetchIncidents = () => request<any[]>('/incidents');
export const createIncident = (data: any) =>
  request<any>('/incidents', { method: 'POST', body: JSON.stringify(data) });
export const updateIncidentStatus = (id: string, status: string) =>
  request<any>(`/incidents/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// Auth
export const login = (role: string) =>
  request<{ role: string; name: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
