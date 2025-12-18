import { Injectable } from '@nestjs/common';
import axios, { type AxiosInstance } from 'axios';
import { ENV } from '@/config/env';
import { LoggerService } from '@/shared/logger';
import type {
  GeminiGenerateContentRequest,
  GeminiGenerateContentResponse,
} from './gemini.types';

@Injectable()
export class GeminiService {
  private readonly client: AxiosInstance;

  constructor(private readonly logger: LoggerService) {
    this.client = axios.create({
      baseURL: ENV.GEMINI_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generateText(prompt: string): Promise<string> {
    const apiKey = ENV.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = ENV.GEMINI_MODEL;
    const payload: GeminiGenerateContentRequest = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    try {
      const res = await this.client.post<GeminiGenerateContentResponse>(
        `/models/${encodeURIComponent(model)}:generateContent`,
        payload,
        { params: { key: apiKey } },
      );

      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        this.logger.warn('Gemini returned no text', {
          model,
          hasCandidates: Boolean(res.data.candidates?.length),
        });
        throw new Error('Gemini returned no text');
      }

      return text;
    } catch (error: unknown) {
      this.logger.error(
        'Gemini generateText failed',
        error instanceof Error ? error : undefined,
        { model },
      );
      throw error;
    }
  }
}


