# Tchoukball-Tracker

Application to track statistics.

## Running the Application

There are two options, run with local node and go or run within docker.

Certificates are required. Please contact the developers for these.

**Run Locally:**
1. MongoDB: `docker compose up mongodb`
1. Backend: `(cd server && go run main.go)`
1. Frontend: `npm start`

_To avoid using Docker entirely, Mongo can be run on your local machine or on Mongo Atlas_

**Run using Docker:**
```sh
docker compose up
```

## Prod

This is a work in progreess, but TLS is enabled acrossed the board.

**Build:**
```sh
sudo docker compose build --no-cache
```

**Run:**
```sh
sudo docker compose -f compose.prod.yaml up
```

_Please run all commands from root of the repo_s