FROM node:16-alpine


## cpoy files to /app

WORKDIR /app
COPY . .

## done
USER node

CMD echo "Cert Monitor Image." && node index.js