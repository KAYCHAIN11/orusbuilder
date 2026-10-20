import { Professional } from '../models/professional.model';
import { professionalRepository } from '../repositories/professional.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ProfessionalService {
  private readonly repository = professionalRepository;
  private readonly workflow = null as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Professional[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Professional | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Professional> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Professional>): Promise<Professional> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Professional> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Professional');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Professional>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Professional not found');
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