build:
	env GOOS=linux go build -ldflags="-s -w" -o bin/hello hello/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/world world/main.go
	env GOOS=linux go build -ldflags="-s -w" -o bin/webhook webhook/main.go

.PHONY: clean
clean:
	rm -rf ./bin

.PHONY: deploy
deploy: clean build
	npm install
	npm run deploy
