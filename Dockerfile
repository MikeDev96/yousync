# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# YouSync
#
# One image serving both halves of the app: the Express + Socket.IO server,
# and the Create React App bundle it hands out as static files.
#
# The client is built on Node 16 rather than the runtime's Node 22. It is a
# react-scripts 3 app, and webpack 4 asks OpenSSL for an md4 hash that OpenSSL
# 3 refuses to provide — building on the Node the app was written against is
# less fragile than carrying --openssl-legacy-provider forward forever. Nothing
# from that stage but the finished bundle reaches the runtime image.
# ---------------------------------------------------------------------------

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# --- Client dependencies -------------------------------------------------- #
FROM node:16-bullseye-slim AS client-deps
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci

# --- Client build --------------------------------------------------------- #
FROM node:16-bullseye-slim AS client-build
WORKDIR /app/client
COPY --from=client-deps /app/client/node_modules ./node_modules
COPY client/ ./
# Set to a path (e.g. /yousync) to serve the app from a sub-directory; the
# client bakes it into its asset URLs and its Socket.IO path at build time.
ARG PUBLIC_URL=""
ENV PUBLIC_URL=$PUBLIC_URL
# react-scripts turns warnings into errors when it thinks it is on CI, which
# it would be for every build that runs in Actions.
ENV CI=false
RUN npm run build

# --- Server dependencies -------------------------------------------------- #
FROM base AS server-deps
COPY package.json package-lock.json ./
# nodemon and friends have no business in the image that ships.
RUN npm ci --omit=dev

# --- Runtime -------------------------------------------------------------- #
FROM base AS runner
ENV NODE_ENV=production \
    PORT=4001

# Stamped by CI so /api/health can say what shipped. Empty in a hand-built
# image, which is fine — nothing depends on them.
ARG APP_COMMIT=""
ARG APP_COMMIT_MESSAGE=""
ENV APP_COMMIT=$APP_COMMIT
ENV APP_COMMIT_MESSAGE=$APP_COMMIT_MESSAGE

# node:22 already ships an unprivileged `node` user; reusing it keeps the image
# free of a useradd layer, and the app owns nothing it needs to write to.
COPY --from=server-deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json index.js YouTubeParse.js ./
COPY --chown=node:node src ./src
COPY --from=client-build --chown=node:node /app/client/build ./client/build

USER node
EXPOSE 4001

HEALTHCHECK --interval=60s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# No entrypoint script and no npm in front of it: the app keeps no state, and
# node as PID 1 receives SIGTERM directly instead of through a shell that
# would swallow it.
CMD ["node", "index.js"]
