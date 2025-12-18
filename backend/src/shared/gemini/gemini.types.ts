export type GeminiRole = 'user' | 'model';

export interface GeminiGenerateContentRequest {
  contents: Array<{
    role: GeminiRole;
    parts: Array<{ text: string }>;
  }>;
}

export interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      role?: GeminiRole;
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
}


