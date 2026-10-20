import {
  pluralizeResourceWord,
  splitResourceWords,
  toEntityIdentifier,
  toResourcePath,
  toResourceTable,
} from '../../src/generation/resource-naming';

describe('Resource naming contract', () => {
  it('normalizes compound entity names consistently', () => {
    expect(splitResourceWords('WorkOrder')).toEqual(['work', 'order']);
    expect(toEntityIdentifier('work-order')).toBe('workOrder');
    expect(toResourcePath('WorkOrder')).toBe('work-orders');
    expect(toResourceTable('WorkOrder')).toBe('work_orders');
  });

  it('pluralizes regular, contextual and irregular names', () => {
    expect(pluralizeResourceWord('company')).toBe('companies');
    expect(pluralizeResourceWord('activity')).toBe('activities');
    expect(pluralizeResourceWord('status')).toBe('statuses');
    expect(pluralizeResourceWord('person')).toBe('people');
    expect(pluralizeResourceWord('inventory')).toBe('inventory');
  });

  it('provides a safe fallback for empty names', () => {
    expect(toEntityIdentifier('')).toBe('item');
    expect(toResourcePath('')).toBe('items');
  });
});
