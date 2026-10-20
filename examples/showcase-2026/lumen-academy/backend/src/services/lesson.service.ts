import { Lesson } from '../models/lesson.model';
import { lessonRepository } from '../repositories/lesson.repository';
import { NotFoundError, ValidationError } from '../utils/errors';

export class LessonService {
  private readonly repository = lessonRepository;
  private readonly workflow = {"field":"status","initial":"draft","transitions":{"draft":["published"],"published":["archived","draft"],"archived":["draft"]}} as { field: string; initial: string; transitions: Record<string, string[]> } | null;



  async findAll(options: { page: number; limit: number; search?: string; status?: string }): Promise<{ items: Lesson[]; total: number }> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<Lesson | null> {
    return this.repository.findById(id);
  }



  async create(
    data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Lesson> {
    
    return this.repository.create(data);
  }

  async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    
    if (this.workflow) {
      const nextValue = (data as Record<string, unknown>)[this.workflow.field];
      if (nextValue !== undefined) await this.validateTransition(id, String(nextValue));
    }
    return this.repository.update(id, data);
  }

  async transition(id: string, nextValue: string): Promise<Lesson> {
    if (!this.workflow) throw new ValidationError('No workflow is defined for Lesson');
    await this.validateTransition(id, nextValue);
    return this.repository.update(id, { [this.workflow.field]: nextValue } as Partial<Lesson>);
  }

  private async validateTransition(id: string, nextValue: string): Promise<void> {
    if (!this.workflow) return;
    const current = await this.repository.findById(id);
    if (!current) throw new NotFoundError('Lesson not found');
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