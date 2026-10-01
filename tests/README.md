# Site tests

Real browser (Electron + Playwright) against a local copy of the site:

    python3 -m http.server 8766 --bind 127.0.0.1      # in the site folder
    CLAUDE_JOB_DIR=/tmp/tg ELECTRON=/path/to/electron xvfb-run -a node tests/site.test.mjs
    CLAUDE_JOB_DIR=/tmp/tg ELECTRON=/path/to/electron xvfb-run -a node tests/audit.test.mjs

`site.test.mjs` clicks every button and link on desktop, iPad and iPhone in light and dark mode, both languages.
`audit.test.mjs` checks extreme screen sizes, reduced motion, explorer outage, no-JavaScript, keyboard use,
WCAG contrast, heading structure, manifest icons and offline files.
($CLAUDE_JOB_DIR/tmp must contain blank.cjs: an Electron main file opening an empty window.)
