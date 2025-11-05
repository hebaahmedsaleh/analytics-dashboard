import React from 'react';
import { APIError } from '../api/errors';

interface ErrorMessageProps {
  error: Error | APIError;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onRetry }) => {
  let title = 'Error';
  let message = error.message;

  // Handle specific error types
  if (error instanceof APIError) {
    switch (error.status) {
      case 404:
        title = 'Not Found';
        break;
      case 403:
        title = 'Access Denied';
        break;
      case 500:
        title = 'Server Error';
        message = 'An unexpected error occurred. Please try again later.';
        break;
      default:
        if (error.name === 'NetworkError') {
          title = 'Connection Error';
        } else if (error.name === 'TimeoutError') {
          title = 'Request Timeout';
        }
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
      <div className="text-center space-y-4">
        <div className="text-red-500 mb-2">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-gray-600">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};