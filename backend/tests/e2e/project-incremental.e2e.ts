import express from 'express';
import request from 'supertest';
import { projectRoutes } from '../../src/routes/project.routes';
import { generationRoutes } from '../../src/routes/generation.routes';
import { generationJobStore } from '../../src/generation/generation-job-store';
import { authenticationMiddleware } from '../../src/middleware/authentication.middleware';
import { errorHandlerMiddleware } from '../../src/middleware/error-handler.middleware';
import { orchestrationEngine } from '../../src/engines/orchestrator-engine';
import { productBlueprintPlanner } from '../../src/blueprint/product-blueprint';
import { codeGenerator, ProjectType } from '../../src/generation/code-generator';

describe('Incremental workspace regeneration', () => {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/generation', generationRoutes);
  app.use(errorHandlerMiddleware.handle);

  afterAll(async () => {
    await orchestrationEngine.stop();
  });

  it.each([false, true])('certifies the edited workspace and blocks invalid code: invalid=%s', async invalid => {
    await orchestrationEngine.initialize({ enabled: true, defaultMaxRetries: 1 });
    await orchestrationEngine.start();
    const userId = `incremental-owner-${invalid}`;
    const token = authenticationMiddleware.generateToken({
      userId,
      email: 'incremental@orus.dev',
      username: 'incremental-owner',
      role: 'user',
    });
    const productBlueprint = await productBlueprintPlanner.create({
      projectId: 'incremental-workspace',
      prompt: 'Crie o sistema Agenda Viva para agendamentos e clientes com calendário, autenticação JWT e banco SQLite',
    });
    const seedId = `incremental-seed-${invalid}`;
    const initialGeneration = invalid ? undefined : await codeGenerator.generate({
      projectName: 'agenda-viva',
      projectType: ProjectType.FULLSTACK,
      entities: productBlueprint.data.map(entity => entity.name),
      productBlueprint,
      requirements: {
        description: productBlueprint.product.summary,
        features: productBlueprint.capabilities.map(capability => capability.name),
        tech_stack: { frontend: ['react', 'typescript'], backend: ['node', 'express', 'typescript'], database: 'sqlite' },
      },
      database: { type: 'sqlite', entities: productBlueprint.data.map(entity => entity.name) },
      authentication: true,
      api_type: 'rest',
    });
    const initialFiles = initialGeneration?.files.map(file => ({
      name: file.filename,
      path: `${file.path}/${file.filename}`.replace(/^\/+/, '').replace(/\/+/g, '/'),
      content: file.content,
    })) || [];
    generationJobStore.update(seedId, {
      userId,
      status: 'ready',
      success: true,
      projectName: 'Agenda Viva',
      request: {
        prompt: 'Crie um sistema fullstack de agendamentos e clientes com autenticação JWT e banco SQLite',
        framework: 'react',
        language: 'typescript',
      },
      files: [...initialFiles, {
        name: 'manual.ts',
        path: 'frontend/src/manual.ts',
        content: 'export const manual = "Minha edição protegida";',
      }],
      metadata: { productBlueprint },
    });

    const imported = await request(app)
      .post('/api/v1/projects/from-generation')
      .set('Authorization', `Bearer ${token}`)
      .send({ generationId: seedId, name: 'Agenda Viva' });
    expect(imported.status).toBe(201);
    const project = imported.body.data.project;
    const file = project.files.find((item: any) => item.path === 'frontend/src/manual.ts');
    expect(file).toBeDefined();

    const editedContent = invalid
      ? 'export const manual: number = "Erro de tipo protegido";'
      : 'export const manual = "Minha edição manual preservada";';
    expect((await request(app)
      .put(`/api/v1/projects/${project.id}/files/${file.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: editedContent })).status).toBe(200);

    const started = await request(app)
      .post(`/api/v1/projects/${project.id}/regenerate`)
      .set('Authorization', `Bearer ${token}`)
      .send({ prompt: 'Adicione relatórios de ocupação e indicadores por profissional sem remover agenda, clientes ou autenticação' });
    expect(started.status).toBe(202);
    expect(started.body.data.protectedFiles).toBeGreaterThan(0);
    const generationId = started.body.data.generationId;

    let terminalStatus: string | undefined;
    for (let attempt = 0; attempt < 720; attempt++) {
      const status = await request(app)
        .get(`/api/generation/${generationId}/status`)
        .set('Authorization', `Bearer ${token}`);
      expect(status.status).toBe(200);
      if (status.body.data.status === 'failed') {
        if (!invalid) throw new Error(`${status.body.data.error}\n${JSON.stringify(status.body.data.diagnostics, null, 2)}`);
        expect(JSON.stringify(status.body.data.diagnostics)).toMatch(/TS2322|manual\.ts/);
        terminalStatus = 'failed';
        break;
      }
      if (status.body.data.status === 'ready') {
        terminalStatus = 'ready';
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    expect(terminalStatus).toBe(invalid ? 'failed' : 'ready');

    const reloaded = await request(app)
      .get(`/api/v1/projects/${project.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(reloaded.status).toBe(200);
    const regenerated = reloaded.body.data.project;
    expect(regenerated.files.find((item: any) => item.path === 'frontend/src/manual.ts').content).toBe(editedContent);
    if (invalid) {
      expect(regenerated.generationId).toBe(seedId);
      expect(regenerated.productBlueprint.version).toBe(productBlueprint.version);
      expect(regenerated.revisions.some((revision: any) => revision.type === 'regenerate')).toBe(false);
      return;
    }
    expect(regenerated.files.length).toBeGreaterThan(1);
    expect(generationJobStore.get(generationId)?.metadata?.qualityGate?.runtimeValidation?.runtime)
      .toMatchObject({ passed: true, mode: 'production', healthPath: '/health' });
    expect(regenerated.revisions.at(-1)).toMatchObject({ type: 'regenerate' });
    expect(regenerated.files.some((item: any) => /backend\/prisma\/migrations\/orus_[a-f0-9]+\/migration\.sql$/.test(item.path))).toBe(true);
    expect(regenerated.productBlueprint).toMatchObject({
      blueprintId: productBlueprint.blueprintId,
      version: productBlueprint.version + 1,
      product: { name: productBlueprint.product.name },
    });
    expect(regenerated.productBlueprint.visualIntent.archetype).not.toBe('commerce');
    expect(regenerated.productBlueprint.capabilities.map((item: any) => item.name)).toEqual(expect.arrayContaining([
      'Agendamentos',
      'Clientes',
      'Relatórios e análises',
    ]));
    expect(regenerated.productBlueprint.data.map((item: any) => item.name)).not.toContain('Product');
  });
});
