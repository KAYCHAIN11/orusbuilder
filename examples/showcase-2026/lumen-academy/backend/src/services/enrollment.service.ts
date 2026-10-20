import { Enrollment } from '../models/enrollment.model';
import { enrollmentRepository } from '../repositories/enrollment.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class EnrollmentService {
  private readonly repository = enrollmentRepository;
  private readonly workflow = {"field":"status","initial":"active","transitions":{"active":["completed","cancelled"],"completed":[],"cancelled":["active"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Enrollment[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Enrollment | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Enrollment> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Enrollment>): Promise<Enrollment> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Enrollment> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Enrollment');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Enrollment>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Enrollment not found');
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