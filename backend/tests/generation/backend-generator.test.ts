import { backendGenerator } from '../../src/generation/backend-generator';
import { ProductBlueprintPlanner } from '../../src/blueprint/product-blueprint';
import * as ts from 'typescript';

function loadGeneratedModule(source: string, dependencies: Record<string, unknown>): Record<string, any> {
  const exports: Record<string, any> = {};
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function('require', 'exports', output)((name: string) => {
    if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name);
    return dependencies[name];
  }, exports);
  return exports;
}

describe('BackendGenerator production contracts', () => {
  it('enforces workflow rules through both update and transition at runtime', async () => {
    const generated = await backendGenerator.generate({
      projectName: 'Agenda', entities: ['Appointment'],
      requirements: { description: 'Agenda de consultas', features: [], tech_stack: { backend: ['express'], database: 'sqlite' } },
    });
    const record = { id: 'appointment-1', status: 'scheduled' };
    const repository = {
      findById: jest.fn(async () => ({ ...record })),
      findScheduleCandidates: jest.fn(async () => []),
      update: jest.fn(async (_id: string, data: Record<string, unknown>) => Object.assign(record, data)),
    };
    class ValidationError extends Error {}
    class NotFoundError extends Error {}
    const module = loadGeneratedModule(generated.files.find(file => file.filename === 'appointment.service.ts')!.content, {
      '../repositories/appointment.repository': { appointmentRepository: repository },
      '../utils/errors': { ValidationError, NotFoundError },
    });
    const service = new module['AppointmentService']();
    await expect(service.update(record.id, { status: 'completed' })).rejects.toBeInstanceOf(ValidationError);
    await expect(service.transition(record.id, 'completed')).rejects.toBeInstanceOf(ValidationError);
    expect(repository.update).not.toHaveBeenCalled();
    await expect(service.transition(record.id, 'confirmed')).resolves.toMatchObject({ status: 'confirmed' });
    await expect(service.update(record.id, { status: 'confirmed', name: 'Consulta atualizada' })).resolves.toMatchObject({ name: 'Consulta atualizada' });
    repository.findById.mockResolvedValueOnce(null as any);
    await expect(service.transition('missing', 'confirmed')).rejects.toBeInstanceOf(NotFoundError);
    expect(repository.update).toHaveBeenCalledTimes(2);
  });

  it('rejects overlapping appointments for the same professional', async () => {
    const generated = await backendGenerator.generate({
      projectName: 'Agenda', entities: ['Appointment'],
      requirements: { description: 'Agenda de consultas', features: [], tech_stack: { backend: ['express'], database: 'sqlite' } },
    });
    const repository = {
      findScheduleCandidates: jest.fn(async () => [{ scheduledAt: new Date('2030-01-15T12:15:00.000Z'), durationMinutes: 30, status: 'confirmed' }]),
      create: jest.fn(),
    };
    class ValidationError extends Error {}
    class NotFoundError extends Error {}
    const module = loadGeneratedModule(generated.files.find(file => file.filename === 'appointment.service.ts')!.content, {
      '../repositories/appointment.repository': { appointmentRepository: repository },
      '../utils/errors': { ValidationError, NotFoundError },
    });
    const service = new module['AppointmentService']();
    await expect(service.create({
      name: 'Consulta', scheduledAt: new Date('2030-01-15T12:00:00.000Z'), durationMinutes: 30,
      professional: 'Dra. Marina', type: 'consultation', status: 'scheduled',
    })).rejects.toBeInstanceOf(ValidationError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('summarizes all records through database aggregates without a page limit', async () => {
    const generated = await backendGenerator.generate({
      projectName: 'Reports', entities: ['Report'],
      requirements: { description: 'Relatórios', features: [], tech_stack: { backend: ['express'], database: 'sqlite' } },
    });
    const prisma = {
      report: {
        groupBy: jest.fn(async () => [{ status: 'current', _count: { _all: 1501 } }]),
        aggregate: jest.fn(async () => ({ _sum: { value: 4503 } })),
      },
      $transaction: jest.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
    };
    const module = loadGeneratedModule(generated.files.find(file => file.filename === 'report.repository.ts')!.content, {
      '@prisma/client': { PrismaClient: class { constructor() { return prisma; } } },
    });
    await expect(new module['ReportRepository']().summarize()).resolves.toEqual({
      total: 1501, byState: { current: 1501 }, numericTotals: { value: 4503 },
    });
    expect(prisma.report.aggregate).toHaveBeenCalledWith({ _sum: { value: true } });
    expect(prisma.report.groupBy).toHaveBeenCalledWith({ by: ['status'], _count: { _all: true } });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('generates health, readiness, RBAC, pagination and domain workflows', async () => {
    const result = await backendGenerator.generate({
      projectName: 'Vortex',
      entities: ['Company', 'Contact', 'Deal'],
      requirements: {
        description: 'CRM com pipeline, empresas e contatos',
        features: ['authentication', 'pipeline'],
        tech_stack: { backend: ['node', 'express'], database: 'sqlite' },
      },
      authentication: { type: 'jwt' },
    });

    const file = (name: string) => result.files.find(candidate => candidate.filename === name)?.content || '';
    expect(file('app.ts')).toContain("app.get('/health'");
    expect(file('app.ts')).toContain("app.get('/ready'");
    expect(file('authorize.middleware.ts')).toContain("'admin' | 'editor' | 'member' | 'viewer'");
    expect(file('deal.routes.ts')).toContain("router.patch('/:id/status'");
    expect(file('deal.service.ts')).toContain('Invalid workflow transition');
    expect(file('deal.controller.ts')).toContain('pagination: { page, limit');
    expect(file('deal.repository.ts')).toContain('skip: (options.page - 1) * options.limit');
    expect(file('auth.controller.ts')).toContain("administratorEmails.includes(req.body.email.toLowerCase()) ? 'admin' : 'member'");
    expect(file('app.ts')).toContain('app.use(helmet())');
    expect(file('app.ts')).toContain("throw new Error('CORS_ORIGIN is required in production')");
    expect(file('auth.routes.ts')).toContain('authLimiter');
    expect(file('auth.validator.ts')).toContain("regex(/[A-Z]/");
    expect(file('server.ts')).toContain('JWT_SECRET must contain at least 32 characters');
    expect(file('server.ts')).toContain('DATABASE_URL is required in production');
    expect(file('package.json')).toContain('express-rate-limit');
    expect(file('app.ts')).toContain("app.use('/api/companies', companyRoutes)");
    expect(file('app.ts')).not.toContain('/api/companys');
  });

  it('materializes computed capabilities as server-side summaries', async () => {
    const productBlueprint = await new ProductBlueprintPlanner().create({
      prompt: 'CRM comercial com contatos, empresas, pipeline e previsão de receita',
    });
    const result = await backendGenerator.generate({
      projectName: 'Atlas',
      entities: ['Contact', 'Company', 'Deal'],
      productBlueprint,
      requirements: {
        description: productBlueprint.product.summary,
        features: productBlueprint.capabilities.map(capability => capability.name),
        tech_stack: { backend: ['node', 'express'], database: 'sqlite' },
      },
    });
    const file = (name: string) => result.files.find(candidate => candidate.filename === name)?.content || '';

    expect(file('deal.routes.ts')).toContain("router.get('/insights/summary'");
    expect(file('deal.controller.ts')).toContain('this.service.summarize()');
    expect(file('deal.service.ts')).toContain('numericTotals');
    expect(file('deal.repository.ts')).toContain('probability');
  });

  it('limits permission policy mutations to administrators', async () => {
    const productBlueprint = await new ProductBlueprintPlanner().create({
      prompt: 'Sistema com login, papéis e permissões por projeto',
    });
    const result = await backendGenerator.generate({
      projectName: 'Access', entities: ['Role'], productBlueprint,
      requirements: { description: productBlueprint.product.summary, features: ['permissions'], tech_stack: { backend: ['node', 'express'], database: 'sqlite' } },
      authentication: { type: 'jwt' },
    });
    const routes = result.files.find(file => file.filename === 'role.routes.ts')?.content || '';
    expect(routes).toContain("authorize('admin'),");
    expect(routes).not.toContain("authorize('admin', 'editor', 'member'),");
  });

  it('keeps controller, service, repository and model contracts aligned', async () => {
    const result = await backendGenerator.generate({
      projectName: 'Notifications',
      entities: ['Notification'],
      requirements: {
        description: 'Central de notificações operacionais',
        features: ['notifications'],
        tech_stack: { backend: ['node', 'express'], database: 'sqlite' },
      },
    });
    const file = (name: string) => result.files.find(candidate => candidate.filename === name)?.content || '';

    expect(file('notification.model.ts')).toContain('description: string;');
    expect(file('notification.repository.ts')).toContain('Promise<{ items: Notification[]; total: number }>');
    expect(file('notification.repository.ts')).toContain('return { items, total };');
    expect(file('notification.repository.ts')).toContain('export const notificationRepository');
    expect(file('notification.service.ts')).toContain('async findAll(');
    expect(file('notification.service.ts')).toContain('async findById(');
    expect(file('notification.service.ts')).toContain('async delete(');
    expect(file('notification.controller.ts')).toContain('result.items');
  });

  it.each([
    ['recruiting', 'Sistema com vagas, candidatos e processo seletivo', 'Application', 'application.service.ts', ['candidateId', 'jobOpeningId', 'appliedAt', 'score']],
    ['education', 'Plataforma com cursos, matrículas e avaliações acadêmicas', 'Enrollment', 'enrollment.service.ts', ['studentId', 'courseId', 'enrolledAt', 'progress']],
    ['logistics', 'Operação de remessas e entregas com rastreamento logístico', 'Shipment', 'shipment.service.ts', ['trackingCode', 'origin', 'destination', 'estimatedDeliveryAt']],
    ['events', 'Aplicativo com programação de eventos, ingressos e inscrições', 'Ticket', 'ticket.service.ts', ['eventId', 'code', 'price']],
    ['restaurant', 'Sistema com reservas de mesas, cardápio e pedidos do restaurante', 'RestaurantOrder', 'restaurantorder.service.ts', ['channel', 'tableNumber', 'total', 'placedAt']],
  ])('generates domain fields and workflow enforcement for %s', async (_domain, prompt, entity, serviceFile, fields) => {
    const productBlueprint = await new ProductBlueprintPlanner().create({ prompt });
    const result = await backendGenerator.generate({
      projectName: 'DomainProduct',
      entities: productBlueprint.data.map(item => item.name),
      productBlueprint,
      requirements: {
        description: productBlueprint.product.summary,
        features: productBlueprint.capabilities.map(capability => capability.name),
        tech_stack: { backend: ['node', 'express'], database: 'sqlite' },
      },
    });
    const model = result.files.find(file => file.filename === `${entity.toLowerCase()}.model.ts`)?.content || '';
    const service = result.files.find(file => file.filename === serviceFile)?.content || '';

    expect(result.success).toBe(true);
    fields.forEach(field => expect(model).toContain(field));
    expect(service).toContain('workflow.transitions');
    expect(service).toContain('validateTransition');
  });
});
