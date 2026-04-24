import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for making POST requests to the BFHL API.
 * Manages loading state, response data, and error handling.
 * @returns {object} { resultData, isFetching, fetchError, submitEdges }
 */
export function useApi() {
  const [resultData, setResultData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const abortCtrlRef = useRef(null);

  /**
   * Submits an array of edge strings to the BFHL endpoint.
   * Automatically handles previous requests and cleanup.
   * @param {string[]} edgeArray - Array of edge strings to process
   */
  async function submitEdges(edgeArray) {
    // Cancel any previous request
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }

    // Create new abort controller for this request
    const abortCtrl = new AbortController();
    abortCtrlRef.current = abortCtrl;

    // Reset state
    setIsFetching(true);
    setResultData(null);
    setFetchError(null);

    try {
      const apiBase = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiBase}/bfhl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: edgeArray }),
        signal: abortCtrl.signal
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const parsed = await response.json();
      setResultData(parsed);
    } catch (err) {
      // Ignore abort errors (user cancelled request)
      if (err.name === 'AbortError') {
        return;
      }

      setFetchError(err.message);
    } finally {
      setIsFetching(false);
    }
  }

  // Cleanup: abort any pending request on unmount
  useEffect(() => {
    return () => {
      if (abortCtrlRef.current) {
        abortCtrlRef.current.abort();
      }
    };
  }, []);

  return {
    resultData,
    isFetching,
    fetchError,
    submitEdges
  };
}
