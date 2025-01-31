import { Item } from '../domain/item';
import { ItemRepository } from '../infrastructure/item.repository';

export interface IItemService {
    findAll(): Promise<Item[]>;
    findById(id: number): Promise<Item | null>;
    create(item: Omit<Item, 'id'>): Promise<Item>;
    update(id: number, item: Partial<Omit<Item, 'id'>>): Promise<Item | null>;
    delete(id: number): Promise<boolean>;
}

export class ItemService implements IItemService {
    constructor(private readonly itemRepository: ItemRepository) {}

    public async findAll(): Promise<Item[]> {
        return await this.itemRepository.findAll();
    }

    public async findById(id: number): Promise<Item | null> {
        return await this.itemRepository.findById(id);
    }

    public async create(item: Omit<Item, 'id'>): Promise<Item> {
        return await this.itemRepository.create(item);
    }

    public async update(id: number, item: Partial<Omit<Item, 'id'>>): Promise<Item | null> {
        return await this.itemRepository.update(id, item);
    }

    public async delete(id: number): Promise<boolean> {
        return await this.itemRepository.delete(id);
    }
} 