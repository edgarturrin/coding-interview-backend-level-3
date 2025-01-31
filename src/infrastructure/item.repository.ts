import { Item } from '../domain/item';
import { ItemModel } from './models/item.model';
import { log } from '../config/logger';

export class ItemRepository {
    async create(item: Omit<Item, 'id'>): Promise<Item> {
        try {
            const newItem = await ItemModel.create({
                name: item.name,
                price: Number(item.price)
            });
            
            return {
                id: newItem.id,
                name: newItem.name,
                price: Number(newItem.price)
            };
        } catch (error) {
            log.error('Error creating item', error);
            throw error;
        }
    }

    async findAll(): Promise<Item[]> {
        try {
            const items = await ItemModel.findAll();
            return items.map(item => ({
                id: item.id,
                name: item.name,
                price: Number(item.price)
            }));
        } catch (error) {
            log.error('Error finding items', error);
            throw error;
        }
    }

    async findById(id: number): Promise<Item | null> {
        try {
            const item = await ItemModel.findByPk(id);
            if (!item) return null;
            
            return {
                id: item.id,
                name: item.name,
                price: Number(item.price)
            };
        } catch (error) {
            log.error('Error finding item', error);
            throw error;
        }
    }

    async update(id: number, item: Partial<Omit<Item, 'id'>>): Promise<Item | null> {
        try {
            if (item.price !== undefined) {
                item.price = Number(item.price);
            }

            const [updated] = await ItemModel.update(item, {
                where: { id }
            });

            if (updated === 0) return null;

            const updatedItem = await ItemModel.findByPk(id);
            if (!updatedItem) return null;

            return {
                id: updatedItem.id,
                name: updatedItem.name,
                price: Number(updatedItem.price)
            };
        } catch (error) {
            log.error('Error updating item', error);
            throw error;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            const deleted = await ItemModel.destroy({
                where: { id }
            });
            return deleted > 0;
        } catch (error) {
            log.error('Error deleting item', error);
            throw error;
        }
    }
} 