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