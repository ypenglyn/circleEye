TARGETS=\
	testceye.js \
	ceye.js 

all: $(TARGETS)

.PHONY: clean all test

test:
	@npm test

src/start.js: package.json bin/start
	bin/start > $@

ceye.js: $(shell node_modules/.bin/smash --ignore-missing --list src/ceye.js) package.json
	@rm -f $@
	node_modules/.bin/smash src/ceye.js | node_modules/.bin/uglifyjs - -b indent-level=2 -o $@
	@chmod a-w $@

testceye.js:
	@rm -f $@
	node_modules/.bin/smash src/ceye.js > $@ 
	
ceye.min.js: ceye.js bin/uglify
	@rm -f $@
	bin/uglify $< > $@

clean:
	rm -f -- $(TARGETS)
