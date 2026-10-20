import { FollowUp } from '../models/followup.model';
import { followupRepository } from '../repositories/followup.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class FollowUpService {
  private readonly repository = followupRepository;
  private readonly workflow = null as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: FollowUp[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<FollowUp | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FollowUp> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<FollowUp>): Promise<FollowUp> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<FollowUp> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for FollowUp');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<FollowUp>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('FollowUp not found');
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