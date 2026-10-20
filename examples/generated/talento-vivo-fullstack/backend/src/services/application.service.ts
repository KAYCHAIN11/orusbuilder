import { Application } from '../models/application.model';
import { applicationRepository } from '../repositories/application.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ApplicationService {
  private readonly repository = applicationRepository;
  private readonly workflow = {"field":"status","initial":"applied","transitions":{"applied":["screening","rejected"],"screening":["interview","rejected"],"interview":["offer","rejected"],"offer":["hired","rejected"],"hired":[],"rejected":["screening"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Application[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Application | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Application> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Application>): Promise<Application> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Application> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Application');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Application>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Application not found');
    const currentValue = String((current as unknown as Record<string, unknown>)[this.workflow.field] || this.workflow.initial);
    if (currentValue === nextValue) return;
    if (!(this.workflow.transitions[currentValue] || []).includes(nextValue)) {
      throw new ValidationError('Invalid workflow transition from ' + currentValue + ' to ' + nextValue);
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}