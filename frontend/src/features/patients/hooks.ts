import * as React from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { ApiError, Paginated } from "@/types/api";
import {
  createPatient,
  deletePatient,
  getPatient,
  getPatients,
  updatePatient,
} from "./api";
import type {
  CreatePatientInput,
  ListPatientsParams,
  Patient,
  UpdatePatientInput,
} from "./types";

/**
 * Re-render reasoning & Performance (PERFORMANCE.md sections 4 & 5):
 * 1. Uses `placeholderData: keepPreviousData` so page transitions and filter changes
 *    never flash empty layout states while new data is fetching.
 * 2. Next-page prefetch: automatically prefetches the subsequent page into TanStack Query's cache
 *    when the current page has more pages, providing instant pagination transitions.
 * 3. Scoped queryKey `queryKeys.patients.list(params)` prevents cross-feature cache collisions.
 */
export function usePatients<T = Paginated<Patient>>(
  params?: ListPatientsParams,
  options?: Omit<
    UseQueryOptions<Paginated<Patient>, ApiError, T>,
    "queryKey" | "queryFn"
  >
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.patients.list(params),
    queryFn: () => getPatients(params),
    placeholderData: keepPreviousData,
    ...options,
  });

  const page = params?.page ?? 1;
  const totalPages = (query.data as Paginated<Patient> | undefined)?.meta
    ?.totalPages ?? 0;

  React.useEffect(() => {
    if (!query.isPlaceholderData && page < totalPages) {
      const nextPageParams = { ...params, page: page + 1 };
      queryClient.prefetchQuery({
        queryKey: queryKeys.patients.list(nextPageParams),
        queryFn: () => getPatients(nextPageParams),
      });
    }
  }, [
    query.data,
    query.isPlaceholderData,
    page,
    totalPages,
    params,
    queryClient,
  ]);

  return query;
}

/**
 * Fetches full details for a single patient by ID.
 */
export function usePatient<T = Patient>(
  id: string,
  options?: Omit<
    UseQueryOptions<Patient, ApiError, T>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: () => getPatient(id),
    enabled: Boolean(id),
    ...options,
  });
}

/**
 * Mutation hook for registering a new patient.
 * Invalidates only the patients query key tree on success.
 */
export function useCreatePatient(
  options?: UseMutationOptions<Patient, ApiError, CreatePatientInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatient,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export interface UpdatePatientVariables {
  id: string;
  data: UpdatePatientInput;
}

/**
 * Mutation hook for updating an existing patient.
 * Invalidates only the patients query key tree on success.
 */
export function useUpdatePatient(
  options?: UseMutationOptions<Patient, ApiError, UpdatePatientVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdatePatientVariables) =>
      updatePatient(id, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

/**
 * Mutation hook for deactivating (soft deleting) a patient.
 * Invalidates only the patients query key tree on success.
 */
export function useDeactivatePatient(
  options?: UseMutationOptions<Patient, ApiError, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
