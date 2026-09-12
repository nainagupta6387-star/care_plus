import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '../api/authApi';
import {
  getPrescriptions,
  getPatientPrescriptions,
  createPrescription,
  updatePatientProfileApi
} from '../api/prescriptionApi';

export const PRESCRIPTION_QUERY_KEYS = {
  all: ['prescriptions'],
  list: (params) => ['prescriptions', 'list', params],
  byPatient: (patientId) => ['prescriptions', 'patient', patientId]
};

export const usePrescriptionsQuery = (params = {}) => {
  const token = getAuthToken();
  return useQuery({
    queryKey: PRESCRIPTION_QUERY_KEYS.list(params),
    queryFn: () => getPrescriptions(params),
    enabled: !!token,
    refetchInterval: 3000,
    staleTime: 1000
  });
};

export const usePatientPrescriptionsQuery = (patientId) => {
  const token = getAuthToken();
  return useQuery({
    queryKey: PRESCRIPTION_QUERY_KEYS.byPatient(patientId),
    queryFn: () => getPatientPrescriptions(patientId),
    enabled: !!token && !!patientId,
    refetchInterval: 3000,
    staleTime: 1000
  });
};

export const useCreatePrescriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESCRIPTION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePatientProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
    }
  });
};

export default {
  usePrescriptionsQuery,
  usePatientPrescriptionsQuery,
  useCreatePrescriptionMutation,
  useUpdateProfileMutation
};
