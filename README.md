# x-api-scraper-cli

> `@twexapi-dev/x-api-scraper-cli` is a Node.js command-line client for TwexAPI Twitter/X endpoints. Use the `x-api-scraper` command to fetch Twitter/X data, manage API credentials, preview write actions, publish X Articles from Markdown, and automate common X workflows from the terminal.

## Install

```bash
npm install -g @twexapi-dev/x-api-scraper-cli
x-api-scraper --help
```

Requires Node.js 18 or newer. npm: [https://www.npmjs.com/package/@twexapi-dev/x-api-scraper-cli](https://www.npmjs.com/package/@twexapi-dev/x-api-scraper-cli)

## Quick facts

- npm package: `@twexapi-dev/x-api-scraper-cli`
- Command: `x-api-scraper`
- Category: Twitter/X API command-line client
- Runtime: Node.js 18 or newer
- Best for: developers, AI agents, growth teams, content operators, and automation workflows
- Main use cases: Twitter/X data retrieval, global trending tweet lookup, tweet/list/profile actions, DM workflows, and Markdown-to-X-Article publishing
- API provider: TwexAPI
- Default API base URL: `https://api.twexapi.io`
- Authentication: Bearer API key plus optional saved cookie or `auth_token` profile for write actions
- Interfaces: terminal CLI, raw API path calls, Claude/Codex/OpenClaw skill usage
- License: MIT
- Dashboard: [TwexAPI dashboard](https://twexapi.io/dashboard)

## What it does

- Calls TwexAPI Twitter/X endpoints from the terminal with a stable `x-api-scraper` command.
- Saves reusable app configs for API keys and base URLs.
- Saves reusable auth profiles for cookies, `auth_token`, and `ct0` values.
- Supports generic HTTP-style requests to any TwexAPI path.
- Provides convenience commands for users, search, followers/following, lists, tweets, articles, DMs, profile, timeline, global trending tweets, and follow/unfollow actions.
- Publishes Markdown files as X Articles through the documented draft, cover, title, content, and publish workflow.
- Prints dry-run previews for request payloads before sending them.
- Masks secrets in config output and dry-run previews.

## Who it is for

- Developers who want a terminal-first client for Twitter/X data and actions.
- AI agent builders who need deterministic commands, JSON output, and dry-run previews.
- Growth and research teams that monitor Twitter/X profiles, search terms, followers, lists, and global trending tweets.
- Content teams that draft articles in Markdown and publish them as X Articles.
- Operators who need saved profiles for repeatable Twitter/X workflows without rewriting API request code.

## AI agent use cases

x-api-scraper-cli is designed to be easy for AI coding agents and workflow agents to use safely:

- Preview a write action with `--dry-run` before publishing, following, liking, or updating anything.
- Fetch structured Twitter/X data as JSON for downstream summarization or enrichment.
- Call unsupported endpoints through the raw `x-api-scraper <path>` form.
- Use saved app and profile names instead of pasting credentials into every command.
- Publish a Markdown article with a single command while the CLI handles the multi-step X Article API flow.
- Install and invoke the repository as a Claude/Codex/OpenClaw-style skill.

## Common workflows

### Fetch Twitter/X user data

```bash
x-api-scraper --app prod about elonmusk
x-api-scraper --app prod users elonmusk sama
```

### Search Twitter/X content

```bash
x-api-scraper --app prod search tweets "founder" "ai" --sort Latest
x-api-scraper --app prod search users "openai"
```

### Get global trending tweets

```bash
x-api-scraper --app prod trending tweets --country "United States" --topic "Sports" --content "NFL" --count 50
```

### Publish Markdown as an X Article

```bash
x-api-scraper --app prod --profile founder --dry-run article publish-md ./article.md --title "Launch Notes"
x-api-scraper --app prod --profile founder article publish-md ./article.md --title "Launch Notes" --cover-image "https://example.com/cover.jpg" --visibility Public
```

### Run a raw TwexAPI request

```bash
x-api-scraper --app prod -X POST -d '["elonmusk","sama"]' /twitter/users
```

## Why it is different

- It combines convenience commands with raw path access, so users are not blocked when an endpoint is not wrapped yet.
- It supports both read workflows and authenticated write workflows.
- It treats AI-agent safety as a first-class workflow through `--dry-run`, secret masking, and saved profile names.
- It includes skill/plugin metadata so agents can discover how to install, configure, and run the CLI.
- It keeps the implementation small and dependency-free, with separate modules for parsing, config, request execution, and command routing.

## Use as a skill

Install from a GitHub skill installer:

```bash
npx skills add twexapi-dev/x-api-scraper-cli
```

Install from ClawHub:

```bash
npx clawhub@latest install x-api-scraper-cli
```

Install as a Claude Code marketplace:

```text
/plugin marketplace add twexapi-dev/x-api-scraper-cli
/plugin install x-api-scraper-cli@x-api-scraper-cli
```

For manual Claude Code installs, this repository also includes:

```text
.claude/skills/x-api-scraper-cli/
```

Then install the CLI:

```bash
npm install -g @twexapi-dev/x-api-scraper-cli
```

In skills-enabled environments:

- use `/x-api-scraper-cli` after installing the Claude plugin command
- use `$x-api-scraper-cli` in Codex/OpenClaw-style environments
- or ask the agent to use x-api-scraper for installation, auth setup, dry-run previews, or endpoint calls

## Quick start

Get your API key from the TwexAPI dashboard:

[TwexAPI dashboard](https://twexapi.io/dashboard)

Save an app config and make a first request:

```bash
x-api-scraper auth apps add --name prod --api-key "twitterx_..."
x-api-scraper auth apps use prod
x-api-scraper --app prod about elonmusk
```

If you are developing from this repository, use:

```bash
node ./bin/x-api-scraper.js --help
```

If you want a local executable command while developing from source:

```bash
npm link
x-api-scraper --help
```

## Config management

When a request is missing an API key, the CLI will include that URL in the error output.

## Security notes

- The CLI reads `X_API_SCRAPER_KEY`, `X_API_SCRAPER_BASE_URL`, and `X_API_SCRAPER_CONFIG_DIR` from the environment.
- The CLI reads and writes persistent config in `~/.x-api-scraper/config.json` by default, or in the directory set by `--config-dir` or `X_API_SCRAPER_CONFIG_DIR`.
- Saved app configs may contain API keys, and saved profiles may contain cookies, `auth_token`, or `ct0` in plain JSON on disk.
- Avoid storing long-lived credentials on shared machines or CI runners. Prefer an isolated config directory when testing.
- `auth cookie` builds a request path containing the `auth_token`, so treat logs, traces, and network boundaries accordingly.

Save an app config:

```bash
x-api-scraper auth apps add --name prod --api-key "twitterx_..."
x-api-scraper auth apps list
x-api-scraper auth apps use prod
```

Save a write profile:

```bash
x-api-scraper auth profiles add --name founder --cookie "ct0=...; auth_token=..."
x-api-scraper auth profiles use founder
```

Create a profile from `auth_token` via the documented cookie endpoint:

```bash
x-api-scraper auth cookie --auth-token "your_auth_token" --save-as founder
```

Inspect config:

```bash
x-api-scraper config show
x-api-scraper config path
```

By default config is stored in `~/.x-api-scraper/config.json`. For testing, you can isolate it:

```bash
x-api-scraper --config-dir ./.x-api-scraper-local config show
```

## Request examples

Query an endpoint directly:

```bash
x-api-scraper /twitter/elonmusk/about
```

Send a JSON body with a POST:

```bash
x-api-scraper -X POST -d '["elonmusk","sama"]' /twitter/users
```

Preview a request without sending it:

```bash
x-api-scraper --app prod --dry-run users elonmusk sama
x-api-scraper --app prod --profile founder --dry-run tweet create --text "hello"
x-api-scraper --app prod --profile founder --dry-run article publish-md ./article.md --title "Launch Notes"
```

## Convenience commands

Read commands:
 
```bash
# Twitter/X User and Search
x-api-scraper --app prod users elonmusk sama           # Lookup user profiles
x-api-scraper --app prod about elonmusk                # Fetch detailed user info
x-api-scraper --app prod search tweets "founder" "ai"  # Search tweets by page
x-api-scraper --app prod search users "openai"         # Search for users
x-api-scraper --app prod search hashtags ai openai     # Search tweets by hashtag
x-api-scraper --app prod search cashtags TSLA          # Search tweets by cashtag
x-api-scraper --app prod followers elonmusk            # List user followers (v3)
x-api-scraper --app prod followers verified elonmusk   # List verified followers (v3)
x-api-scraper --app prod following elonmusk            # List user following (v3)

# Twitter/X Communities
x-api-scraper --app prod community search --query "ai"
x-api-scraper --app prod community get 123
x-api-scraper --app prod community tweets 123 --type Latest
 
# Twitter/X Lists
x-api-scraper --app prod list search --query "ai"      # Search for public lists
x-api-scraper --app prod list members 123456789        # List members of a list
x-api-scraper --app prod list subscribers 123456789    # List subscribers of a list
 
# Twitter/X Articles & DMs
x-api-scraper --app prod article markdown 123          # Get x article as Markdown
x-api-scraper --app prod article lookup 123 456        # Batch lookup x articles
x-api-scraper --app prod dm conversations              # List XChat conversations
x-api-scraper --app prod dm history elonmusk           # Show XChat / DM history
x-api-scraper --app prod dm send elonmusk --text "hi"  # Send an XChat / DM
 
# Twitter/X Profile & Timeline
x-api-scraper --app prod timeline user elonmusk        # Fetch user timeline page
x-api-scraper --app prod profile update --name "Name"  # Update your own profile

# Twitter/X Global Trending
x-api-scraper --app prod trending tweets --country "United States"
x-api-scraper --app prod trending tweets --country "United States" --topic "Sports" --content "NFL" --count 50

# Twitter/X Tweets
x-api-scraper --app prod tweet lookup 123 --summary    # Batch tweet lookup (id:bool)
x-api-scraper --app prod tweet thread 123              # Get a tweet thread
x-api-scraper --app prod tweet replies 123             # Get replies by page
```

Write commands:

```bash
x-api-scraper --app prod --profile founder tweet create --text "hello from cli"
x-api-scraper --app prod --profile founder tweet create --text "hello with image" --media-url "https://example.com/a.jpg"
x-api-scraper --app prod --profile founder tweet quote --text "worth reading" --quote-url "https://x.com/user/status/123"
x-api-scraper --app prod --profile founder tweet like 1900000000000000000
x-api-scraper --app prod --profile founder tweet unlike 1900000000000000000
x-api-scraper --app prod --profile founder tweet bookmark 1900000000000000000
x-api-scraper --app prod --profile founder tweet unbookmark 1900000000000000000
x-api-scraper --app prod --profile founder tweet retweet 1900000000000000000
x-api-scraper --app prod --profile founder tweet unretweet 1900000000000000000
x-api-scraper --app prod --profile founder article publish-md ./article.md --title "Launch Notes"
x-api-scraper --app prod --profile founder article publish-md ./article.md --title "Launch Notes" --cover-image "https://example.com/cover.jpg" --visibility Public
x-api-scraper --app prod --profile founder list create --name "AI Builders" --description "Interesting builders" --private
x-api-scraper --app prod --profile founder user follow someuser
x-api-scraper --app prod --profile founder user unfollow someuser
```

## FAQ

### What is x-api-scraper-cli?

`@twexapi-dev/x-api-scraper-cli` is a Node.js command-line client for TwexAPI Twitter/X endpoints. The `x-api-scraper` command lets users call Twitter/X API workflows from the terminal, including user lookup, tweet search, global trending tweets, tweet actions, list actions, DM workflows, profile updates, and X Article publishing.

### Does x-api-scraper-cli require an API key?

Yes. Read requests require a TwexAPI API key passed with `--api-key`, `X_API_SCRAPER_KEY`, or a saved app config created with `x-api-scraper auth apps add`.

### Can x-api-scraper-cli perform write actions on X?

Yes. Write actions such as tweeting, liking, following, updating a profile, sending DMs, creating lists, and publishing X Articles require a saved profile or explicit cookie/auth token. Use `--dry-run` first to preview the request.

### Can x-api-scraper-cli publish X Articles from Markdown?

Yes. Use `x-api-scraper article publish-md <file.md> --title <title>`. The CLI creates a draft, optionally sets a cover image, sets the article title, uploads Markdown content, and publishes the article.

### Is x-api-scraper-cli suitable for AI agents?

Yes. It exposes deterministic commands, JSON responses, dry-run previews, saved credential profiles, and skill/plugin metadata for Claude, Codex, and OpenClaw-style environments.

### Can x-api-scraper-cli call endpoints that do not have convenience commands?

Yes. Use the raw path form, for example `x-api-scraper /twitter/elonmusk/about` or `x-api-scraper -X POST -d '["elonmusk"]' /twitter/users`.

## Limitations

- A TwexAPI API key is required for real API requests.
- Write actions require a cookie, `auth_token`, or saved profile.
- Saved app configs and profiles are stored as plain JSON on disk.
- Direct local file upload for tweet media is not included; tweet creation currently supports `--media-url`.
- The CLI is a terminal client, not a web dashboard or hosted API service.

## Project layout

```text
bin/x-api-scraper.js         # thin executable entrypoint
src/index.js           # main boot flow
src/parser.js          # global option parsing
src/config.js          # config load/save and auth profile helpers
src/request.js         # HTTP execution and dry-run preview
src/commands.js        # command routing and endpoint mapping
src/help.js            # help text
src/constants.js       # defaults and option metadata
src/utils.js           # shared helpers
```

## Notes

- Global options such as `--app`, `--profile`, `--api-key`, and `--dry-run` should be placed before the command.
- For unsupported endpoints, use the generic `x-api-scraper <path>` form.
- The CLI masks secrets in config output and dry-run previews.
- Direct local file upload for media is not included yet; the current CLI supports `--media-url` for tweet creation.
