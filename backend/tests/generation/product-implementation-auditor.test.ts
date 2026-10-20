import type { ProductBlueprint } from '../../src/blueprint/product-blueprint';
import { auditProductImplementation } from '../../src/generation/product-implementation-auditor';

const blueprint = {
  architecture: { frontend: ['React'], backend: ['Express'] },
  screens: [
    { id: 'screen-home', name: 'Início', route: '/', capabilityIds: ['cap-dashboard'] },
    { id: 'screen-orders', name: 'Ordens', route: '/work-orders', capabilityIds: ['cap-orders'] },
  ],
  capabilities: [
    { id: 'cap-orders', name: 'Ordens de serviço', priority: 'must', entities: ['WorkOrder'] },
  ],
  data: [
    { name: 'WorkOrder' },
    { name: 'Company' },
  ],
  acceptanceCriteria: [
    { id: 'AC-001', capabilityId: 'cap-orders', statement: 'Persist order workflow', required: true, assertions: ['persists'], kind: 'workflow' },
  ],
} as ProductBlueprint;

describe('Product implementation auditor', () => {
  it('approves a project that implements its blueprint contract', () => {
    const result = auditProductImplementation(blueprint, [
      { path: 'frontend/src/App.tsx', content: 'import Orders from "./pages/Orders"; const app = <Route path="/work-orders" element={<Orders />} />;' },
      { path: 'frontend/src/pages/Orders.tsx', content: 'api.get("/api/work-orders");' },
      { path: 'backend/src/app.ts', content: "app.use('/api/work-orders', workorderRoutes); app.use('/api/companies', companyRoutes);" },
      { path: '.orus/acceptance-plan.json', content: JSON.stringify({ blueprintId: blueprint.blueprintId, criteria: [{ id: 'AC-001', capabilityId: 'cap-orders', assertions: ['persists'], screens: [{ route: '/work-orders' }] }] }) },
      { path: 'backend/src/__tests__/orus-capabilities.behavior.test.ts', content: "const criteria = ['AC-001']; request(app).post('/api/work-orders'); request(app).put('/api/work-orders/id'); request(app).patch('/api/work-orders/id/status'); request(app).delete('/api/work-orders/id'); const invalid = '__invalid__';" },
    ]);

    expect(result.passed).toBe(true);
    expect(result.score).toBe(100);
    expect(result.coverage).toEqual({ screens: 1, dataBindings: 1, apiResources: 2, capabilities: 1, acceptanceCriteria: 1, executableAcceptance: 1 });
  });

  it('rejects a detached page and an endpoint mentioned only in text', () => {
    const result = auditProductImplementation(blueprint, [
      { path: 'frontend/src/App.tsx', content: 'import Orders from "./pages/Orders"; const app = <Route path="/work-orders" element={<Orders />} />;' },
      { path: 'frontend/src/pages/Orders.tsx', content: 'const endpoint = "/api/work-orders";' },
      { path: 'frontend/src/pages/Unused.tsx', content: 'api.get("/api/work-orders");' },
      { path: 'backend/src/app.ts', content: "app.use('/api/work-orders', orders); app.use('/api/companies', companies);" },
      { path: '.orus/acceptance-plan.json', content: JSON.stringify({ blueprintId: blueprint.blueprintId, criteria: [{ id: 'AC-001', capabilityId: 'cap-orders', assertions: ['persists'], screens: [{ route: '/work-orders' }] }] }) },
      { path: 'backend/src/__tests__/orus-capabilities.behavior.test.ts', content: "const criteria = ['AC-001']; request(app).patch('/api/work-orders/id/status'); const invalid = '__invalid__';" },
    ]);

    expect(result.passed).toBe(false);
    expect(result.diagnostics).toEqual([expect.objectContaining({ code: 'SCREEN_DATA_BINDING_MISSING' })]);
  });

  it('blocks missing product routes and generic fallback resources', () => {
    const result = auditProductImplementation(blueprint, [
      { path: 'frontend/src/App.tsx', content: '<Route path="/items" />' },
      { path: 'frontend/src/pages/ItemListPage.tsx', content: 'export default function ItemListPage() {}' },
      { path: 'backend/src/app.ts', content: "app.use('/api/items', itemRoutes);" },
    ]);

    expect(result.passed).toBe(false);
    expect(result.score).toBeLessThan(100);
    expect(result.diagnostics.map(item => item.code)).toEqual(expect.arrayContaining([
      'SCREEN_ROUTE_MISSING',
      'SCREEN_DATA_BINDING_MISSING',
      'API_ROUTE_MISSING',
      'ACCEPTANCE_PLAN_MISSING',
      'ACCEPTANCE_BEHAVIOR_MISSING',
      'GENERIC_FALLBACK_PRESENT',
    ]));
  });
});
