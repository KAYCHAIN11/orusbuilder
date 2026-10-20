/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS PRODUCT BLUEPRINT CONTRACT
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-06T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.blueprint.contract.20261006.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import type { ProductBlueprint } from './product-blueprint';

export const PRODUCT_BLUEPRINT_SCHEMA_VERSION = '1.0.0';

export interface ProductBlueprintContractValidation {
  valid: boolean;
  errors: string[];
}

export function normalizeProductBlueprint(value: ProductBlueprint): ProductBlueprint {
  const schemaVersion = value.schemaVersion || PRODUCT_BLUEPRINT_SCHEMA_VERSION;
  const major = Number(schemaVersion.split('.')[0]);
  if (!Number.isFinite(major) || major > 1) {
    throw new Error(`Unsupported Product Blueprint schema version: ${schemaVersion}`);
  }
  const capabilities = Array.isArray(value.capabilities) ? value.capabilities : [];
  const screens = Array.isArray(value.screens) ? value.screens : [];
  const acceptanceCriteria = (Array.isArray(value.acceptanceCriteria) ? value.acceptanceCriteria : []).map(criterion => {
    const capability = capabilities.find(item => item.id === criterion.capabilityId);
    const route = screens.find(item => item.capabilityIds.includes(criterion.capabilityId))?.route;
    const kind = criterion.kind || (criterion.testType === 'integration' ? 'state-handling' : capability?.strategy || 'custom');
    return {
      ...criterion,
      kind,
      entity: criterion.entity || capability?.entities[0],
      route: criterion.route || route,
      assertions: Array.isArray(criterion.assertions) && criterion.assertions.length > 0
        ? criterion.assertions
        : ['operation reaches the declared outcome'],
    };
  });
  return {
    ...value,
    schemaVersion: PRODUCT_BLUEPRINT_SCHEMA_VERSION,
    version: Number.isInteger(value.version) && value.version > 0 ? value.version : 1,
    source: {
      ...value.source,
      documentIds: Array.isArray(value.source?.documentIds) ? value.source.documentIds : [],
    },
    assumptions: Array.isArray(value.assumptions) ? value.assumptions : [],
    openQuestions: Array.isArray(value.openQuestions) ? value.openQuestions : [],
    capabilities,
    screens,
    acceptanceCriteria,
  };
}

export function validateProductBlueprintContract(blueprint: ProductBlueprint): ProductBlueprintContractValidation {
  const errors: string[] = [];
  if (blueprint.schemaVersion !== PRODUCT_BLUEPRINT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${PRODUCT_BLUEPRINT_SCHEMA_VERSION}`);
  }
  const collections: Array<[string, Array<{ id: string }>]> = [
    ['personas', blueprint.personas],
    ['capabilities', blueprint.capabilities],
    ['journeys', blueprint.journeys],
    ['screens', blueprint.screens],
    ['components', blueprint.components],
    ['data', blueprint.data],
    ['acceptanceCriteria', blueprint.acceptanceCriteria],
  ];
  for (const [name, values] of collections) {
    const ids = values.map(item => item.id).filter(Boolean);
    if (ids.length !== values.length) errors.push(`${name} contains an empty identifier`);
    if (new Set(ids).size !== ids.length) errors.push(`${name} contains duplicate identifiers`);
  }
  const capabilityIds = new Set(blueprint.capabilities.map(item => item.id));
  const screenIds = new Set(blueprint.screens.map(item => item.id));
  const componentIds = new Set(blueprint.components.map(item => item.id));
  const personaIds = new Set(blueprint.personas.map(item => item.id));
  for (const screen of blueprint.screens) {
    for (const capabilityId of screen.capabilityIds) {
      if (!capabilityIds.has(capabilityId)) errors.push(`${screen.id} references unknown capability ${capabilityId}`);
    }
    for (const componentId of screen.componentIds) {
      if (!componentIds.has(componentId)) errors.push(`${screen.id} references unknown component ${componentId}`);
    }
  }
  for (const criterion of blueprint.acceptanceCriteria) {
    if (!capabilityIds.has(criterion.capabilityId)) errors.push(`${criterion.id} references unknown capability ${criterion.capabilityId}`);
    if (!criterion.kind) errors.push(`${criterion.id} does not define an acceptance kind`);
    if (!Array.isArray(criterion.assertions) || criterion.assertions.length === 0) errors.push(`${criterion.id} does not define executable assertions`);
  }
  for (const journey of blueprint.journeys) {
    if (!personaIds.has(journey.actorId)) errors.push(`${journey.id} references unknown actor ${journey.actorId}`);
    for (const capabilityId of journey.capabilityIds) {
      if (!capabilityIds.has(capabilityId)) errors.push(`${journey.id} references unknown capability ${capabilityId}`);
    }
  }
  for (const component of blueprint.components) {
    for (const screenId of component.screenIds) {
      if (!screenIds.has(screenId)) errors.push(`${component.id} references unknown screen ${screenId}`);
    }
  }
  return { valid: errors.length === 0, errors };
}
