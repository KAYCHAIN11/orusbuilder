import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useProjects() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/projects')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useAssets() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/assets')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useClients() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/clients')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useReviews() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/reviews')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useCustomers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/customers')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useReports() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/reports')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useFileAssets() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/file-assets')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
}