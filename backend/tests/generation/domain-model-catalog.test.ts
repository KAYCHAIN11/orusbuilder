import { getEntityFields, getEntityWorkflow } from '../../src/generation/domain-model-catalog';

describe('domain model catalog', () => {
  it.each([
    ['WorkOrder', ['priority', 'scheduledAt', 'slaDueAt', 'location']],
    ['Integration', ['provider', 'endpoint', 'lastSyncAt']],
    ['Payment', ['amount', 'method', 'paidAt']],
    ['Report', ['metric', 'value', 'periodStart', 'periodEnd']],
    ['FileAsset', ['url', 'mimeType', 'size']],
    ['Automation', ['trigger', 'action', 'runCount', 'lastRunAt']],
    ['Role', ['scope', 'permissions']],
    ['Appointment', ['scheduledAt', 'durationMinutes', 'professional']],
    ['Application', ['candidateId', 'jobOpeningId', 'appliedAt', 'score']],
    ['Enrollment', ['studentId', 'courseId', 'enrolledAt', 'progress']],
    ['Shipment', ['trackingCode', 'origin', 'destination', 'estimatedDeliveryAt']],
    ['EventSession', ['eventId', 'startsAt', 'speaker', 'room']],
    ['Reservation', ['guestId', 'scheduledAt', 'partySize', 'tableNumber']],
    ['RestaurantOrder', ['channel', 'tableNumber', 'total', 'placedAt']],
  ])('uses product-specific fields for %s', (entity, expectedFields) => {
    const names = getEntityFields(entity).map(field => field.name);
    expect(names).toEqual(expect.arrayContaining(expectedFields));
    expect(names).not.toEqual(['name', 'description', 'status']);
  });

  it.each([
    ['WorkOrder', 'open', 'assigned'],
    ['Visit', 'scheduled', 'en_route'],
    ['Subscription', 'trial', 'active'],
    ['Payment', 'pending', 'authorized'],
    ['Review', 'pending', 'approved'],
    ['Application', 'applied', 'screening'],
    ['Enrollment', 'active', 'completed'],
    ['Shipment', 'created', 'dispatched'],
    ['Ticket', 'available', 'issued'],
    ['Reservation', 'requested', 'confirmed'],
    ['RestaurantOrder', 'received', 'preparing'],
  ])('defines persisted transitions for %s', (entity, initial, next) => {
    const workflow = getEntityWorkflow(entity);
    expect(workflow?.initial).toBe(initial);
    expect(workflow?.transitions[initial]).toContain(next);
  });

  it('keeps a safe fallback for unknown entities', () => {
    expect(getEntityFields('UncataloguedEntity').map(field => field.name)).toEqual([
      'name',
      'description',
      'status',
    ]);
  });
});
