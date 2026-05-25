.PHONY: install dev test build docker-dev docker-prod

install:
	npm ci

dev:
	npm run dev

test:
	npm test

test-watch:
	npm run test:watch

build:
	npm run build

docker-dev:
	docker build -f Dockerfile.dev -t kalkulator-dev . && docker run --rm -p 5173:5173 -v $(PWD)/src:/app/src -e CHOKIDAR_USEPOLLING=true kalkulator-dev

docker-prod:
	docker build -t kalkulator . && docker run --rm -p 8080:80 kalkulator
