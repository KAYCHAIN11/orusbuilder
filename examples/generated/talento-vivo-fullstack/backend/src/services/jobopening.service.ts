import { JobOpening } from '../models/jobopening.model';
import { jobopeningRepository } from '../repositories/jobopening.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class JobOpeningService {
  private readonly repository = jobopeningRepository;
  private readonly workflow = {"field":"status","initial":"draft","transitions":{"draft":["open"],"open":["paused","closed"],"paused":["open","closed"],"closed":[]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: JobOpening[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<JobOpening | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<JobOpening, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<JobOpening> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<JobOpening>): Promise<JobOpening> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<JobOpening> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for JobOpening');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<JobOpening>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('JobOpening not found');
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