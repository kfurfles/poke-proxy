export type AppError =
  | { type: 'validation'; message: string }
  | { type: 'not_found'; message: string }
  | { type: 'unexpected'; message: string };


