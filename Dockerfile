FROM node:18-alpine

WORKDIR /usr/src/app

# Instalar cliente MySQL
RUN apk add --no-cache mysql-client

# Copiar solo los archivos necesarios primero
COPY package.json ./

# Instalar dependencias
RUN npm init -y && \
    npm install --save \
    @hapi/hapi \
    @hapi/boom \
    @hapi/joi \
    ioredis \
    mysql2 \
    sequelize \
    winston && \
    npm install --save-dev \
    typescript \
    ts-node \
    ts-jest \
    jest \
    @types/jest \
    @types/node \
    @types/hapi__joi

# Copiar el resto de los archivos
COPY . .

CMD ["npm", "run", "test:e2e"] 