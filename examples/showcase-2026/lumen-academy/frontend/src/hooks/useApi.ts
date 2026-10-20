import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useCourses() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/courses')
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

export function useLessons() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/lessons')
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

export function useEnrollments() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/enrollments')
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

export function useStudents() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/students')
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