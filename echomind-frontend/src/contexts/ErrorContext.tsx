import React, { createContext, useContext, useState, ReactNode } from 'react';
import ErrorAlert, { ErrorSeverity } from '../components/common/ErrorAlert';

// Define error types
export interface AppError {
  id: string;
  message: string;
  details?: string;
  severity: ErrorSeverity;
  autoHideDuration?: number | null;
}

// Define context type
interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, 'id'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

// Create context
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Provider component
interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  // Add a new error and return its ID
  const addError = (error: Omit<AppError, 'id'>): string => {
    const id = Date.now().toString();
    const newError: AppError = {
      ...error,
      id,
    };
    
    setErrors(prevErrors => [...prevErrors, newError]);
    return id;
  };

  // Remove an error by ID
  const removeError = (id: string): void => {
    setErrors(prevErrors => prevErrors.filter(error => error.id !== id));
  };

  // Clear all errors
  const clearErrors = (): void => {
    setErrors([]);
  };

  // Context value
  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      
      {/* Render error alerts */}
      <div style={{ 
        position: 'fixed', 
        bottom: 16, 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '600px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {errors.map(error => (
          <ErrorAlert
            key={error.id}
            message={error.message}
            details={error.details}
            severity={error.severity}
            onClose={() => removeError(error.id)}
            autoHideDuration={error.autoHideDuration}
            showAsSnackbar
          />
        ))}
      </div>
    </ErrorContext.Provider>
  );
};

// Custom hook to use the error context
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Helper function to format error messages
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    return JSON.stringify(error);
  }
  
  return 'An unknown error occurred';
};

// Helper function to format error details
export const formatErrorDetails = (error: unknown): string | undefined => {
  if (error instanceof Error && error.stack) {
    return error.stack;
  }
  
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error, null, 2);
    } catch (e) {
      return 'Error details could not be formatted';
    }
  }
  
  return undefined;
};

export default ErrorContext;
