import { Appointment } from '../models/appointment.model';
import { appointmentRepository } from '../repositories/appointment.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class AppointmentService {
  private readonly repository = appointmentRepository;
  private readonly workflow = {"field":"status","initial":"scheduled","transitions":{"scheduled":["confirmed","cancelled"],"confirmed":["completed","cancelled"],"completed":[],"cancelled":["scheduled"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;


  private async ensureScheduleAvailability(data: Partial<Appointment>, excludeId?: string): Promise<void> {
    if (!data.scheduledAt || !data.professional) return;
    const start = new Date(data.scheduledAt);
    const duration = Number(data.durationMinutes || 30);
    const candidates = await this.repository.findScheduleCandidates(data.professional, start, excludeId);
    const end = start.getTime() + duration * 60_000;
    const conflict = candidates.some(candidate => {
      const candidateStart = new Date(candidate.scheduledAt).getTime();
      const candidateEnd = candidateStart + Number(candidate.durationMinutes || 30) * 60_000;
      return start.getTime() < candidateEnd && end > candidateStart;
    });
    if (conflict) throw new ValidationError('Appointment overlaps an existing schedule for this professional');
  }


  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Appointment[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Appointment> {
    await this.ensureScheduleAvailability(data);
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Appointment not found');
    await this.ensureScheduleAvailability({ ...current, ...data }, id);
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Appointment> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Appointment');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Appointment>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Appointment not found');
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