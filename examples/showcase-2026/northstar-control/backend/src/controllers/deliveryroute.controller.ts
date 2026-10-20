import { Request, Response, NextFunction } from 'express';
import { DeliveryRouteService } from '../services/deliveryroute.service';

export class DeliveryRouteController {
  private service: DeliveryRouteService;

  constructor() {
    this.service = new DeliveryRouteService();
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const result = await this.service.findAll({
        page,
        limit,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        status: typeof req.query.status === 'string' ? req.query.status : undefined,
      });
      res.json({ success: true, data: result.items, count: result.total, pagination: { page, limit, pages: Math.ceil(result.total / limit) } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.service.findById(id);

      if (!item) {
        res.status(404).json({
          success: false,
          message: 'DeliveryRoute not found',
        });
        return;
      }

      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }



  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json({
        success: true,
        data: item,
        message: 'DeliveryRoute created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.service.update(id, req.body);

      res.json({
        success: true,
        data: item,
        message: 'DeliveryRoute updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async transition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await this.service.transition(req.params.id, String(req.body.value || req.body.status || req.body.stage || ''));
      res.json({ success: true, data: item, message: 'DeliveryRoute workflow updated' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.service.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}