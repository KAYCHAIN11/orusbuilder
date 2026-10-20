import { Ticket } from '../models/ticket.model';
import { ticketRepository } from '../repositories/ticket.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class TicketService {
  private readonly repository = ticketRepository;
  private readonly workflow = {"field":"status","initial":"available","transitions":{"available":["reserved","issued","cancelled"],"reserved":["available","issued","cancelled"],"issued":["used","cancelled"],"used":[],"cancelled":[]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Ticket[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Ticket> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Ticket>): Promise<Ticket> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Ticket> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Ticket');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Ticket>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Ticket not found');
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