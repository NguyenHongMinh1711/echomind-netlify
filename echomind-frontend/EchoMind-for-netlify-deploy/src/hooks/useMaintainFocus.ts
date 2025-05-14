import { useRef, useEffect } from 'react';

/**
 * Custom hook to maintain focus on an input element
 * @param shouldFocus Boolean indicating whether the element should be focused
 * @returns Ref to attach to the input element
 */
export const useMaintainFocus = (shouldFocus: boolean = true) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      // Use setTimeout to ensure focus happens after any state updates
      const timeoutId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocus]);

  return inputRef;
};

export default useMaintainFocus;
