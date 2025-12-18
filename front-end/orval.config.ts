import { defineConfig } from 'orval'

/**
 * Backend swagger UI is served at: http://127.0.0.1:3001/api/docs
 * NestJS exposes the OpenAPI JSON at: <path>-json
 * So the default JSON endpoint is: http://127.0.0.1:3001/api/docs-json
 */
export const openApiUrl = process.env.ORVAL_INPUT ?? 'http://127.0.0.1:3001/api/docs-json'

export default defineConfig({
  api: {
    input: {
      target: openApiUrl,
      filters: {
        mode: 'include',
        tags: ['pokemon'],
      },
    },
    output: {
      mode: 'tags',
      target: './src/shared/api/generated/query',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      prettier: false,
      override: {
        mutator: {
          path: './src/shared/api/axios.ts',
          name: 'apiClient',
        },
      },
    },
  },
  schema: {
    input: {
      target: openApiUrl,
      filters: {
        mode: 'include',
        tags: ['pokemon'],
      },
    },
    output: {
      mode: 'single',
      target: './src/shared/api/generated/zod',
      fileExtension: '.zod.ts',
      indexFiles: true,
      client: 'zod',
      clean: true,
      prettier: false,
    },
  },
})
