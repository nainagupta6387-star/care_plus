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
  try {
    const res = await fetch(`${API_URL}/billing`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch invoices');
    return data.invoices;
  } catch (err) {
    return JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const res = await fetch(`${API_URL}/billing`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(invoiceData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create invoice');

    if (data.invoice) {
      const stored = JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
      localStorage.setItem('careplus_invoices', JSON.stringify([data.invoice, ...stored]));
    }
    return data;
  } catch (err) {
    const newInv = {
      _id: 'inv-' + Math.floor(1000 + Math.random() * 9000),
      id: 'INV-' + Math.floor(9000 + Math.random() * 1000),
      patientName: invoiceData.patientName,
      patientId: invoiceData.patientId || 'PT-9801',
      description: invoiceData.description,
      amount: parseFloat(invoiceData.amount) || 100.00,
      status: invoiceData.status || 'Pending',
      method: invoiceData.method || 'Cash / Reception',
      date: new Date().toISOString().split('T')[0]
    };
    const stored = JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
    localStorage.setItem('careplus_invoices', JSON.stringify([newInv, ...stored]));
    return { success: true, invoice: newInv };
  }
};

export const updateInvoiceStatus = async ({ id, status, method }) => {
  try {
    const res = await fetch(`${API_URL}/billing/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, method })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update invoice status');
    return data;
  } catch (err) {
    const stored = JSON.parse(localStorage.getItem('careplus_invoices') || '[]');
    const updated = stored.map(inv => {
      if (inv._id === id || inv.id === id || inv.invoiceId === id) {
        return { ...inv, status: status || inv.status, method: method || inv.method };
      }
      return inv;
    });
    localStorage.setItem('careplus_invoices', JSON.stringify(updated));
    return { success: true, message: 'Invoice status updated' };
  }
};

export default {
  getInvoices,
  createInvoice,
  updateInvoiceStatus
};
