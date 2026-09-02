# YouSync

## How to set up a development environment
This is a quick and easy quide to get YouSync up and running ready for development!
### Prerequisites

### Clone the repository
```bash
git clone https://github.com/MikeDev96/yousync.git
```

### Create a .env.development file in the root folder of the client.
Populate it with the following:
```env
PUBLIC_URL=
REACT_APP_DEV_WS_URL=http://localhost:4001
//REACT_APP_DEV_WS_URL=http://192.168.1.219:4001
```

### Create a .env.production file in the root folder of the client.
Populate it with the following:
```env
PUBLIC_URL=/
```
### Install dependencies
Install Node dependencies in both the project root folder and in the /client folder

Use `npm ci` to install the Node dependencies so that you don't end up with a different package-lock.json

### Good to go
You should now be good to go, run `npm start` to get going!

---

## Running with Docker

The image contains both halves of the app: the Express + Socket.IO server, and
the built client it serves as static files. It keeps no state, so there is
nothing to mount and nothing to back up.

### From a source checkout
```bash
cp .env.example .env   # then put your YouTube Data API key in it
docker compose up -d --build
```

The app is on http://localhost:4001. Change `YOUSYNC_PORT` in `.env` to publish
it somewhere else — the container always listens on 4001 internally.

### From the published image
Every push to `master` builds `ghcr.io/mikedev96/yousync:latest`, tagged with
the commit sha as well. On a server, `docker-compose.yml` and a `.env` are all
you need:

```bash
docker compose pull && docker compose up -d
```

To roll back, set `YOUSYNC_TAG` in `.env` to a commit sha and bring it up again.

`GET /api/health` reports which build is running, and is what the container's
healthcheck polls — `docker compose ps` shows healthy once the server is up.

### Serving from a sub-path
The client bakes `PUBLIC_URL` in at build time, so the NGINX config below —
which serves the app at `/yousync/` and strips the prefix before proxying —
works with the default empty value. If you instead proxy *without* stripping
the prefix, build with it set:

```bash
docker compose build --build-arg PUBLIC_URL=/yousync
```

The client's `.env.development` / `.env.production` files are deliberately kept
out of the image, so a Docker build does not depend on files that only exist on
your machine.

---

## NGINX Config
```
server {
  location /yousync/ {
    proxy_pass http://localhost:4001/;
  }

  location /yousync/socket.io/ {
    proxy_pass http://localhost:4001/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```