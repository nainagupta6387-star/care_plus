import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfile,
  loginUser,
  registerUser,
  logoutUser,
  getAuthToken
} from '../api/authApi';

export const AUTH_QUERY_KEYS = {
  profile: ['user', 'profile']
};

export const useProfileQuery = () => {
  const token = getAuthToken();
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: getUserProfile,
    enabled: !!token,
    retry: false,
    staleTime: 1000 * 60 * 5
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.patient) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.profile, data.patient);
      }
      queryClient.invalidateQueries();
    }
  });
};

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data?.patient) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.profile, data.patient);
      }
      queryClient.invalidateQueries();
    }
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
    }
  });
};

// Aliases for backward compatibility
export const usePatientProfileQuery = useProfileQuery;
export const usePatientLoginMutation = useLoginMutation;
export const usePatientRegisterMutation = useRegisterMutation;
export const usePatientLogoutMutation = useLogoutMutation;
