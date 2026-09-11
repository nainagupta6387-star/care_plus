import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '../api/authApi';
import {
  getInvoices,
  createInvoice,
  updateInvoiceStatus
} from '../api/billingApi';

export const BILLING_QUERY_KEYS = {
  invoices: ['billing', 'invoices']
};

export const useInvoicesQuery = () => {
  const token = getAuthToken();
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.invoices,
    queryFn: getInvoices,
    enabled: !!token,
    refetchInterval: 3000
  });
};

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.invoices });
    }
  });
};

export const useUpdateInvoiceStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateInvoiceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.invoices });
    }
  });
};
