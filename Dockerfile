
FROM node:lts-alpine
RUN apk add --no-cache \
python3 \
make \
g++ \
cairo-dev \
pango-dev \
jpeg-dev \
giflib-dev \
librsvg-dev \
ffmpeg \
libtool \
autoconf \
libsodium \
automake \
icu-data-full

WORKDIR "/opt/aoshima-bot"
COPY . .
RUN npm i --omit=dev

CMD ["node", "src/index.js"]