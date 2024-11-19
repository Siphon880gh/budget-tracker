# Migration Guide

To make the app user friendly on a mixed VPS / Dedicated Server (mixed as in it can support php, nodejs, AND python) which helps reduce costs, reverse proxy is used to pass a friendly url's request to an internal port.

Database: Adjust the MONGODB_URI at the .env file for authenticating and accessing your Mongo database.

Ports: Need unique express port.

Base URL - Here's how you replace the baseURL for this app:
- Run grep for `/app/budget-tracker/` and replace with your new baseURL. Or you may use sed to match and replace.
- Run grep for `/app/budget-tracker` and replace with your new baseURL. Or you may use sed to match and replace.

Envs:
- ./.env

Reverse Proxies: 
- `/app/budget-tracker[/]*` proxy passes to `127.0.0.1:PORT` where PORT is the unique Express port.

Eg.
```
  # Reverse proxy
  location ~ /app/budget-tracker[/]* {
    rewrite ^/app/budget-tracker[/]*(.*)$ /$1 break;
    proxy_pass http://127.0.0.1:3001;
    proxy_read_timeout 300s;   # Adjust as needed
    proxy_connect_timeout 300s; # Adjust as needed
    proxy_send_timeout 300s;   # Adjust as needed
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Enable CORS
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization' always;
    
    # Handle OPTIONS (preflight) requests
    if ($request_method = OPTIONS) {
      add_header 'Access-Control-Allow-Origin' '*';
      add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
      add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization';
      add_header 'Access-Control-Max-Age' 1728000;
      return 204;
    }
  }
```

Start script at remote server:
- From the app root folder: `npm run start`