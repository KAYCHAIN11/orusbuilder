import { EventSession } from '../models/eventsession.model';
import { eventsessionRepository } from '../repositories/eventsession.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class EventSessionService {
  private readonly repository = eventsessionRepository;
  private readonly workflow = {"field":"status","initial":"scheduled","transitions":{"scheduled":["live","cancelled"],"live":["completed"],"completed":[],"cancelled":["scheduled"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: EventSession[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<EventSession | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<EventSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EventSession> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<EventSession>): Promise<EventSession> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<EventSession> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for EventSession');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<EventSession>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('EventSession not found');
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