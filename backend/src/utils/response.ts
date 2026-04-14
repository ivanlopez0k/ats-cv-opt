/**
 * Standardized API response helpers.
 * Ensures consistent response format across all endpoints.
 *
 * Standard format:
 * {
 *   success: boolean;
 *   data?: T;
 *   message?: string;
 *   error?: string;
 *   pagination?: { page, limit, total, totalPages };
 * }
 */

import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Send a successful response.
 */
export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
}

/**
 * Send an error response.
 */
export function errorResponse(
  res: Response,
  error: string,
  statusCode: number = 400
): void {
  res.status(statusCode).json({
    success: false,
    error,
  });
}

/**
 * Send a paginated response.
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
): void {
  res.status(200).json({
    success: true,
    data,
    pagination,
    ...(message && { message }),
  });
}

/**
 * Send a created response (201 status).
 */
export function createdResponse<T>(
  res: Response,
  data: T,
  message?: string
): void {
  successResponse(res, data, message, 201);
}

/**
 * Send a no-content response (204 status).
 */
export function noContentResponse(res: Response): void {
  res.status(204).send();
}
