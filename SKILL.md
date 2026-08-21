---
name: x-api-scraper-cli
description: Use this skill when the task should be done through the x-api-scraper command-line client, including installing the CLI, configuring Twitter/X app or profile auth, previewing requests, and calling x-api-scraper endpoints through convenience commands or raw paths.
---

# x-api-scraper-cli

Use this skill when the task should be completed by running `x-api-scraper` commands instead of re-implementing request logic by hand.

## Use this skill when

- the user wants to install or run the `x-api-scraper` CLI
- the user wants to configure an API key, cookie, or `auth_token`
- the user wants to test or inspect requests with `--dry-run`
- the user wants to call supported Twitter/X x-api-scraper commands for users, tweets, articles, dms, profile, timeline, global trending tweets, search, followers, following, lists, or follow actions
- the user knows an endpoint path and wants to call it through the generic `x-api-scraper <path>` form

Do not treat this skill as the main interface when the task is to edit the CLI source code itself.

## Default approach

1. Confirm the CLI is available.
2. Make sure an app config or API key is available for read requests.
3. Make sure a saved profile or explicit cookie is available for write requests.
4. Prefer convenience commands first.
5. Fall back to `x-api-scraper <path>` only when no convenience command fits.
6. Use `--dry-run` before real write actions unless the user explicitly asks to execute them.

## Install and run

For normal users, prefer the published npm package:

```bash
npm install -g @twexapi-dev/x-api-scraper-cli
x-api-scraper --help
```

When working from this repository:

```bash
node ./bin/x-api-scraper.js --help
```

If a local executable is needed while developing:

```bash
npm link
x-api-scraper --help
```

Requires Node.js 18 or newer.

## Auth rules

- API keys come from `https://twexapi.io/dashboard`.
- For one-off commands, `X_API_SCRAPER_KEY` or `--api-key` is acceptable.
- The CLI also respects `X_API_SCRAPER_BASE_URL` and `X_API_SCRAPER_CONFIG_DIR`.
- For repeated usage, prefer saved app configs with `auth apps add`.
- For write actions, require either `--cookie` or a saved profile.
- If a write action is requested without a usable profile or cookie, stop and ask for auth details instead of guessing.
- By default the CLI reads and writes persistent config in `~/.x-api-scraper/config.json`.
- Saved app configs may include API keys, and saved profiles may include cookies, `auth_token`, or `ct0` in plain JSON.
- On shared machines or CI, prefer `--config-dir` or `X_API_SCRAPER_CONFIG_DIR` to isolate credentials.

App setup:

```bash
x-api-scraper auth apps add --name prod --api-key "twitterx_..."
x-api-scraper auth apps use prod
```

Profile setup from cookie:

```bash
x-api-scraper auth profiles add --name founder --cookie "ct0=...; auth_token=..."
x-api-scraper auth profiles use founder
```

Profile setup from auth token:

```bash
x-api-scraper auth cookie --auth-token "your_auth_token" --save-as founder
```

Inspect config:

```bash
x-api-scraper config show
x-api-scraper config path
```

## Command selection

Prefer convenience commands such as:

```bash
x-api-scraper --app prod about elonmusk
x-api-scraper --app prod users elonmusk sama
x-api-scraper --app prod search users "openai" --count 20
x-api-scraper --app prod trending tweets --country "United States" --topic "Sports" --count 50
x-api-scraper --app prod --profile founder article publish-md ./article.md --title "Launch Notes"
x-api-scraper --app prod tweet lookup 1900000000000000000 --summary
```

Use the generic path form when the endpoint is known but not wrapped:

```bash
x-api-scraper /twitter/elonmusk/about
x-api-scraper -X POST -d '["elonmusk","sama"]' /twitter/users
```

## Safety and execution rules

- Put global options such as `--app`, `--profile`, `--api-key`, and `--dry-run` before the command.
- For write actions like `tweet create`, `tweet like`, `user follow`, `list create`, and `article publish-md`, prefer `--dry-run` first.
- Only send the real write request after the user clearly wants execution.
- The CLI masks secrets in config output and dry-run previews, but still avoid echoing raw credentials back to the user.
- `auth cookie` uses a request path that contains the `auth_token`, so be careful with logs and traces.
- Local media file upload is not implemented; tweet creation supports `--media-url`.

## Recommended test flow

Use an isolated config directory for local testing:

```bash
x-api-scraper --config-dir ./.x-api-scraper-local config show
```

Recommended order:

1. Verify the CLI starts with `x-api-scraper --help` or `node ./bin/x-api-scraper.js --help`.
2. Verify a read command such as `about` or `users`.
3. Verify a raw-path request if needed.
4. Verify write-command request construction with `--dry-run` before any real write action.
