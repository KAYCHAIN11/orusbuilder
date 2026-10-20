import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

export default function DeliveryRouteForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({ name: '', vehicleId: '', scheduledAt: '', stops: 0, distance: 0, description: '', status: "planning" });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [relationOptions, setRelationOptions] = useState<Record<string, Array<{ id: string; name: string }>>>({});

  useEffect(() => {
    Promise.all([
      api.get('/api/vehicles').then(res => ['vehicleId', res.data?.data ?? []] as const)
    ]).then(entries => setRelationOptions(Object.fromEntries(entries))).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get('/api/delivery-routes/' + id)
      .then(res => {
        const item = res.data?.data ?? res.data;
        setFormData({ name: item.name ?? '', vehicleId: item.vehicleId ?? '', scheduledAt: item.scheduledAt ? String(item.scheduledAt).slice(0, 16) : '', stops: item.stops ?? 0, distance: item.distance ?? 0, description: item.description ?? '', status: item.status ?? "planning" });
      })
      .catch(() => setError('Não foi possível carregar o registro.'))
      .finally(() => setInitialLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === 'number'
      ? Number(e.target.value)
      : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) await api.put('/api/delivery-routes/' + id, formData);
      else await api.post('/api/delivery-routes', formData);
      navigate('/delivery-routes');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="py-8 text-center text-sm text-[rgb(var(--orus-text-muted))]">Carregando...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
      <div><label className="block text-sm font-medium mb-1.5">Rota <span className="text-red-500">*</span></label><input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="" className="w-full px-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] transition" /></div>
      <div><label className="block text-sm font-medium mb-1.5">Veículo</label><select name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="w-full px-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] transition"><option value="">Selecione veículo</option>{(relationOptions.vehicleId || []).map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></div>
      <div><label className="block text-sm font-medium mb-1.5">Saída prevista <span className="text-red-500">*</span></label><input type="datetime-local" name="scheduledAt" value={formData.scheduledAt} onChange={handleChange} required placeholder="" className="w-full px-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] transition" /></div>
      <div><label className="block text-sm font-medium mb-1.5">Paradas <span className="text-red-500">*</span></label><input type="number" name="stops" value={formData.stops} onChange={handleChange} required step="1" min="0" placeholder="" className="w-full px-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] transition" /></div>
      <div><label className="block text-sm font-medium mb-1.5">Distância</label><input type="number" name="distance" value={formData.distance} onChange={handleChange} step="1" min="0" placeholder="" className="w-full px-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] transition" /></div>
      <div><label className="block text-sm font-medium mb-1.5">Sequência e restrições</label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="" className="w-full px-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] transition resize-none" /></div>
      <div><label className="block text-sm font-medium mb-1.5">Etapa <span className="text-red-500">*</span></label><select name="status" value={formData.status} onChange={handleChange} required className="w-full px-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] transition">
          <option value="planning">Planejamento</option>
          <option value="dispatched">Despachada</option>
          <option value="in_progress">Em execução</option>
          <option value="completed">Concluída</option>
        </select></div>
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[rgb(var(--orus-primary))] hover:bg-[rgb(var(--orus-primary-hover))] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
          {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {loading ? 'Salvando...' : 'Salvar DeliveryRoute'}
        </button>
        <button type="button" onClick={() => navigate(-1)}
          className="px-6 py-2.5 border border-[rgb(var(--orus-border))] text-[rgb(var(--orus-text))] text-sm font-semibold rounded-xl hover:bg-[rgb(var(--orus-panel-muted))] transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}