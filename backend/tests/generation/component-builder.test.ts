import { componentBuilder, ComponentType } from '../../src/generation/component-builder';

describe('ComponentBuilder', () => {
  it('builds a typed React component without placeholders', async () => {
    const result = await componentBuilder.build({
      name: 'RevenueCard',
      type: ComponentType.REACT_FUNCTIONAL,
      props: [{ name: 'amount', type: 'number', required: true }],
      methods: [{
        name: 'formatAmount',
        parameters: [{ name: 'value', type: 'number' }],
        returnType: 'string',
        implementation: "return value.toLocaleString('pt-BR');",
      }],
    });

    expect(result.code).toContain('export interface RevenueCardProps');
    expect(result.code).toContain('const formatAmount = (value: number): string =>');
    expect(result.code).not.toContain('TODO');
    expect(result.tests).toContain('React.ComponentProps<typeof RevenueCard>');
  });

  it('rejects methods without executable implementations', async () => {
    await expect(componentBuilder.build({
      name: 'RevenueService',
      type: ComponentType.NODE_SERVICE,
      methods: [{
        name: 'calculate',
        parameters: [],
        returnType: 'number',
        implementation: '',
      }],
    })).rejects.toThrow('requires a valid name and implementation');
  });

  it('rejects invalid component identifiers before generation', async () => {
    await expect(componentBuilder.build({
      name: 'revenue-card',
      type: ComponentType.REACT_FUNCTIONAL,
    })).rejects.toThrow('valid PascalCase identifier');
  });
});
