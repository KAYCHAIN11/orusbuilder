import { promises as fs } from 'fs';
import * as path from 'path';
import {
  codeGenerator,
  ProjectType,
  type GeneratedFile,
} from '../src/generation/code-generator';
import { analyzeVisualIntent } from '../src/generation/visual-intent';
import { productBlueprintPlanner } from '../src/blueprint/product-blueprint';

async function main(): Promise<void> {
  const [outputArgument, entitiesArgument, ...promptParts] = process.argv.slice(2);
  if (!outputArgument || !entitiesArgument || promptParts.length === 0) {
    throw new Error('Usage: ts-node scripts/generate-fullstack-preview.ts <output-dir> <Entity,Entity> <prompt>');
  }

  const outputRoot = path.resolve(outputArgument);
  const requestedEntities = entitiesArgument.split(',').map(value => value.trim()).filter(Boolean);
  const prompt = promptParts.join(' ');
  const productBlueprint = await productBlueprintPlanner.create({
    prompt,
    projectId: path.basename(outputRoot),
    depth: 'complete',
  });
  const entities = productBlueprint.data.length > 0
    ? productBlueprint.data.map(entity => entity.name)
    : requestedEntities;
  const visualIntent = productBlueprint.visualIntent || analyzeVisualIntent(prompt);
  const result = await codeGenerator.generate({
    projectName: visualIntent.brandName.replace(/[^a-zA-Z0-9]/g, '') || 'OrusApp',
    projectType: ProjectType.FULLSTACK,
    entities,
    visualIntent,
    productBlueprint,
    requirements: {
      description: prompt,
      features: productBlueprint.capabilities.map(capability => capability.name),
      tech_stack: {
        frontend: ['react', 'typescript', 'tailwindcss'],
        backend: ['node', 'express', 'typescript'],
        database: 'sqlite',
      },
    },
    database: { type: 'sqlite', entities },
    api_type: 'rest',
    authentication: productBlueprint.architecture.authentication,
    options: {
      generateTests: false,
      generateDocs: true,
      optimizeCode: true,
      analyzeQuality: true,
      includeDocker: false,
      includeCICD: false,
    },
  });

  if (!result.success) throw new Error('Fullstack generation failed');
  for (const file of result.files) await writeGeneratedFile(outputRoot, file);

  process.stdout.write(`${JSON.stringify({
    outputRoot,
    files: result.files.length,
    visualIntent,
    blueprint: {
      id: productBlueprint.blueprintId,
      capabilities: productBlueprint.capabilities.length,
      screens: productBlueprint.screens.length,
      components: productBlueprint.components.length,
      entities,
    },
  }, null, 2)}\n`);
}

async function writeGeneratedFile(outputRoot: string, file: GeneratedFile): Promise<void> {
  const filename = file.filename || file.name;
  const target = path.resolve(outputRoot, file.path || '', filename);
  const relative = path.relative(outputRoot, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Generated path escaped the preview root: ${file.path}/${filename}`);
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, file.content, 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

