import Axios, { type AxiosRequestConfig } from 'axios'

/**
 * IMPORTANT:
 * This file is referenced by Orval during codegen.
 * Keep it free of Vite-only globals (e.g. import.meta.env) to avoid Orval/esbuild warnings.
 *
 * Base URL must be configured at runtime (app startup) via `setApiBaseUrl`.
 */
export const apiAxiosInstance = Axios.create()

export function setApiBaseUrl(baseURL: string) {
  apiAxiosInstance.defaults.baseURL = baseURL
}

// Orval expects a *function* mutator, not an axios instance.
export const apiClient = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  return apiAxiosInstance({ ...config, ...options }).then(({ data }) => data as unknown as T)
}
