import { Delivery } from '../models/delivery.model';
import { deliveryRepository } from '../repositories/delivery.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class DeliveryService {
  private readonly repository = deliveryRepository;
  private readonly workflow = {"field":"status","initial":"scheduled","transitions":{"scheduled":["en_route","failed"],"en_route":["delivered","failed"],"delivered":[],"failed":["scheduled"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Delivery[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Delivery | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Delivery> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Delivery>): Promise<Delivery> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Delivery> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Delivery');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Delivery>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Delivery not found');
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