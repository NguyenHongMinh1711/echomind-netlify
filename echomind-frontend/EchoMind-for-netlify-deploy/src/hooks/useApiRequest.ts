import { useState, useCallback, useEffect } from 'react';
import { useError, formatErrorMessage, formatErrorDetails } from '../contexts/ErrorContext';
import { useNetwork } from '../contexts/NetworkContext';

/**
 * Options for the useApiRequest hook
 * @template T The type of data returned by the API request
 */
interface UseApiRequestOptions<T> {
  /** Callback function to execute when the request succeeds */
  onSuccess?: (data: T) => void;

  /** Callback function to execute when the request fails */
  onError?: (error: Error) => void;

  /** Whether to show errors in the global error UI (default: true) */
  showGlobalError?: boolean;

  /** Whether to execute the request automatically on mount (default: false) */
  autoExecute?: boolean;

  /** Dependencies array for auto-execution, similar to useEffect dependencies */
  dependencies?: any[];
}

/**
 * State returned by the useApiRequest hook
 * @template T The type of data returned by the API request
 */
interface ApiRequestState<T> {
  /** The data returned by the API request, or null if not yet loaded */
  data: T | null;

  /** Whether the request is currently loading */
  isLoading: boolean;

  /** Any error that occurred during the request, or null if no error */
  error: Error | null;

  /** Function to execute the API request with the given arguments */
  execute: (...args: any[]) => Promise<T | null>;

  /** Function to reset the hook state (clear data, error, and loading) */
  reset: () => void;
}

/**
 * A custom hook for handling API requests with loading and error states.
 *
 * This hook provides a standardized way to make API requests with:
 * - Automatic loading state management
 * - Consistent error handling
 * - Integration with global error notifications
 * - Network status detection
 * - Auto-execution capability
 *
 * Usage example:
 * ```tsx
 * const { data, isLoading, error, execute } = useApiRequest(
 *   (id) => api.fetchUser(id),
 *   {
 *     onSuccess: (user) => console.log('User loaded:', user),
 *     onError: (err) => console.error('Failed to load user:', err),
 *     autoExecute: true,
 *     dependencies: [userId]
 *   }
 * );
 * ```
 *
 * @template T The type of data returned by the API request
 * @param {Function} requestFn The function that makes the API request
 * @param {UseApiRequestOptions<T>} options Configuration options
 * @returns {ApiRequestState<T>} The current state of the API request
 */
function useApiRequest<T>(
  requestFn: (...args: any[]) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
): ApiRequestState<T> {
  const {
    onSuccess,
    onError,
    showGlobalError = true,
    autoExecute = false,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(autoExecute);
  const [error, setError] = useState<Error | null>(null);
  const { addError } = useError();
  const { isOnline } = useNetwork();

  /**
   * Execute the API request with the given arguments
   *
   * This function:
   * 1. Checks if the device is online
   * 2. Sets loading state
   * 3. Executes the request
   * 4. Handles success or error cases
   * 5. Updates state accordingly
   * 6. Triggers appropriate callbacks
   *
   * The function is memoized with useCallback to prevent unnecessary re-renders
   * and includes all relevant dependencies in its dependency array.
   *
   * @param {...any} args Arguments to pass to the request function
   * @returns {Promise<T|null>} The result of the API call or null if it failed
   */
  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Step 1: Check network connectivity
      // If offline, create and handle an offline error
      if (!isOnline) {
        const offlineError = new Error('You are currently offline. Please try again when you have an internet connection.');

        // Update local error state
        setError(offlineError);

        // Show global error notification if enabled
        if (showGlobalError) {
          addError({
            message: 'Network Error',
            details: offlineError.message,
            severity: 'warning',  // Use warning for offline errors rather than error
            autoHideDuration: 5000  // Auto-hide after 5 seconds
          });
        }

        // Call the onError callback if provided
        if (onError) {
          onError(offlineError);
        }

        // Return null to indicate failure
        return null;
      }

      // Step 2: Set loading state and clear any previous errors
      setIsLoading(true);
      setError(null);

      try {
        // Step 3: Execute the API request with the provided arguments
        const result = await requestFn(...args);

        // Step 4: Update state with the result
        setData(result);
        setIsLoading(false);

        // Step 5: Call the onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result);
        }

        // Step 6: Return the result
        return result;
      } catch (err) {
        // Step 4 (error path): Normalize the error to an Error object
        // This ensures consistent error handling regardless of what was thrown
        const error = err instanceof Error ? err : new Error(String(err));

        // Update state to reflect the error
        setError(error);
        setIsLoading(false);

        // Step 5 (error path): Show global error notification if enabled
        if (showGlobalError) {
          addError({
            message: formatErrorMessage(error),  // Format the error message for display
            details: formatErrorDetails(error),  // Include detailed information if available
            severity: 'error',
            autoHideDuration: 5000  // Auto-hide after 5 seconds
          });
        }

        // Step 6 (error path): Call the onError callback if provided
        if (onError) {
          onError(error);
        }

        // Return null to indicate failure
        return null;
      }
    },
    // Dependencies for the useCallback hook
    // These ensure the function is recreated when any of these values change
    [requestFn, onSuccess, onError, showGlobalError, addError, isOnline]
  );

  /**
   * Reset the hook state to its initial values
   *
   * This function clears:
   * - The data (sets to null)
   * - The loading state (sets to false)
   * - Any error (sets to null)
   *
   * This is useful when you want to start fresh, for example:
   * - When unmounting a component
   * - When changing parameters for a new request
   * - When manually handling retry logic
   */
  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  /**
   * Auto-execute the request when the component mounts or dependencies change
   *
   * This effect will:
   * 1. Check if autoExecute is enabled
   * 2. If enabled, execute the request with no arguments
   * 3. Re-run when autoExecute, execute function, or any dependencies change
   *
   * This is similar to how useEffect works, but specifically for API requests.
   * The dependencies array allows you to re-fetch data when certain values change.
   */
  useEffect(() => {
    // Only execute if autoExecute is true
    if (autoExecute) {
      // Call execute with no arguments
      // If your API request needs arguments, you should use the execute function directly
      // rather than relying on autoExecute
      execute();
    }
    // Dependencies include:
    // - autoExecute: to respond to changes in this flag
    // - execute: to ensure we're using the latest version of the function
    // - ...dependencies: user-provided dependencies that should trigger a re-fetch
  }, [autoExecute, execute, ...dependencies]);

  return {
    data,
    isLoading,
    error,
    execute,
    reset
  };
}

export default useApiRequest;
