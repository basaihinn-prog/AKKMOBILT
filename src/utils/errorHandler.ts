/**
 * Standardized error handling and HTTP status code management
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const ErrorCodes = {
  // 4xx Client Errors
  BAD_REQUEST: { status: 400, code: 'BAD_REQUEST', message: 'Invalid request' },
  UNAUTHORIZED: { status: 401, code: 'UNAUTHORIZED', message: 'Authentication required' },
  FORBIDDEN: { status: 403, code: 'FORBIDDEN', message: 'Access denied' },
  NOT_FOUND: { status: 404, code: 'NOT_FOUND', message: 'Resource not found' },
  CONFLICT: { status: 409, code: 'CONFLICT', message: 'Resource conflict' },
  UNPROCESSABLE: { status: 422, code: 'UNPROCESSABLE', message: 'Invalid entity' },
  TOO_MANY_REQUESTS: { status: 429, code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' },

  // 5xx Server Errors
  INTERNAL_ERROR: { status: 500, code: 'INTERNAL_ERROR', message: 'Internal server error' },
  NOT_IMPLEMENTED: { status: 501, code: 'NOT_IMPLEMENTED', message: 'Not implemented' },
  SERVICE_UNAVAILABLE: { status: 503, code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' },

  // Business Logic Errors
  INSUFFICIENT_STOCK: { status: 409, code: 'INSUFFICIENT_STOCK', message: 'Insufficient inventory' },
  INVALID_STATUS: { status: 422, code: 'INVALID_STATUS', message: 'Invalid status transition' },
  DUPLICATE_RESOURCE: { status: 409, code: 'DUPLICATE_RESOURCE', message: 'Resource already exists' },
};

export function createErrorResponse(
  error: AppError | Error | unknown,
  requestId?: string
): {
  statusCode: number;
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: Record<string, unknown>;
  };
} {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      error: {
        code: error.code || ErrorCodes.INTERNAL_ERROR.code,
        message: error.message,
        requestId,
        details: error.details,
      },
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      error: {
        code: ErrorCodes.INTERNAL_ERROR.code,
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
        requestId,
      },
    };
  }

  return {
    statusCode: 500,
    error: {
      code: ErrorCodes.INTERNAL_ERROR.code,
      message: 'An unexpected error occurred',
      requestId,
    },
  };
}

export function validateRequired(data: Record<string, unknown>, fields: string[]): void {
  const missing: string[] = [];
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  if (missing.length > 0) {
    throw new AppError(
      400,
      'Missing required fields',
      'MISSING_FIELDS',
      { fields: missing }
    );
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d+\-\s()]{7,}$/;
  return phoneRegex.test(phone);
}
