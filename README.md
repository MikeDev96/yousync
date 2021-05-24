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