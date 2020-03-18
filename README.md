Beatdown
========

simplified JavaScript module bundling


Contributing
------------

* ensure [Node](https://nodejs.org) is installed
* `npm install` downloads dependencies
* `npm test` runs the test suite and checks code for stylistic consistency


Release Process
---------------

NB: version numbers are incremented in accordance with
    [semantic versioning](https://semver.org)

1. update version number in `package.json`
2. commit as "v#.#.#"

        $ git commit -m "v`node -p -e 'require("./package.json").version'`"

    the commit description should also include a rationale, e.g. why a major
    version was required, and a list of significant changes

3. `./release` publishes the new version


License
-------

Beatdown is licensed under the Apache 2.0 License.
