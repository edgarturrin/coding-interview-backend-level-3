import { Server, Request, ResponseToolkit } from '@hapi/hapi';
import Boom from '@hapi/boom';
import { IItemService } from '../../business/item.service';
import { log } from '../../config/logger';
import { createItemSchema, updateItemSchema } from '../../domain/item.schema';
import { Item } from '../../domain/item';

export class ItemController {
    private logger = log.withContext('ItemController');

    constructor(private readonly itemService: IItemService) {}

    public registerRoutes(server: Server): void {
        server.route([
            {
                method: 'GET',
                path: '/items',
                handler: this.getAll.bind(this)
            },
            {
                method: 'POST',
                path: '/items',
                handler: this.create.bind(this),
                options: {
                    validate: {
                        payload: createItemSchema,
                        failAction: async (request, h, err) => {
                            throw Boom.badRequest(err.message);
                        }
                    }
                }
            },
            {
                method: 'GET',
                path: '/items/{id}',
                handler: this.getById.bind(this)
            },
            {
                method: 'PUT',
                path: '/items/{id}',
                handler: this.update.bind(this),
                options: {
                    validate: {
                        payload: updateItemSchema,
                        failAction: async (request, h, err) => {
                            throw Boom.badRequest(err.message);
                        }
                    }
                }
            },
            {
                method: 'DELETE',
                path: '/items/{id}',
                handler: this.delete.bind(this)
            }
        ]);
    }

    private async getAll(request: Request, h: ResponseToolkit) {
        try {
            const items = await this.itemService.findAll();
            this.logger.debug('Retrieved all items', { count: items.length });
            return h.response(items).code(200);
        } catch (error) {
            this.logger.error('Error getting items', error);
            throw Boom.badImplementation();
        }
    }

    private async getById(request: Request, h: ResponseToolkit) {
        try {
            const id = request.params.id;
            if (!id) {
                throw Boom.badRequest('Item ID is required');
            }

            const item = await this.itemService.findById(id);
            if (!item) {
                throw Boom.notFound(`Item ${id} not found`);
            }

            this.logger.debug('Retrieved item', { id });
            return h.response(item).code(200);
        } catch (error) {
            this.logger.error('Error getting item', error);
            throw error instanceof Boom.Boom ? error : Boom.badImplementation();
        }
    }

    private create = async (request: Request, h: ResponseToolkit) => {
        try {
            const payload = request.payload as Item;
            const item = await this.itemService.create(payload);
            this.logger.debug('Created item', { id: item.id });
            return h.response(item).code(201);
        } catch (error) {
            this.logger.error('Error creating item', error);
            throw Boom.badImplementation();
        }
    };

    private update = async (request: Request, h: ResponseToolkit) => {
        try {
            const id = request.params.id;
            const updates = request.payload as Partial<Item>;

            if (!id) {
                throw Boom.badRequest('Item ID is required');
            }

            const updatedItem = await this.itemService.update(id, updates);
            if (!updatedItem) {
                throw Boom.notFound(`Item ${id} not found`);
            }

            this.logger.debug('Updated item', { id });
            return h.response(updatedItem).code(200);
        } catch (error) {
            this.logger.error('Error updating item', error);
            throw Boom.badImplementation();
        }
    };

    private delete = async (request: Request, h: ResponseToolkit) => {
        try {
            const id = request.params.id;
            if (!id) {
                throw Boom.badRequest('Item ID is required');
            }

            const deleted = await this.itemService.delete(id);
            if (!deleted) {
                throw Boom.notFound(`Item ${id} not found`);
            }

            this.logger.debug('Deleted item', { id });
            return h.response().code(204);
        } catch (error) {
            this.logger.error('Error deleting item', error);
            throw Boom.badImplementation();
        }
    };
} 