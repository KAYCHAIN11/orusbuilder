import { Candidate } from '../models/candidate.model';
import { candidateRepository } from '../repositories/candidate.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class CandidateService {
  private readonly repository = candidateRepository;
  private readonly workflow = {"field":"status","initial":"available","transitions":{"available":["in_process","archived"],"in_process":["available","hired","archived"],"hired":["archived"],"archived":["available"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Candidate[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Candidate | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Candidate> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Candidate>): Promise<Candidate> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Candidate> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Candidate');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Candidate>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Candidate not found');
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