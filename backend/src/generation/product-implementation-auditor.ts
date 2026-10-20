/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS PRODUCT IMPLEMENTATION AUDITOR
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-06T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.generation.product-auditor.20261006.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import type { ProductBlueprint } from '../blueprint/product-blueprint';
import { toResourcePath } from './resource-naming';
import * as ts from 'typescript';
import { posix } from 'path';

function routedSources(route: string, appFiles: ProductImplementationFile[], files: ProductImplementationFile[]): ProductImplementationFile[] {
  const byPath = new Map(files.map(file => [file.path.replace(/\\/g, '/'), file]));
  const visited = new Set<string>();
  const result: ProductImplementationFile[] = [];
  const visitModule = (file: ProductImplementationFile, componentNames?: Set<string>): void => {
    if (visited.has(file.path)) return;
    visited.add(file.path);
    if (!componentNames) result.push(file);
    const source = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const specifier = statement.moduleSpecifier.text;
      if (!specifier.startsWith('.')) continue;
      const clause = statement.importClause;
      const names = [clause?.name?.text];
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) names.push(...clause.namedBindings.elements.map(item => item.name.text));
      if (componentNames && !names.some(name => name && componentNames.has(name))) continue;
      const base = posix.normalize(posix.join(posix.dirname(file.path.replace(/\\/g, '/')), specifier));
      const imported = [base, base + '.tsx', base + '.ts', base + '.jsx', base + '.js', base + '/index.tsx', base + '/index.ts'].map(path => byPath.get(path)).find(Boolean);
      if (imported) visitModule(imported);
    }
  };
  for (const file of appFiles) {
    const source = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const components = new Set<string>();
    const findRoute = (node: ts.Node): void => {
      if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(source) === 'Route') {
        const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
        const path = attributes.find(item => item.name.getText(source) === 'path')?.initializer;
        const element = attributes.find(item => item.name.getText(source) === 'element')?.initializer;
        if (path && ts.isStringLiteral(path) && path.text === route && element) {
          const collect = (child: ts.Node): void => {
            if (ts.isJsxSelfClosingElement(child) || ts.isJsxOpeningElement(child)) components.add(child.tagName.getText(source));
            ts.forEachChild(child, collect);
          };
          collect(element);
        }
      }
      ts.forEachChild(node, findRoute);
    };
    findRoute(source);
    visitModule(file, components);
  }
  return result;
}

function readsResource(file: ProductImplementationFile, resource: string): boolean {
  const source = ts.createSourceFile(file.path, file.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = false;
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'get') {
      const argument = node.arguments[0];
      const value = argument && (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument))
        ? argument.text : argument && ts.isTemplateExpression(argument) ? argument.head.text : '';
      if (value === resource || value.startsWith(resource + '/')) found = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

export interface ProductImplementationFile {
  path: string;
  content: string;
}

export interface ProductImplementationDiagnostic {
  code: 'SCREEN_ROUTE_MISSING' | 'SCREEN_DATA_BINDING_MISSING' | 'API_ROUTE_MISSING' | 'CAPABILITY_SCREEN_MISSING' | 'ACCEPTANCE_PLAN_MISSING' | 'ACCEPTANCE_CRITERION_UNTRACED' | 'ACCEPTANCE_BEHAVIOR_MISSING' | 'GENERIC_FALLBACK_PRESENT';
  stage: 'product-coverage';
  message: string;
  expected: string;
  affectedFiles: string[];
}

export interface ProductImplementationAudit {
  passed: boolean;
  score: number;
  requiredChecks: number;
  passedChecks: number;
  diagnostics: ProductImplementationDiagnostic[];
  coverage: {
    screens: number;
    dataBindings: number;
    apiResources: number;
    capabilities: number;
    acceptanceCriteria: number;
    executableAcceptance: number;
  };
}

export function auditProductImplementation(
  blueprint: ProductBlueprint,
  files: ProductImplementationFile[]
): ProductImplementationAudit {
  const diagnostics: ProductImplementationDiagnostic[] = [];
  const appFiles = files.filter(file => /(^|\/)App\.(tsx|jsx)$/.test(file.path));
  const backendAppFiles = files.filter(file => /backend\/src\/(app|routes\/index)\.ts$/.test(file.path.replace(/\\/g, '/')));
  const frontendSource = appFiles.map(file => file.content).join('\n');
  const backendSource = backendAppFiles.map(file => file.content).join('\n');
  const requiresFrontend = blueprint.architecture.frontend.length > 0;
  const requiresBackend = blueprint.architecture.backend.length > 0;
  let requiredChecks = 0;
  let passedChecks = 0;
  let screensCovered = 0;
  let dataBindingsCovered = 0;
  let apiResourcesCovered = 0;
  let capabilitiesCovered = 0;
  let acceptanceCriteriaCovered = 0;
  let executableAcceptanceCovered = 0;

  if (requiresFrontend) {
    for (const screen of blueprint.screens.filter(item => item.route !== '/')) {
      requiredChecks++;
      if (frontendSource.includes(`path="${screen.route}"`)) {
        passedChecks++;
        screensCovered++;
      } else {
        diagnostics.push({
          code: 'SCREEN_ROUTE_MISSING',
          stage: 'product-coverage',
          message: `A tela ${screen.name} não foi conectada ao roteador`,
          expected: screen.route,
          affectedFiles: appFiles.map(file => file.path),
        });
      }

      if (requiresBackend) {
        const capability = blueprint.capabilities.find(item => screen.capabilityIds.includes(item.id));
        const routeEntity = blueprint.data.find(item => screen.route === `/${toResourcePath(item.name)}/:id` || screen.route === `/${toResourcePath(item.name)}/:id/edit`);
        const entity = routeEntity?.name || capability?.entities?.find(name =>
          blueprint.data.some(item => item.name.toLowerCase() === name.toLowerCase())
        );
        if (entity) {
          const resourcePath = `/api/${toResourcePath(entity)}`;
          const screenFiles = routedSources(screen.route, appFiles, files);
          requiredChecks++;
          if (screenFiles.some(file => readsResource(file, resourcePath))) {
            passedChecks++;
            dataBindingsCovered++;
          } else {
            diagnostics.push({
              code: 'SCREEN_DATA_BINDING_MISSING',
              stage: 'product-coverage',
              message: `A tela ${screen.name} não consome o recurso definido no Blueprint`,
              expected: resourcePath,
              affectedFiles: screenFiles.map(file => file.path),
            });
          }
        }
      }
    }
  }

  if (requiresBackend) {
    for (const entity of blueprint.data) {
      const resourcePath = `/api/${toResourcePath(entity.name)}`;
      requiredChecks++;
      if (backendSource.includes(resourcePath)) {
        passedChecks++;
        apiResourcesCovered++;
      } else {
        diagnostics.push({
          code: 'API_ROUTE_MISSING',
          stage: 'product-coverage',
          message: `A entidade ${entity.name} não possui rota registrada`,
          expected: resourcePath,
          affectedFiles: backendAppFiles.map(file => file.path),
        });
      }
    }
  }

  for (const capability of blueprint.capabilities.filter(item => item.priority === 'must')) {
    requiredChecks++;
    if (blueprint.screens.some(screen => screen.capabilityIds.includes(capability.id))) {
      passedChecks++;
      capabilitiesCovered++;
    } else {
      diagnostics.push({
        code: 'CAPABILITY_SCREEN_MISSING',
        stage: 'product-coverage',
        message: `A capacidade ${capability.name} não possui tela responsável`,
        expected: capability.id,
        affectedFiles: [],
      });
    }
  }

  const requiredCriteria = (blueprint.acceptanceCriteria || []).filter(item => item.required);
  if (requiredCriteria.length > 0) {
    const planFile = files.find(file => /(^|\/)\.orus\/acceptance-plan\.json$/.test(file.path.replace(/\\/g, '/')));
    if (!planFile) {
      requiredChecks += requiredCriteria.length;
      diagnostics.push({
        code: 'ACCEPTANCE_PLAN_MISSING',
        stage: 'product-coverage',
        message: 'O projeto não contém o plano de aceite rastreável',
        expected: '.orus/acceptance-plan.json',
        affectedFiles: [],
      });
    } else {
      let planned: Array<Record<string, unknown>> = [];
      try {
        const parsed = JSON.parse(planFile.content) as { blueprintId?: string; criteria?: Array<Record<string, unknown>> };
        if (parsed.blueprintId === blueprint.blueprintId && Array.isArray(parsed.criteria)) planned = parsed.criteria;
      } catch {
        planned = [];
      }
      for (const criterion of requiredCriteria) {
        requiredChecks++;
        const evidence = planned.find(item => item['id'] === criterion.id);
        const screens = evidence?.['screens'];
        const assertions = evidence?.['assertions'];
        if (evidence?.['capabilityId'] === criterion.capabilityId && Array.isArray(screens) && screens.length > 0 && Array.isArray(assertions) && assertions.length > 0) {
          passedChecks++;
          acceptanceCriteriaCovered++;
        } else {
          diagnostics.push({
            code: 'ACCEPTANCE_CRITERION_UNTRACED',
            stage: 'product-coverage',
            message: `O critério ${criterion.id} não possui evidência planejada`,
            expected: criterion.statement,
            affectedFiles: [planFile.path],
          });
        }
      }
    }
  }

  const executableCriteria = requiredCriteria.filter(criterion => criterion.kind !== 'state-handling');
  if (requiresBackend && executableCriteria.length > 0) {
    const behaviorFile = files.find(file => /backend\/src\/__tests__\/orus-capabilities\.behavior\.test\.ts$/.test(file.path.replace(/\\/g, '/')));
    for (const criterion of executableCriteria) {
      requiredChecks++;
      const operationEvidence = criterion.kind === 'workflow'
        ? behaviorFile?.content.includes(".patch(") && behaviorFile.content.includes('__invalid__')
        : criterion.kind === 'calculation'
          ? behaviorFile?.content.includes('/insights/summary') && behaviorFile.content.includes('numericTotals')
          : criterion.kind === 'integration'
            ? behaviorFile?.content.includes("strategies.includes('integration')") && behaviorFile.content.includes('invalidConfiguration')
            : criterion.kind === 'content'
              ? behaviorFile?.content.includes("strategies.includes('content')") && behaviorFile.content.includes('opened.body.data.id')
              : criterion.kind === 'custom'
                ? behaviorFile?.content.includes("strategies.includes('custom')") && behaviorFile.content.includes("criterion.kind === 'custom'")
                : behaviorFile?.content.includes('.post(') && behaviorFile.content.includes('.put(') && behaviorFile.content.includes('.delete(');
      if (behaviorFile?.content.includes(criterion.id) && operationEvidence) {
        passedChecks++;
        executableAcceptanceCovered++;
      } else {
        diagnostics.push({
          code: 'ACCEPTANCE_BEHAVIOR_MISSING',
          stage: 'product-coverage',
          message: `O critério ${criterion.id} não possui teste comportamental executável`,
          expected: criterion.statement,
          affectedFiles: behaviorFile ? [behaviorFile.path] : [],
        });
      }
    }
  }

  if (!blueprint.data.some(entity => entity.name.toLowerCase() === 'item')) {
    requiredChecks++;
    const genericFallback = files.filter(file =>
      /(^|\/)(Item(List|Detail|Create|Edit)?Page|item\.(routes|controller|service|repository|model))\./.test(file.path.replace(/\\/g, '/'))
    );
    if (genericFallback.length === 0 && !backendSource.includes('/api/items')) {
      passedChecks++;
    } else {
      diagnostics.push({
        code: 'GENERIC_FALLBACK_PRESENT',
        stage: 'product-coverage',
        message: 'O projeto contém um recurso Item não previsto no Blueprint',
        expected: 'somente entidades do Product Blueprint',
        affectedFiles: genericFallback.map(file => file.path),
      });
    }
  }

  const score = requiredChecks === 0 ? 100 : Math.round((passedChecks / requiredChecks) * 100);
  return {
    passed: diagnostics.length === 0,
    score,
    requiredChecks,
    passedChecks,
    diagnostics,
    coverage: {
      screens: screensCovered,
      dataBindings: dataBindingsCovered,
      apiResources: apiResourcesCovered,
      capabilities: capabilitiesCovered,
      acceptanceCriteria: acceptanceCriteriaCovered,
      executableAcceptance: executableAcceptanceCovered,
    },
  };
}
