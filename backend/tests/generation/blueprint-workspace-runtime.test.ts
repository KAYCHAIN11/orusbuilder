import * as ts from 'typescript';
import { ProductBlueprintPlanner } from '../../src/blueprint/product-blueprint';
import { uiGenerator } from '../../src/generation/ui-generator';
import { auditProductImplementation } from '../../src/generation/product-implementation-auditor';

type ElementProps = { children?: any; to?: string; role?: string; onClick?: () => void; [key: string]: any };
type ElementNode = { type: unknown; props: ElementProps };

function mountPage(source: string, api: Record<string, jest.Mock>) {
  const states: any[] = [];
  let cursor = 0;
  let effectQueued = false;
  const effects: Array<() => void> = [];
  const jsx = (type: unknown, props: Record<string, any>): ElementNode => ({ type, props });
  const modules: Record<string, unknown> = {
    react: {
      useState: (initial: unknown) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value: any) => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
      },
      useEffect: (effect: () => void) => { if (!effectQueued) { effects.push(effect); effectQueued = true; } },
    },
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'react-router-dom': { Link: 'Link' },
    '../utils/api': { default: api },
  };
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports: { default?: () => ElementNode } = {};
  new Function('require', 'exports', output)((name: string) => {
    if (!(name in modules)) throw new Error('Unexpected dependency: ' + name);
    return modules[name];
  }, exports);
  const render = () => { cursor = 0; return exports.default!(); };
  const flush = async () => {
    effects.splice(0).forEach(effect => effect());
    await new Promise(resolve => setImmediate(resolve));
    return render();
  };
  render();
  return { render, flush };
}

function elements(node: unknown): ElementNode[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as ElementNode;
  return [element, ...elements(element.props.children)];
}

describe('Generated Blueprint workspace runtime', () => {
  it.each(['local', 'api'] as const)('calculates and reloads report summaries with %s persistence', async persistence => {
    const blueprint = await new ProductBlueprintPlanner().create({ prompt: 'Sistema com relatórios de indicadores' });
    const generated = await uiGenerator.generate({
      framework: 'react', productBlueprint: blueprint, persistence,
      requirements: { description: blueprint.source.prompt, features: [], tech_stack: { frontend: ['react'] } },
    });
    const screen = blueprint.screens.find(item => item.route === '/reports')!;
    const page = generated.files.find(file => file.content.includes(`data-blueprint-screen="${screen.id}"`))!;
    let value = 12;
    const api = { get: jest.fn(async (url: string) => ({ data: { data: url.endsWith('/insights/summary')
      ? { total: 1, byState: { current: 1 }, numericTotals: { value } }
      : [{ id: 'report-1', name: 'Consultas', status: 'current', value }] } })) };
    let runtime = mountPage(page.content, api);
    expect(JSON.stringify(await runtime.flush())).toContain('12');
    expect(api.get.mock.calls.some(([url]) => url.endsWith('/insights/summary'))).toBe(persistence === 'api');
    value = 24;
    runtime = mountPage(page.content, api);
    expect(JSON.stringify(await runtime.flush())).toContain('24');
  });

  it.each([
    'CRM fullstack com pipeline de negócios, contatos e empresas',
    'Sistema fullstack para clínica com pacientes, agenda e prontuário',
    'Loja fullstack com catálogo de produtos, carrinho e pedidos',
  ])('connects reachable pages and detail routes for %s', async prompt => {
    const blueprint = await new ProductBlueprintPlanner().create({ prompt });
    const generated = await uiGenerator.generate({
      framework: 'react', productBlueprint: blueprint, persistence: 'api',
      requirements: { description: prompt, features: [], tech_stack: { frontend: ['react'] } },
    });
    const audit = auditProductImplementation(blueprint, generated.files.map(file => ({
      path: file.path + '/' + file.name, content: file.content,
    })));
    expect(audit.diagnostics.filter(item => item.code.startsWith('SCREEN_'))).toEqual([]);
    expect(audit.coverage.dataBindings).toBe(blueprint.screens.filter(screen => screen.route !== '/').length);
  });

  it('loads persisted appointments, executes valid transitions and preserves state on failure', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({ prompt: 'Sistema fullstack de agendamentos e clientes com calendário' });
    const generated = await uiGenerator.generate({
      framework: 'react', productBlueprint: blueprint, persistence: 'api', visualIntent: blueprint.visualIntent,
      requirements: { description: blueprint.source.prompt, features: [], tech_stack: { frontend: ['react'] } },
    });
    const screen = blueprint.screens.find(item => item.route === '/appointments')!;
    const page = generated.files.find(file => file.content.includes(`data-blueprint-screen="${screen.id}"`))!;
    const record = { id: 'appointment-1', name: 'Consulta persistida', status: 'scheduled', description: 'Atendimento real' };
    const api = {
      get: jest.fn().mockResolvedValue({ data: { data: [record] } }),
      patch: jest.fn().mockResolvedValue({ data: { data: { ...record, status: 'confirmed', name: 'Nome confirmado pelo servidor' } } }),
    };
    const pageRuntime = mountPage(page.content, api);
    let tree = await pageRuntime.flush();
    expect(api.get).toHaveBeenCalledWith('/api/appointments');
    expect(JSON.stringify(tree)).toContain('Consulta persistida');
    expect(elements(tree).some(node => node.type === 'Link' && node.props.to === '/appointments/new')).toBe(true);

    const confirm = elements(tree).find(node => node.type === 'button' && JSON.stringify(node.props.children).includes('Confirmado'))!;
    expect(confirm).toBeDefined();
    confirm.props.onClick!();
    tree = await pageRuntime.flush();
    expect(api.patch).toHaveBeenCalledWith('/api/appointments/appointment-1/status', { value: 'confirmed' });
    expect(JSON.stringify(tree)).toContain('Nome confirmado pelo servidor');
    expect(JSON.stringify(tree)).not.toContain('Consulta persistida');

    api.patch.mockRejectedValueOnce(new Error('Transição recusada'));
    const complete = elements(tree).find(node => node.type === 'button' && JSON.stringify(node.props.children).includes('Concluído'))!;
    expect(complete).toBeDefined();
    complete.props.onClick!();
    tree = await pageRuntime.flush();
    expect(elements(tree).find(node => node.props.role === 'alert')).toBeDefined();
    expect(JSON.stringify(tree)).toContain('Transição recusada');
    expect(elements(tree).some(node => node.type === 'button' && JSON.stringify(node.props.children).includes('Concluído'))).toBe(true);

    const files = generated.files.map(file => ({ path: file.path + '/' + file.name, content: file.content }));
    const audit = auditProductImplementation(blueprint, files);
    expect(audit.diagnostics.filter(item => item.code === 'SCREEN_DATA_BINDING_MISSING')).toEqual([]);
  });

  it('renders a retryable loading failure without seeded records', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({ prompt: 'Sistema fullstack de agendamentos e clientes' });
    const generated = await uiGenerator.generate({
      framework: 'react', productBlueprint: blueprint, persistence: 'api',
      requirements: { description: blueprint.source.prompt, features: [], tech_stack: { frontend: ['react'] } },
    });
    const screen = blueprint.screens.find(item => item.route === '/customers')!;
    const page = generated.files.find(file => file.content.includes(`data-blueprint-screen="${screen.id}"`))!;
    const api = { get: jest.fn().mockRejectedValueOnce(new Error('Serviço indisponível')).mockResolvedValue({ data: { data: [] } }) };
    const runtime = mountPage(page.content, api);
    let tree = await runtime.flush();
    expect(JSON.stringify(tree)).toContain('Serviço indisponível');
    const retry = elements(tree).find(node => node.type === 'button' && node.props.children === 'Tentar novamente')!;
    retry.props.onClick!();
    tree = await runtime.flush();
    expect(api.get).toHaveBeenCalledTimes(2);
    expect(elements(tree).find(node => node.props.role === 'alert')).toBeUndefined();
    expect(JSON.stringify(tree)).toContain('Nenhum registro encontrado');
  });
});
