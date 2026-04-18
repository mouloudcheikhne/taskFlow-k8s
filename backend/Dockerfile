FROM node:22-alpine

WORKDIR /backend

COPY package.json .

RUN npm install

COPY . .

ENV PORT=3000 MONGO_URI=mongodb://localhost:27017/taskFlow
EXPOSE 3000
CMD ["npm", "start"]