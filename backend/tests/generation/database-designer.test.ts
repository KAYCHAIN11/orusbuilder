import { databaseDesigner } from '../../src/generation/database-designer';

describe('DatabaseDesigner domain preservation', () => {
  it('generates an authentication user without seeding credentials', async () => {
    const result = await databaseDesigner.design({
      type: 'sqlite',
      profile: 'crud',
      authentication: true,
      entities: [{ id: 'appointment', entity: 'Appointment' }],
    });
    const migration = result.files.find(file => file.filename === 'migration.sql')!.content;
    const seed = result.files.find(file => file.filename === 'seed.ts')!.content;
    expect(result.schema).toContain('model User');
    expect(result.schema).toContain('email       String      @unique');
    expect(result.schema).toContain('password    String');
    expect(migration).toContain('"email" TEXT NOT NULL UNIQUE');
    expect(migration).toContain('"password" TEXT NOT NULL');
    expect(seed).not.toContain('prisma.user.create');
    expect(seed).not.toContain("from 'bcryptjs'");
  });
  it('uses the CRUD contract without injecting task-management relations', async () => {
    const result = await databaseDesigner.design({
      type: 'sqlite',
      profile: 'crud',
      entities: ['Task', 'Project', 'Team'].map(entity => ({ id: entity, entity })),
    });
    expect(result.schema).toContain('model Task');
    expect(result.schema).toContain('model Project');
    expect(result.schema).toContain('model Team');
    expect(result.schema).not.toContain('userId');
    expect(result.schema).not.toContain('model Category');
    expect(result.files.find(file => file.filename === 'seed.ts')!.content).not.toContain('prisma.user');
  });
  it('keeps domain entities when authentication adds User', async () => {
    const result = await databaseDesigner.design({
      type: 'sqlite',
      entities: ['Patient', 'Appointment', 'Dashboard', 'User'].map(entity => ({
        id: entity.toLowerCase(),
        entity,
        attributes: [],
        relationships: [],
        constraints: [],
      })),
      requirements: 'Clinic management with authentication',
    });
    const schema = result.files.find(file => file.filename === 'schema.prisma')?.content || '';
    const migration = result.files.find(file => file.filename === 'migration.sql')?.content || '';

    expect(schema).toContain('model Patient');
    expect(schema).toContain('model Appointment');
    expect(schema).toContain('model Dashboard');
    expect(schema).toContain('model User');
    expect(schema).not.toContain('model Task');
    expect(schema).not.toContain('@db.Text');
    expect(migration).toContain('DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
    expect(migration).not.toContain('ENGINE=InnoDB');
    const seed = result.files.find(file => file.filename === 'seed.ts')?.content || '';
    expect(seed).not.toContain('prisma.task');
    expect(seed).not.toContain('prisma.category');
    expect(seed).toContain('prisma.patient.create');
    expect(seed).not.toContain("from 'bcryptjs'");
  });

  it('uses the task schema only when Task is explicitly requested', async () => {
    const result = await databaseDesigner.design({
      type: 'postgresql',
      entities: [{
        id: 'task',
        entity: 'Task',
        attributes: [],
        relationships: [],
        constraints: [],
      }],
      requirements: 'Task management',
    });
    const schema = result.files.find(file => file.filename === 'schema.prisma')?.content || '';

    expect(schema).toContain('model Task');
    expect(schema).toContain('model User');
  });

  it('generates a complete SQLite migration for task management', async () => {
    const result = await databaseDesigner.design({
      type: 'sqlite',
      entities: [{
        id: 'task',
        entity: 'Task',
        attributes: [],
        relationships: [],
        constraints: [],
      }],
      requirements: 'Task management',
    });
    const migration = result.files.find(file => file.filename === 'migration.sql')?.content || '';

    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "users"');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "categories"');
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "tasks"');
    expect(migration).not.toContain('ENGINE=InnoDB');
    expect(result.schema).not.toContain('enum Task');
    expect(result.schema).toContain('@default("TODO")');
  });

  it.each(['sqlite', 'postgresql'] as const)('preserves additional task-domain entities for %s', async type => {
    const result = await databaseDesigner.design({
      type,
      entities: ['Task', 'Project', 'Team', 'StockMovement'].map(entity => ({ id: entity, entity })),
    });
    const migration = result.files.find(file => file.filename === 'migration.sql')!.content;
    const seed = result.files.find(file => file.filename === 'seed.ts')!.content;
    for (const entity of ['Task', 'Project', 'Team', 'StockMovement']) {
      expect(result.schema).toContain(`model ${entity} {`);
      expect(migration).toContain(`"${entity.toLowerCase()}s"`);
    }
    expect(seed).toContain('prisma.project.create');
    expect(seed).toContain('prisma.team.create');
    expect(seed).toContain('prisma.stockMovement.create');
  });

  it('generates navigable relations when both domain entities are present', async () => {
    const result = await databaseDesigner.design({
      type: 'sqlite',
      profile: 'crud',
      entities: [
        { id: 'company', entity: 'Company', attributes: [] },
        { id: 'contact', entity: 'Contact', attributes: [{ name: 'companyId', type: 'String', required: false, relationTo: 'Company' }] },
      ],
    });

    expect(result.schema).toContain('companyId String?');
    expect(result.schema).toContain('company Company? @relation("Contact_companyId_Company"');
    expect(result.schema).toContain('contacts Contact[] @relation("Contact_companyId_Company")');
  });

  it('seeds required domain fields with type-safe values', async () => {
    const result = await databaseDesigner.design({
      type: 'sqlite',
      profile: 'crud',
      entities: [
        { id: 'customer', entity: 'Customer', attributes: [{ name: 'email', type: 'String', required: true }] },
        { id: 'appointment', entity: 'Appointment', attributes: [
          { name: 'scheduledAt', type: 'DateTime', required: true },
          { name: 'professional', type: 'String', required: true },
        ] },
      ],
    });
    const seed = result.files.find(file => file.filename === 'seed.ts')!.content;
    expect(seed).toContain("email: 'sample@customer.test'");
    expect(seed).toContain('scheduledAt: new Date()');
    expect(seed).toContain("professional: 'Sample professional'");
  });

  it('keeps base-field requiredness and defaults aligned with the domain contract', async () => {
    const result = await databaseDesigner.design({
      type: 'sqlite',
      profile: 'crud',
      entities: [{
        id: 'notification',
        entity: 'Notification',
        attributes: [
          { name: 'name', type: 'String', required: true },
          { name: 'description', type: 'String', required: true },
          { name: 'status', type: 'String', required: true, defaultValue: 'pending' },
          { name: 'scheduledAt', type: 'DateTime', required: false },
        ],
      }],
    });
    const migration = result.files.find(file => file.filename === 'migration.sql')!.content;
    const seed = result.files.find(file => file.filename === 'seed.ts')!.content;

    expect(result.schema).toContain('description String\n');
    expect(result.schema).toContain('status String @default("pending")');
    expect(result.schema).toContain('scheduledAt DateTime?');
    expect(migration).toContain('"description" TEXT NOT NULL');
    expect(migration).toContain('"status" TEXT NOT NULL DEFAULT \'pending\'');
    expect(seed).toContain("status: 'pending'");
    expect(seed.match(/\n\s+name:/g)).toHaveLength(1);
    expect(seed.match(/\n\s+description:/g)).toHaveLength(1);
    expect(seed.match(/\n\s+status:/g)).toHaveLength(1);
  });
});
