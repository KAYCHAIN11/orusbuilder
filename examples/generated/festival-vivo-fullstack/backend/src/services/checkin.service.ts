import { CheckIn } from '../models/checkin.model';
import { checkinRepository } from '../repositories/checkin.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class CheckInService {
  private readonly repository = checkinRepository;
  private readonly workflow = {"field":"status","initial":"pending","transitions":{"pending":["approved","denied"],"approved":[],"denied":["pending"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: CheckIn[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<CheckIn | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<CheckIn, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CheckIn> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<CheckIn>): Promise<CheckIn> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<CheckIn> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for CheckIn');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<CheckIn>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('CheckIn not found');
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