FROM node:alpine
RUN npm install
COPY . .
RUN node exporter.js
