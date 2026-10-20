import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  BlueprintStore,
  FileBlueprintRepository,
  type StoredBlueprint,
} from '../../src/blueprint/blueprint-store';

describe('BlueprintStore', () => {
  let directory: string;
  let filePath: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'orus-blueprint-store-'));
    filePath = join(directory, 'blueprints.json');
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  function blueprint(status: StoredBlueprint['status'] = 'ready'): StoredBlueprint {
    return {
      blueprintId: 'bp-persisted',
      name: 'produto.md',
      format: 'md',
      status,
      uploadedAt: new Date('2026-10-08T12:00:00.000Z'),
      processedAt: status === 'ready' ? new Date('2026-10-08T12:01:00.000Z') : undefined,
      userId: 'owner-1',
      projectId: 'product-1',
      fileSize: 128,
      parsedText: 'Produto com jornadas e regras próprias.',
    };
  }

  it('persists records atomically and restores dates', () => {
    const store = new BlueprintStore(new FileBlueprintRepository(filePath));
    store.save(blueprint());

    const restored = new BlueprintStore(new FileBlueprintRepository(filePath)).get('bp-persisted');

    expect(restored).toMatchObject({ status: 'ready', userId: 'owner-1', projectId: 'product-1' });
    expect(restored?.uploadedAt).toBeInstanceOf(Date);
    expect(restored?.processedAt).toBeInstanceOf(Date);
    expect(readFileSync(filePath, 'utf8')).not.toContain('.tmp');
  });

  it('fails interrupted processing closed after restart', () => {
    new BlueprintStore(new FileBlueprintRepository(filePath)).save(blueprint('parsing'));

    const restored = new BlueprintStore(new FileBlueprintRepository(filePath)).get('bp-persisted');

    expect(restored).toMatchObject({
      status: 'failed',
      error: 'Blueprint processing interrupted by process restart',
    });
  });

  it('preserves a corrupt store before starting empty', () => {
    writeFileSync(filePath, '{invalid', 'utf8');

    const store = new BlueprintStore(new FileBlueprintRepository(filePath));

    expect(store.values()).toEqual([]);
    const preserved = readdirSync(directory).find(name => name.startsWith('blueprints.json.corrupt-'));
    expect(preserved).toBeDefined();
    expect(readFileSync(join(directory, preserved!), 'utf8')).toBe('{invalid');
  });
});
