import { Assessment } from '../models/assessment.model';
import { assessmentRepository } from '../repositories/assessment.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class AssessmentService {
  private readonly repository = assessmentRepository;
  private readonly workflow = {"field":"status","initial":"draft","transitions":{"draft":["open"],"open":["closed"],"closed":["open"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Assessment[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Assessment | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Assessment> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Assessment>): Promise<Assessment> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Assessment> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Assessment');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Assessment>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Assessment not found');
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