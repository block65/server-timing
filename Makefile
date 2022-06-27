
SRCS = $(wildcard lib/**)

all: dist

.PHONY: clean
clean:
	yarn tsc -b --clean 

.PHONY: test
test:
	NODE_OPTIONS=--experimental-vm-modules yarn jest 

dist: tsconfig.json $(SRCS)
	yarn tsc

.PHONY: dev
dev: 
	yarn tsc -w
	