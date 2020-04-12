FROM node:10
WORKDIR /home/dave/playlistah
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 2728
CMD [ "npm", "start" ]