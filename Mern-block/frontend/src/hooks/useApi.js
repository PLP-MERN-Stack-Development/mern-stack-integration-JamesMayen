import { useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';

/**
 * useApi: simple hook to fetch data; returns {data, loading, error, reload}
 * - endpoint: string (e.g., '/posts')
 * - options: { method, body, params }
 */
export default function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!endpoint);
  const [error, setError] = useState(null);

  const fetcher = useCallback(async (op = options) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.request({ url: endpoint, method: op.method || 'get', data: op.body || null, params: op.params || null });
      setData(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, JSON.stringify(options)]);

  useEffect(() => {
    if (!endpoint) return;
    fetcher();
  }, [endpoint, fetcher]);

  return { data, loading, error, reload: fetcher, setData };
}
