FROM node:16
WORKDIR /app
COPY package*.json ./
COPY yarn*.lock ./
RUN yarn install
EXPOSE 8066
CMD ['yarn', 'start']