import { Vehicle } from '../models/vehicle.model';
import { vehicleRepository } from '../repositories/vehicle.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class VehicleService {
  private readonly repository = vehicleRepository;
  private readonly workflow = {"field":"status","initial":"available","transitions":{"available":["assigned","maintenance","inactive"],"assigned":["available","maintenance"],"maintenance":["available","inactive"],"inactive":["available"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Vehicle[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Vehicle> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Vehicle> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Vehicle');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Vehicle>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Vehicle not found');
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