import { Attendee } from '../models/attendee.model';
import { attendeeRepository } from '../repositories/attendee.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class AttendeeService {
  private readonly repository = attendeeRepository;
  private readonly workflow = {"field":"status","initial":"registered","transitions":{"registered":["confirmed","cancelled"],"confirmed":["checked_in","cancelled"],"checked_in":[],"cancelled":["registered"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Attendee[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Attendee | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Attendee, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Attendee> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Attendee>): Promise<Attendee> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Attendee> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Attendee');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Attendee>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Attendee not found');
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