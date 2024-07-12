# Inspired from: https://github.com/BretFisher/node-docker-good-defaults/

# Specify the base image
FROM node:20-slim

# Accept NODE_ENV as an argument; default to production
ARG NODE_ENV
ARG HOST_UID
ARG HOST_GID

# Fix bind-mount permissions on non-Docker-Deskop environments
RUN if [ ! -z "$HOST_UID" ] && [ ! -z "$HOST_GID" ]; then \
        groupmod -g $HOST_GID node && \
        usermod -u $HOST_UID -g $HOST_GID node; \
    fi

# you'll likely want the latest npm, regardless of node version, for speed and fixes
# but pin this version for the best stability
RUN npm i npm@latest -g

# install dependencies conditionally based on NODE_ENV first
# in a different location for easier app bind mounting for local development
# WORKDIR now sets correct permissions if you set USER first
USER node
WORKDIR /opt/node_app
COPY --chown=node:node package.json package-lock.json* ./
RUN if [ "$NODE_ENV" = "development" ]; \
    then npm ci && npm cache clean --force; \
    else npm ci --omit=dev && npm cache clean --force; \
    fi

# Set the PATH to include the node_modules/.bin from the /opt/node_app directory
# Set the Vite Cache to use the node_modules/ from the /opt/node_app directory
ENV PATH /opt/node_app/node_modules/.bin:$PATH
ENV VITE_CACHE_DIR /opt/node_app/node_modules/.vite

# Change the working directory to /opt/node_app/app
# This will be the directory where the application code resides
WORKDIR /opt/node_app/app
RUN mkdir ./node_modules
RUN chown -R node:node ./node_modules
COPY --chown=node:node . .

# Default command to run the application
CMD if [ "$NODE_ENV" = "development" ]; \
    then FORCE_COLOR=1 npm run dev; \
    else FORCE_COLOR=1 npm start; \
    fi
