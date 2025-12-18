export interface MetricsConfig {
  /**
   * Array of path patterns to exclude from metrics collection
   * Supports exact matches and regex patterns
   * Example: ['/health', '/docs', '/metrics', '/favicon.ico']
   */
  excludePaths?: string[];

  /**
   * Whether to use regex matching for exclude paths
   * If true, excludePaths will be treated as regex patterns
   * If false, only exact string matching will be used
   */
  useRegexMatching?: boolean;
}

export const METRICS_CONFIG_TOKEN = Symbol('METRICS_CONFIG');

export const DEFAULT_METRICS_CONFIG: MetricsConfig = {
  excludePaths: [
    '/health',
    '/metrics',
    '/docs',
    '/api/docs',
    '/favicon.ico',
  ],
  useRegexMatching: false,
};
