FROM node:10
WORKDIR /home/dave/playlistah
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]