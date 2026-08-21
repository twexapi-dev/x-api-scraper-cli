---
description: Use the x-api-scraper skill to install, configure, test, or run x-api-scraper CLI workflows.
---

# x-api-scraper CLI

Use the installed `x-api-scraper-cli` skill for this task.

Prefer this command when the user wants to:

- install or run the `x-api-scraper` CLI
- configure API keys, app profiles, or auth profiles
- inspect request construction with `--dry-run`
- call x-api-scraper endpoints with convenience commands or raw paths
- fetch global trending tweets with `trending tweets`
- publish Markdown files as X articles with `article publish-md`

Default behavior:

1. Check whether `x-api-scraper` is available.
2. Use saved app auth or `X_API_SCRAPER_KEY` for read requests.
3. Require a saved profile or explicit cookie for write requests.
4. Prefer convenience commands first.
5. Use `--dry-run` before real write actions unless the user clearly asks to execute them.
