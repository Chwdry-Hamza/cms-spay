export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const NotFound = (message: string, code = 'NOT_FOUND') =>
  new HttpError(404, code, message);

export const BadRequest = (message: string, code = 'BAD_REQUEST', details?: unknown) =>
  new HttpError(400, code, message, details);

export const Conflict = (message: string, code = 'CONFLICT', details?: unknown) =>
  new HttpError(409, code, message, details);
