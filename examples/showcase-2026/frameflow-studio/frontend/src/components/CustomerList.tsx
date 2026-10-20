import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../hooks/useApi';
import CustomerCard from './CustomerCard';
import { Customer } from '../types/customer.types';

export default function CustomerList() {
  const { data: customers, loading } = useCustomers();
  const [search, setSearch] = useState('');

  const filtered = (customers || []).filter((item: Customer) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[rgb(var(--orus-border))] rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-[rgb(var(--orus-border))] rounded w-3/4"></div>
                <div className="h-3 bg-[rgb(var(--orus-panel-muted))] rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-3 bg-[rgb(var(--orus-panel-muted))] rounded w-full mb-2"></div>
            <div className="h-3 bg-[rgb(var(--orus-panel-muted))] rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--orus-text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] focus:border-transparent"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[rgb(var(--orus-panel-muted))] rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[rgb(var(--orus-text-muted))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="font-medium text-[rgb(var(--orus-text))]">Nenhum cliente encontrado</p>
          <p className="text-sm text-[rgb(var(--orus-text-muted))] mt-1">{search ? 'Tente outro termo de busca' : 'Cadastre o primeiro cliente para começar'}</p>
          {!search && (
            <Link to="/customers/new" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--orus-primary))] hover:bg-[rgb(var(--orus-primary-hover))] text-[rgb(var(--orus-on-primary))] text-sm font-semibold rounded-xl transition-colors">
              Cadastrar cliente
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((customer: Customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
        </div>
      )}
    </div>
  );
}