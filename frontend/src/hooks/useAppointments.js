import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from '../api/authApi';
import {
  getMyAppointments,
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus
} from '../api/appointmentApi';

export const APPOINTMENT_QUERY_KEYS = {
  myAppointments: ['appointments', 'my'],
  allAppointments: ['appointments', 'all']
};

export const usePatientAppointmentsQuery = () => {
  const token = getAuthToken();
  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.myAppointments,
    queryFn: getMyAppointments,
    enabled: !!token,
    refetchInterval: 3000,
    staleTime: 1000
  });
};

export const useMyAppointmentsQuery = usePatientAppointmentsQuery;

export const useAllAppointmentsQuery = () => {
  const token = getAuthToken();
  return useQuery({
    queryKey: APPOINTMENT_QUERY_KEYS.allAppointments,
    queryFn: getAllAppointments,
    enabled: !!token,
    refetchInterval: 3000,
    staleTime: 1000
  });
};

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.myAppointments });
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.allAppointments });
    }
  });
};

export const useUpdateAppointmentStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.myAppointments });
      queryClient.invalidateQueries({ queryKey: APPOINTMENT_QUERY_KEYS.allAppointments });
    }
  });
};
