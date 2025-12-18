import { defineConfig } from 'orval';
import {env} from "./src/shared/env"

export const openApiUrl = `${env.VITE_API_BASE_URL}/api/docs-json`

export default defineConfig({
  api: {
    input: {
      target: openApiUrl,
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
    input: { target: openApiUrl },
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
});


