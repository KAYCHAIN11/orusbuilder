import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useEvents() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/events')
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

export function useEventSessions() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/event-sessions')
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

export function useTickets() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/tickets')
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

export function useAttendees() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/attendees')
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

export function useCheckIns() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/check-ins')
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