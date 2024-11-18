# Migration Guide

To make the app user friendly on a mixed VPS / Dedicated Server (mixed as in it can support php, nodejs, AND python) which helps reduce costs, reverse proxy is used to pass a friendly url's request to an internal port.

Database: Adjust the MONGODB_URI at the .env file for authenticating and accessing your Mongo database.

Start script at remote server:
- From the app root folder: `npm run start`