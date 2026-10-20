import { apiGenerator } from '../../src/generation/api-generator';

describe('APIGenerator resource normalization', () => {
  it('generates named resources without fallback files', async () => {
    const result = await apiGenerator.generate({
      type: 'rest',
      resources: [
        { id: 'Appointment', name: 'Appointment' },
        { id: 'Customer', name: 'Customer' },
      ],
      authentication: true,
    });

    expect(result.success).toBe(true);
    expect(result.files.map(file => file.filename)).toEqual(expect.arrayContaining([
      'appointment.routes.ts',
      'customer.routes.ts',
    ]));
    expect(result.files.find(file => file.filename === 'item.routes.ts')).toBeUndefined();
    const routesIndex = result.files.find(file => file.filename === 'index.ts' && file.path.endsWith('routes'));
    expect(routesIndex?.content).toContain("router.use('/api/appointments'");
    expect(routesIndex?.content).toContain("router.use('/api/customers'");
    expect(result.endpoints).toContain('POST /api/appointments');
  });

  it('normalizes string resources and removes duplicates', async () => {
    const result = await apiGenerator.generate({
      type: 'rest',
      resources: ['work order', 'WorkOrder', ''] as any,
      authentication: false,
    });

    expect(result.success).toBe(true);
    expect(result.files.filter(file => file.filename === 'workorder.routes.ts')).toHaveLength(1);
    expect(result.files.find(file => file.filename === 'item.routes.ts')).toBeUndefined();
    const routesIndex = result.files.find(file => file.filename === 'index.ts' && file.path.endsWith('routes'));
    expect(routesIndex?.content).toContain("router.use('/api/work-orders'");
  });
});
