import { Framework } from '../../src/core/types/template.types';
import { templateManager } from '../../src/templates/template-manager';

describe('TemplateManager integration', () => {
  beforeEach(() => templateManager.clearCache());

  it('searches the canonical template library', async () => {
    const result = await templateManager.searchTemplates({
      keyword: 'dashboard',
      framework: Framework.REACT,
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.templates[0]?.id).toBe('react-dashboard-modern');
    expect(result.templates[0]?.files.length).toBeGreaterThan(0);
  });

  it('matches meaningful terms from a natural-language request', async () => {
    const result = await templateManager.searchTemplates({
      keyword: 'Crie uma experiência analítica com dashboard responsivo',
      framework: Framework.REACT,
    });

    expect(result.templates.map(template => template.id)).toContain('react-dashboard-modern');
  });

  it('customizes and validates files through the existing template components', async () => {
    const result = await templateManager.generateFromTemplate('react-dashboard-modern', {
      templateId: 'react-dashboard-modern',
      variables: { title: 'Receita previsível' },
      slots: { content: '<section>Pipeline comercial</section>' },
    });

    expect(result.success).toBe(true);
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.content).toContain('Receita previsível');
    expect(result.files[0]?.content).toContain('Pipeline comercial');
    expect(result.files[0]?.content).not.toContain('{{');
  });

  it('rejects missing required customization values', async () => {
    const result = await templateManager.generateFromTemplate('react-dashboard-modern', {
      templateId: 'react-dashboard-modern',
      variables: {},
      slots: {},
    });

    expect(result.success).toBe(false);
    expect(result.errors?.join(' ')).toContain('Required variable missing');
  });
});
