import { existsSync, readFileSync } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { LearningEngine, LearningSource, PatternType } from '../../src/engines/learning-engine';

describe('LearningEngine persistence', () => {
  it('persists only hashed patterns and models in an atomic state file', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'orus-learning-'));
    const filePath = join(directory, 'learning.json');
    const previousEnvironment = process.env['NODE_ENV'];
    const previousPath = process.env['ORUS_LEARNING_STORE_FILE'];
    process.env['NODE_ENV'] = 'development';
    process.env['ORUS_LEARNING_STORE_FILE'] = filePath;

    try {
      const engine = new LearningEngine();
      await engine.initialize({
        enabled: true,
        enablePatternRecognition: true,
        enablePredictive: true,
        enableCrossProject: true,
        minConfidence: 70,
        maxPatterns: 10,
        autoLearn: true,
      });
      await engine.recordEvent(
        LearningSource.GENERATION,
        PatternType.SUCCESS_PATTERN,
        { context: { domain: 'clinic' }, prompt: 'private prompt content' },
        { architecture: 'modular' },
        true,
      );
      await engine.stop();

      expect(existsSync(filePath)).toBe(true);
      const stored = readFileSync(filePath, 'utf8');
      expect(stored).not.toContain('private prompt content');
      expect(JSON.parse(stored)).toMatchObject({ schemaVersion: 1 });

      const restored = new LearningEngine();
      const initialized = await restored.initialize({
        enabled: true,
        enablePatternRecognition: true,
        enablePredictive: true,
        enableCrossProject: true,
        minConfidence: 70,
        maxPatterns: 10,
        autoLearn: false,
      }) as { loadedPatterns: number; loadedModels: number };
      expect(initialized.loadedPatterns).toBe(1);
      expect(initialized.loadedModels).toBe(1);
      await restored.stop();
    } finally {
      if (previousEnvironment === undefined) delete process.env['NODE_ENV'];
      else process.env['NODE_ENV'] = previousEnvironment;
      if (previousPath === undefined) delete process.env['ORUS_LEARNING_STORE_FILE'];
      else process.env['ORUS_LEARNING_STORE_FILE'] = previousPath;
      await rm(directory, { recursive: true, force: true });
    }
  });
});
