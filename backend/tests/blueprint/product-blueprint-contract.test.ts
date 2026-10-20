import { ProductBlueprintPlanner } from '../../src/blueprint/product-blueprint';
import {
  PRODUCT_BLUEPRINT_SCHEMA_VERSION,
  normalizeProductBlueprint,
  validateProductBlueprintContract,
} from '../../src/blueprint/product-blueprint-contract';

describe('Product Blueprint contract', () => {
  it('creates a versioned graph with valid references', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      prompt: 'CRM com pipeline, contatos, empresas, mensagens e relatórios',
    });

    expect(blueprint.schemaVersion).toBe(PRODUCT_BLUEPRINT_SCHEMA_VERSION);
    expect(validateProductBlueprintContract(blueprint)).toEqual({ valid: true, errors: [] });
  });

  it('migrates an unversioned document and rejects unsupported versions', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({ prompt: 'Sistema de agendamentos e clientes' });
    const legacy = { ...blueprint, schemaVersion: '' };

    expect(normalizeProductBlueprint(legacy).schemaVersion).toBe(PRODUCT_BLUEPRINT_SCHEMA_VERSION);
    expect(() => normalizeProductBlueprint({ ...blueprint, schemaVersion: '2.0.0' })).toThrow('Unsupported Product Blueprint schema version');
  });

  it('reports duplicate identifiers and broken references before generation', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({ prompt: 'Sistema de agendamentos e clientes' });
    const invalid = {
      ...blueprint,
      screens: blueprint.screens.map((screen, index) => index === 0
        ? { ...screen, capabilityIds: [...screen.capabilityIds, 'CAP-UNKNOWN'] }
        : { ...screen, id: blueprint.screens[0]!.id }),
    };
    const result = validateProductBlueprintContract(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      'screens contains duplicate identifiers',
      expect.stringContaining('references unknown capability CAP-UNKNOWN'),
    ]));
  });
});
