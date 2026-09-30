import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '../api/authApi';
import {
  assignIcuBed,
  createAdmission,
  getAdmissions,
  getDoctors,
  getIcuBeds,
  updateAdmissionStatus,
  updateIcuStatus,
} from '../api/admissionApi';

export const ADMISSION_QUERY_KEYS = {
  all: ['admissions'],
  icuBeds: ['admissions', 'icu-beds'],
  doctors: ['staff', 'doctors'],
};

export const useAdmissionsQuery = () => useQuery({
  queryKey: ADMISSION_QUERY_KEYS.all,
  queryFn: getAdmissions,
  enabled: !!getAuthToken(),
  refetchInterval: 3000,
  staleTime: 1000,
});

export const useIcuBedsQuery = () => useQuery({
  queryKey: ADMISSION_QUERY_KEYS.icuBeds,
  queryFn: getIcuBeds,
  enabled: !!getAuthToken(),
  refetchInterval: 3000,
  staleTime: 1000,
});

export const useDoctorsQuery = () => useQuery({
  queryKey: ADMISSION_QUERY_KEYS.doctors,
  queryFn: getDoctors,
  enabled: !!getAuthToken(),
  staleTime: 1000 * 60,
});

const useAdmissionMutation = (mutationFn) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMISSION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ADMISSION_QUERY_KEYS.icuBeds });
    },
  });
};

export const useCreateAdmissionMutation = () => useAdmissionMutation(createAdmission);
export const useUpdateAdmissionStatusMutation = () => useAdmissionMutation(updateAdmissionStatus);
export const useAssignIcuBedMutation = () => useAdmissionMutation(assignIcuBed);
export const useUpdateIcuStatusMutation = () => useAdmissionMutation(updateIcuStatus);