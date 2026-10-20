import express from 'express';
import request from 'supertest';
import { blueprintRoutes } from '../../src/routes/blueprint.routes';
import { generationRoutes } from '../../src/routes/generation.routes';
import { authenticationMiddleware } from '../../src/middleware/authentication.middleware';
import { errorHandlerMiddleware } from '../../src/middleware/error-handler.middleware';
import { learningEngine } from '../../src/engines/learning-engine';

describe('Blueprint document routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/blueprints', blueprintRoutes);
  app.use('/api/v1/generation', generationRoutes);
  app.use(errorHandlerMiddleware.handle);

  beforeEach(() => {
    jest.spyOn(learningEngine, 'recordEvent').mockResolvedValue({ success: true } as any);
  });

  afterEach(() => jest.restoreAllMocks());

  it('extracts a document through the real Blueprint pipeline and creates a Product Blueprint', async () => {
    const userId = `blueprint-owner-${Date.now()}`;
    const owner = authenticationMiddleware.generateToken({ userId, email: 'blueprint@orus.dev', username: 'owner', role: 'user' });
    const foreign = authenticationMiddleware.generateToken({ userId: `${userId}-foreign`, email: 'foreign@orus.dev', username: 'foreign', role: 'user' });
    const document = Buffer.from(`# Clínica Serena

Descrição: Plataforma para clínicas com agenda por profissional, cadastro de pacientes, prontuário, relatórios e autenticação JWT.

## Funcionalidades

- Agendamentos com calendário
- Pacientes e histórico clínico
- Relatórios operacionais
`, 'utf8');

    const upload = await request(app)
      .post('/api/v1/blueprints/upload')
      .set('Authorization', `Bearer ${owner}`)
      .field('projectId', 'serena-document')
      .attach('file', document, { filename: 'serena.md', contentType: 'text/markdown' });
    expect(upload.status).toBe(201);
    const blueprintId = upload.body.data.blueprintId;

    let status;
    for (let attempt = 0; attempt < 20; attempt++) {
      status = await request(app)
        .get(`/api/v1/blueprints/${blueprintId}/status`)
        .set('Authorization', `Bearer ${owner}`);
      if (status.body.data.status === 'ready' || status.body.data.status === 'failed') break;
      await new Promise(resolve => setImmediate(resolve));
    }
    expect(status).toBeDefined();
    expect(status!.body.data).toMatchObject({ status: 'ready', progress: 100 });

    const details = await request(app)
      .get(`/api/v1/blueprints/${blueprintId}`)
      .set('Authorization', `Bearer ${owner}`)
      .expect(200);
    expect(details.body.data.parsedText).toContain('agenda por profissional');
    expect(details.body.data.processingResult.document.parsedData.metadata.projectName).toBe('Clínica Serena');
    expect(details.body.data.productBlueprint).toMatchObject({
      projectId: 'serena-document',
      source: { type: 'document', documentIds: expect.any(Array) },
      product: { name: 'Clínica Serena' },
    });
    expect(details.body.data.productBlueprint.capabilities.map((capability: any) => capability.name)).toEqual(expect.arrayContaining([
      'Agenda clínica', 'Cadastro de pacientes', 'Prontuário', 'Relatórios e análises',
    ]));

    await request(app)
      .get(`/api/v1/blueprints/${blueprintId}`)
      .set('Authorization', `Bearer ${foreign}`)
      .expect(404);

    await request(app)
      .post('/api/v1/generation/blueprint')
      .set('Authorization', `Bearer ${foreign}`)
      .send({
        blueprintId: details.body.data.productBlueprint.blueprintId,
        projectId: 'serena-document',
      })
      .expect(404);
  });

  it('rejects unsupported files instead of pretending to parse them', async () => {
    const owner = authenticationMiddleware.generateToken({
      userId: `blueprint-invalid-${Date.now()}`, email: 'invalid@orus.dev', username: 'owner', role: 'user',
    });
    const response = await request(app)
      .post('/api/v1/blueprints/upload')
      .set('Authorization', `Bearer ${owner}`)
      .attach('file', Buffer.from('%PDF-invalid'), { filename: 'idea.pdf', contentType: 'application/pdf' });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatchObject({ code: 'INVALID_FILE_TYPE' });
  });
});
