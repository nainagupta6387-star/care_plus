import { getAuthToken } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getInvoices = async () => {
  const res = await fetch(`${API_URL}/billing`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch invoices');
  return data.invoices || [];
};

export const createInvoice = async (invoiceData) => {
  const res = await fetch(`${API_URL}/billing`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(invoiceData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create invoice');
  return data;
};

export const updateInvoiceStatus = async ({ id, status, method }) => {
  const res = await fetch(`${API_URL}/billing/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, method })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update invoice status');
  return data;
};

export default {
  getInvoices,
  createInvoice,
  updateInvoiceStatus
};
