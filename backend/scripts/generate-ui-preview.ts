import { promises as fs } from 'fs';
import * as path from 'path';
import { uiGenerator, type GeneratedUIFile } from '../src/generation/ui-generator';
import { productBlueprintPlanner } from '../src/blueprint/product-blueprint';

async function main(): Promise<void> {
  const [outputArgument, ...promptParts] = process.argv.slice(2);
  if (!outputArgument || promptParts.length === 0) {
    throw new Error('Usage: ts-node scripts/generate-ui-preview.ts <output-dir> <prompt>');
  }

  const outputRoot = path.resolve(outputArgument);
  const prompt = promptParts.join(' ');
  const productBlueprint = await productBlueprintPlanner.create({
    prompt,
    projectId: path.basename(outputRoot),
    depth: 'essential',
  });
  const result = await uiGenerator.generate({
    framework: 'react',
    generationType: 'LANDING_PAGE',
    requirements: {
      description: prompt,
      features: productBlueprint.capabilities.map(capability => capability.name),
      tech_stack: { frontend: ['react', 'typescript'] },
    },
    visualIntent: productBlueprint.visualIntent,
    productBlueprint,
  });

  for (const file of result.files) {
    await writeGeneratedFile(outputRoot, file);
  }

  process.stdout.write(`${JSON.stringify({
    outputRoot,
    files: result.files.length,
    visualIntent: result.metadata.visualIntent,
    componentPlan: result.metadata.componentPlan,
    blueprint: {
      id: productBlueprint.blueprintId,
      capabilities: productBlueprint.capabilities.length,
      screens: productBlueprint.screens.length,
      components: productBlueprint.components.length,
    },
  }, null, 2)}\n`);
}

async function writeGeneratedFile(outputRoot: string, file: GeneratedUIFile): Promise<void> {
  const target = path.resolve(outputRoot, file.path || '', file.name);
  const relative = path.relative(outputRoot, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Generated path escaped the preview root: ${file.path}/${file.name}`);
  }

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, file.content, 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

