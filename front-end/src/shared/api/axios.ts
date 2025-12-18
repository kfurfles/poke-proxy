import axios from 'axios';
import { env } from '../env';

/**
 * Orval mutator: exported function name must match `orval.config.ts`.
 * Centralizes baseURL and keeps requests consistent.
 */
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
});


