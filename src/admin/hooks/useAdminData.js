import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Per-section data loading with loading / error / retry.
 * `fetcher` must be wrapped in useCallback by the caller so this does not
 * re-run on every render.
 */
export default function useAdminData(fetcher, { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState("");
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetcher();
      if (mounted.current) setData(result);
      return result;
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Request failed.";
      if (mounted.current) setError(String(message));
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (immediate) reload();
  }, [immediate, reload]);

  return { data, loading, error, reload, setData };
}
