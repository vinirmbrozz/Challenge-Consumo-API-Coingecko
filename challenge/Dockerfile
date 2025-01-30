FROM node

WORKDIR /app
RUN mkdir logs
COPY package*.json .
RUN npm install
COPY src .

CMD ["npm", "start"]