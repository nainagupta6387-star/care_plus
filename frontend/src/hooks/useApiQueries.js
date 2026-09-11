// Backward compatibility aggregator
import { AUTH_QUERY_KEYS } from './useAuth';
import { APPOINTMENT_QUERY_KEYS } from './useAppointments';
import { BILLING_QUERY_KEYS } from './useBilling';

export const API_QUERY_KEYS = {
  profile: AUTH_QUERY_KEYS.profile,
  myAppointments: APPOINTMENT_QUERY_KEYS.myAppointments,
  allAppointments: APPOINTMENT_QUERY_KEYS.allAppointments,
  invoices: BILLING_QUERY_KEYS.invoices
};

export * from './useAuth';
export * from './useAppointments';
export * from './useBilling';
