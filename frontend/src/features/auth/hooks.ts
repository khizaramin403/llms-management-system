import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiError } from "@/types/api";
import {
  login,
  logout,
  me,
  type AuthResponse,
  type LogoutResponse,
} from "./api";
import type { LoginInput } from "./schemas";

/**
 * Mutation hook for logging in.
 * Sets silent: true on meta to handle field/form errors inline without triggering
 * the generic global mutation error toast.
 * Updates query cache with the returned user on success.
 */
export function useLogin(
  options?: UseMutationOptions<AuthResponse, ApiError, LoginInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: login,
    meta: { silent: true, ...options?.meta },
    onSuccess: (...args) => {
      queryClient.setQueryData(queryKeys.auth.me(), args[0]);
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Mutation hook for logging out.
 * Clears Zustand auth store and invalidates auth queries upon completion.
 */
export function useLogout(
  options?: UseMutationOptions<LogoutResponse, ApiError, void>
) {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clear);

  return useMutation({
    ...options,
    mutationFn: logout,
    onSuccess: (...args) => {
      clearAuth();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.clear();
      options?.onSuccess?.(...args);
    },
  });
}

/**
 * Query hook for getting current authenticated user.
 */
export function useMe(
  options?: Omit<
    UseQueryOptions<AuthResponse, ApiError, AuthResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: me,
    staleTime: 5 * 60 * 1000,
    retry: false,
    ...options,
  });
}
