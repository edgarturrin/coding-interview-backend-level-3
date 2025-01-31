import { initializeServer } from '../src/server'
import { Server } from '@hapi/hapi'
import { mysqlConnect } from '../src/config/database/mysql'
import { redisConnect, closeRedisConnection } from '../src/config/database/redis'
import { sequelize } from '../src/config/database/mysql'
import { jest, describe, beforeAll, beforeEach, afterAll, it, expect } from '@jest/globals'
jest.setTimeout(120000);

describe('E2E Tests', () => {
    let server: Server
    type Item = {
        id: number
        name: string
        price: number
    }

    beforeAll(async () => {
        await mysqlConnect();
        await redisConnect();
        server = await initializeServer();
        await server.start();
    }, 30000)

    beforeEach(async () => {
        // Limpiar todas las tablas
        await sequelize.truncate({ cascade: true });
    })

    afterAll(async () => {
        try {
            // 1. Primero detener el servidor para evitar nuevas peticiones
            console.log("Deteniendo servidor...");
            if (server) {
                await server.stop();
            }
            
            // 2. Luego cerrar las conexiones de base de datos
            console.log("Cerrando conexiones a bases de datos...");
            
            // Cerrar MySQL con timeout
            const closeMySQL = async () => {
                try {
                    // Forzar cierre de todas las conexiones del pool
                    await sequelize.connectionManager.close();
                    // Cerrar Sequelize
                    await sequelize.close();
                    console.log("MySQL cerrado");
                } catch (error) {
                    console.error("Error cerrando MySQL:", error);
                    throw error;
                }
            };

            // Cerrar Redis y MySQL con timeout
            await Promise.race([
                Promise.all([
                    closeMySQL(),
                    closeRedisConnection().then(() => console.log("Redis cerrado"))
                ]),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout cerrando conexiones')), 10000)
                )
            ]).catch(error => {
                console.error('Error o timeout cerrando conexiones:', error);
                // Continuar con la ejecución incluso si hay timeout
            });
            
            console.log("Finalizó afterAll");
        } catch (error) {
            console.error('Error durante la limpieza:', error);
            throw error;
        }
    }, 240000)

    it('should get a response with status code 200', async () => {
        await server.inject({
            method: 'GET',
            url: '/ping'
        })
            .then(response => {
                expect(response.statusCode).toBe(200)
                expect(response.result).toEqual({ ok: true })
            })
    });

    describe("Basic Items functionality", () => {
        it("should be able to list all items", async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/items'
            })
            expect(response.statusCode).toBe(200)
            expect(response.result).toEqual([])

            await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })

            const response2 = await server.inject({
                method: 'GET',
                url: '/items'
            })
            expect(response2.statusCode).toBe(200)
            expect(response2.result).toEqual([{
                id: expect.any(Number),
                name: 'Item 1',
                price: 10
            }])
        })

        it("should be able to create a new item and get it by id", async () => {
            const response = await server.inject<Item>({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })
            expect(response.statusCode).toBe(201)
            expect(response.result).toEqual({
                id: expect.any(Number),
                name: 'Item 1',
                price: 10
            })

            const response2 = await server.inject({
                method: 'GET',
                url: `/items/${response.result!.id}`
            })

            expect(response2.statusCode).toBe(200)
            expect(response2.result).toEqual({
                id: expect.any(Number),
                name: 'Item 1',
                price: 10
            })
        })

        it("should be able to update an item", async () => {
            const { result: createdItem } = await server.inject<Item>({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })

            expect(createdItem).toBeDefined()

            const response = await server.inject({
                method: 'PUT',
                url: `/items/${createdItem!.id}`,
                payload: {
                    name: 'Item 1 updated',
                    price: 20
                }
            })
            expect(response.statusCode).toBe(200)
            expect(response.result).toEqual({
                id: createdItem!.id,
                name: 'Item 1 updated',
                price: 20
            })

            const response2 = await server.inject({
                method: 'GET',
                url: `/items/${createdItem!.id}`
            })
            expect(response2.statusCode).toBe(200)
            expect(response2.result).toEqual({
                id: createdItem!.id,
                name: 'Item 1 updated',
                price: 20
            })
        })

        it("should be able to delete an item", async () => {
            const { result: createdItem } = await server.inject<Item>({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })

            expect(createdItem).toBeDefined()

            const response = await server.inject({
                method: 'DELETE',
                url: `/items/${createdItem!.id}`
            })
            expect(response.statusCode).toBe(204)

            const response2 = await server.inject({
                method: 'GET',
                url: `/items/${createdItem!.id}`
            })

            expect(response2.statusCode).toBe(404)
        })
    })

    describe("Validations", () => {

        it("should validate required fields", async ()=>{

            const response = await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1'
                }
            })

            expect(response.statusCode).toBe(400)
            expect(response.result).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Field "price" is required'
                    }
                ]
            })

        })

        it("should not allow for negative pricing for new items", async ()=>{
            const response = await server.inject({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: -10
                }
            })

            expect(response.statusCode).toBe(400)
            expect(response.result).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Field "price" cannot be negative'
                    }
                ]
            })
        })

        it("should not allow for negative pricing for updated items", async ()=>{
            const { result: createdItem } = await server.inject<Item>({
                method: 'POST',
                url: '/items',
                payload: {
                    name: 'Item 1',
                    price: 10
                }
            })

            expect(createdItem).toBeDefined()

            const response = await server.inject({
                method: 'PUT',
                url: `/items/${createdItem!.id}`,
                payload: {
                    name: 'Item 1 updated',
                    price: -20
                }
            })

            expect(response.statusCode).toBe(400)
            expect(response.result).toEqual({
                errors: [
                    {
                        field: 'price',
                        message: 'Field "price" cannot be negative'
                    }
                ]
            })
        })
    })

    afterAll(() => {
        return server.stop()
    })
})