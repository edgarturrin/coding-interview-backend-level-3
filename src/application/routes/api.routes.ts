import { ItemController } from '../controllers/item.controller';
import { ItemService } from '../../business/item.service';
import { ItemRepository } from '../../infrastructure/item.repository';
import { Server } from '@hapi/hapi';

const itemRepository = new ItemRepository();
const itemService = new ItemService(itemRepository);
const itemController = new ItemController(itemService);

export const registerApiRoutes = (server: Server) => {
    itemController.registerRoutes(server);
}; 