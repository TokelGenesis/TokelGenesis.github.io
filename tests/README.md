# Site tests

Real browser (Electron + Playwright) against a local copy of the site:

    python3 -m http.server 8766 --bind 127.0.0.1      # in the site folder
    CLAUDE_JOB_DIR=/tmp/tg ELECTRON=/path/to/electron xvfb-run -a node tests/site.test.mjs
    CLAUDE_JOB_DIR=/tmp/tg ELECTRON=/path/to/electron xvfb-run -a node tests/audit.test.mjs
    CLAUDE_JOB_DIR=/tmp/tg ELECTRON=/path/to/electron xvfb-run -a node tests/support.test.mjs

`site.test.mjs` clicks every button and link on desktop, iPad and iPhone in light and dark mode, both languages.
`audit.test.mjs` checks extreme screen sizes, reduced motion, explorer outage, no-JavaScript, keyboard use,
WCAG contrast, heading structure, manifest icons and offline files.
`support.test.mjs` checks the OniU section, the donation address and the USDT to TKL form against a fake OniU sale API:
form checks, every server refusal, a full order to delivery, reload, language switch, hostile server answers, phone layout.
On machines without a GPU, add `--disable-gpu` to the Electron arguments if pages load very slowly.
($CLAUDE_JOB_DIR/tmp must contain blank.cjs: an Electron main file opening an empty window.)
