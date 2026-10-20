import { Shipment } from '../models/shipment.model';
import { shipmentRepository } from '../repositories/shipment.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ShipmentService {
  private readonly repository = shipmentRepository;
  private readonly workflow = {"field":"status","initial":"created","transitions":{"created":["dispatched"],"dispatched":["in_transit","exception"],"in_transit":["delivered","exception"],"delivered":[],"exception":["in_transit","delivered"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Shipment[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Shipment | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Shipment> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Shipment>): Promise<Shipment> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Shipment> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Shipment');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Shipment>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Shipment not found');
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