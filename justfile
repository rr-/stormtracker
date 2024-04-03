set positional-arguments
set dotenv-load

build:
    docker-compose build "$@"
kill:
    docker-compose kill
up:
    docker-compose up

[confirm]
update:
    #!/usr/bin/env bash
    if [[ $ENV != 'prod' ]]; then
        echo 'Can only run in prod'
        exit 1
    fi
    git fetch
    git reset --hard origin/main
    docker-compose build
    docker-compose up -d --force-recreate --remove-orphans
