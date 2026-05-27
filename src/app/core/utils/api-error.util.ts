import { HttpErrorResponse } from '@angular/common/http';

export function extractApiError(error: unknown): string {
  if (error instanceof HttpErrorResponse && error.error?.message) {
    return error.error.message as string;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}
