import { Student } from '../models/student.model';
import { studentRepository } from '../repositories/student.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class StudentService {
  private readonly repository = studentRepository;
  private readonly workflow = null as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Student[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Student | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Student> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Student>): Promise<Student> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Student> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Student');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Student>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Student not found');
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