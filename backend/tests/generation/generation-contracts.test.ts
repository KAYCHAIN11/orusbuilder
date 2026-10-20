import {
  normalizeGenerationDiagnostic,
  normalizeGenerationDiagnostics,
} from '../../src/generation/generation-contracts';

describe('Generation contracts', () => {
  it('normalizes runtime and product coverage diagnostics', () => {
    expect(normalizeGenerationDiagnostics([
      { stage: 'build', category: 'typescript', message: 'TS2304', affectedFiles: ['src/App.tsx'] },
      { stage: 'product-coverage', code: 'API_ROUTE_MISSING', message: 'Rota ausente', expected: '/api/orders' },
    ])).toEqual([
      expect.objectContaining({ stage: 'build', category: 'typescript', severity: 'error', message: 'TS2304', affectedFiles: ['src/App.tsx'] }),
      expect.objectContaining({ stage: 'product-coverage', category: 'validation', severity: 'error', message: 'Rota ausente' }),
    ]);
  });

  it('normalizes strings and errors without losing their message', () => {
    expect(normalizeGenerationDiagnostic('Falha')).toMatchObject({ message: 'Falha', affectedFiles: [] });
    expect(normalizeGenerationDiagnostic(new Error('Build failed'))).toMatchObject({ message: 'Build failed', category: 'runtime' });
  });
});
