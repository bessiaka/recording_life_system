FROM node:20-alpine

WORKDIR /app

# Копирование package.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
