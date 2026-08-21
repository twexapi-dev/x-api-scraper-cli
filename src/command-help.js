const BIN = "x-api-scraper";

function leaf(summary, usage, extra = {}) {
  return { summary, usage, ...extra };
}

export const COMMAND_TREE = {
  about: leaf("Fetch detailed user profile info", "about <screen_name>"),
  users: leaf("Look up multiple users by username", "users <username...>"),
  search: {
    summary: "Search tweets, users, hashtags, or cashtags",
    commands: {
      tweets: leaf(
        "Search tweets by page",
        "search tweets <term...> [--sort Latest|Top] [--cursor <token>]",
        {
          options: [
            ["--sort Latest|Top", "Sort order, default Latest"],
            ["--cursor <token>", "Next page cursor"],
          ],
        },
      ),
      users: leaf(
        "Search Twitter/X users",
        "search users <keyword> [--count <n>]",
        { options: [["--count <n>", "Number of users to return, default 20"]] },
      ),
      hashtags: leaf(
        "Search tweets by hashtag",
        "search hashtags <tag...> [--count <n>] [--sort Latest|Top]",
        {
          options: [
            ["--count <n>", "Maximum tweets to return, default 20"],
            ["--sort Latest|Top", "Sort order, default Latest"],
          ],
        },
      ),
      cashtags: leaf(
        "Search tweets by cashtag",
        "search cashtags <tag...> [--count <n>] [--sort Latest|Top]",
        {
          options: [
            ["--count <n>", "Maximum tweets to return, default 20"],
            ["--sort Latest|Top", "Sort order, default Latest"],
          ],
        },
      ),
    },
  },
  followers: {
    summary: "List followers (v3)",
    usage: "followers <username> [--count <n>] [--cursor <token>]",
    options: [
      ["--count <n>", "Users per page, 10-100, default 20"],
      ["--cursor <token>", "Next page cursor"],
    ],
    commands: {
      verified: leaf(
        "List verified followers (v3)",
        "followers verified <username> [--count <n>] [--cursor <token>]",
        {
          options: [
            ["--count <n>", "Users per page, 10-100, default 20"],
            ["--cursor <token>", "Next page cursor"],
          ],
        },
      ),
    },
  },
  following: leaf(
    "List accounts a user follows (v3)",
    "following <username> [--count <n>] [--cursor <token>]",
    {
      options: [
        ["--count <n>", "Users per page, 10-100, default 20"],
        ["--cursor <token>", "Next page cursor"],
      ],
    },
  ),
  community: {
    summary: "Look up X communities",
    commands: {
      search: leaf("Search communities", "community search --query <text> [--count <n>]"),
      get: leaf("Get community details", "community get <community_id>"),
      members: leaf("List community members", "community members <community_id> [--count <n>]"),
      tweets: leaf(
        "List community tweets",
        "community tweets <community_id> [--type Top|Latest|Media] [--count <n>]",
      ),
      "search-tweets": leaf(
        "Search tweets in a community",
        "community search-tweets <community_id> --query <text> [--count <n>]",
      ),
    },
  },
  list: {
    summary: "Search and inspect X lists",
    commands: {
      search: leaf("Search public lists", "list search --query <text> [--count <n>]"),
      create: leaf(
        "Create a list",
        "list create --name <name> --description <text> [--private]",
      ),
      members: leaf("List members in a list", "list members <list_id> [--count <n>]"),
      subscribers: leaf("List list subscribers", "list subscribers <list_id> [--count <n>]"),
    },
  },
  article: {
    summary: "Fetch or publish X Articles",
    commands: {
      markdown: leaf("Fetch an article as Markdown", "article markdown <tweet_id>"),
      lookup: leaf("Batch lookup articles", "article lookup <tweet_id...>"),
      "publish-md": leaf(
        "Publish a Markdown file as an X Article",
        "article publish-md <file.md> --title <title> [--cover-image <url>] [--visibility Public|Followers|Mentioned]",
      ),
    },
  },
  dm: {
    summary: "Send and read XChat / DMs (v3)",
    commands: {
      status: leaf("Check XChat / DM status", "dm status <id_or_username...>"),
      conversations: leaf("List XChat conversations", "dm conversations [--count <n>] [--all]"),
      history: leaf(
        "Fetch XChat / DM history",
        "dm history <recipient> [--count <n>] [--before <id>] [--all]",
      ),
      send: leaf(
        "Send an XChat / DM",
        "dm send <recipient> --text <content> [--media-url <url>] [--video-url <url>]",
      ),
      media: leaf(
        "Fetch DM media",
        "dm media --conversation-id <id> --media-hash-key <key>",
      ),
    },
  },
  profile: {
    summary: "Update the authenticated profile",
    commands: {
      update: leaf(
        "Update profile fields",
        "profile update [--name <n>] [--description <t>] [--location <t>] [--website <url>] [--image-url <url>] [--banner-url <url>]",
      ),
    },
  },
  timeline: {
    summary: "Fetch user timelines",
    commands: {
      user: leaf(
        "Fetch a user timeline page",
        "timeline user <screen_name> [--cursor <token>] [--count <n>]",
      ),
    },
  },
  trending: {
    summary: "Fetch global trending tweets",
    commands: {
      tweets: leaf(
        "Fetch global trending tweets",
        "trending tweets --country <country> [--topic <topic>] [--content <content>] [--count <n>]",
      ),
    },
  },
  tweet: {
    summary: "Look up tweets or perform tweet actions",
    commands: {
      create: leaf(
        "Create a tweet or reply",
        "tweet create --text <content> [--media-url <url>] [--reply-to <tweet_id>] [--community <name>] [--schedule <value>]",
        {
          options: [
            ["--text <content>", "Tweet text"],
            ["--media-url <url>", "Public image URL"],
            ["--reply-to <tweet_id>", "Reply to a tweet"],
            ["--cookie <value>", "Override saved cookie or auth token"],
            ["--proxy <url>", "Optional HTTP proxy"],
          ],
        },
      ),
      quote: leaf(
        "Quote a tweet",
        "tweet quote --text <content> --quote-url <url> [--media-url <url>]",
      ),
      lookup: leaf("Batch tweet lookup", "tweet lookup <tweet_id...> [--summary]"),
      thread: leaf("Fetch a tweet thread", "tweet thread <tweet_id> [--count <n>]"),
      replies: leaf(
        "Fetch tweet replies by page",
        "tweet replies <tweet_id> [--sort Relevance|Recency|Likes] [--cursor <token>]",
      ),
      like: leaf("Like a tweet", "tweet like <tweet_id>"),
      unlike: leaf("Unlike a tweet", "tweet unlike <tweet_id>"),
      bookmark: leaf("Bookmark a tweet", "tweet bookmark <tweet_id>"),
      unbookmark: leaf("Remove a bookmark", "tweet unbookmark <tweet_id>"),
      retweet: leaf("Retweet a tweet", "tweet retweet <tweet_id>"),
      unretweet: leaf("Undo a retweet", "tweet unretweet <tweet_id>"),
    },
  },
  user: {
    summary: "Follow or unfollow a user",
    commands: {
      follow: leaf("Follow a user", "user follow <username>"),
      unfollow: leaf("Unfollow a user", "user unfollow <username>"),
    },
  },
  auth: {
    summary: "Manage API apps and auth profiles",
    commands: {
      apps: {
        summary: "Manage saved API app configs",
        commands: {
          add: leaf("Add an app config", "auth apps add --name <name> --api-key <key> [--base-url <url>] [--use]"),
          list: leaf("List saved apps", "auth apps list"),
          use: leaf("Select the current app", "auth apps use <name>"),
          remove: leaf("Remove a saved app", "auth apps remove <name>"),
        },
      },
      profiles: {
        summary: "Manage saved cookie / auth_token profiles",
        commands: {
          add: leaf(
            "Add an auth profile",
            "auth profiles add --name <name> [--cookie <value> | --auth-token <value>] [--ct0 <value>] [--use]",
          ),
          list: leaf("List saved profiles", "auth profiles list"),
          use: leaf("Select the current profile", "auth profiles use <name>"),
          remove: leaf("Remove a saved profile", "auth profiles remove <name>"),
        },
      },
      cookie: leaf(
        "Create a profile from an auth_token",
        "auth cookie --auth-token <token> [--save-as <profile>] [--ct0 <value>] [--use]",
      ),
    },
  },
  config: {
    summary: "Show local CLI config",
    commands: {
      show: leaf("Show the current config", "config show"),
      path: leaf("Print the config file path", "config path"),
    },
  },
};

export function isHelpFlag(value) {
  return value === "--help" || value === "-h";
}

export function isHelpRequest(state) {
  return Boolean(state.help) || state.commandArgs.some((arg) => isHelpFlag(arg));
}

function walkTree(parts) {
  let node = { commands: COMMAND_TREE };
  const path = [];

  for (const part of parts) {
    const next = node.commands?.[part];
    if (!next) {
      break;
    }
    node = next;
    path.push(part);
  }

  return { node, path };
}

function printLeaf(name, node) {
  const lines = [
    `${BIN} ${name}`,
    "",
    node.summary,
    "",
    "Usage:",
    `  ${BIN} ${node.usage}`,
  ];

  if (node.options?.length) {
    lines.push("", "Options:");
    for (const [flag, description] of node.options) {
      lines.push(`  ${flag.padEnd(28)} ${description}`);
    }
  }

  if (node.commands) {
    lines.push("", "Subcommands:");
    for (const [commandName, child] of Object.entries(node.commands)) {
      lines.push(`  ${commandName.padEnd(16)} ${child.summary}`);
    }
  }

  lines.push("", `Run \`${BIN} --help\` for global options.`);
  console.log(lines.join("\n"));
}

function printGroup(name, node) {
  const lines = [
    `${BIN} ${name}`,
    "",
    node.summary,
    "",
    "Usage:",
  ];

  if (node.usage) {
    lines.push(`  ${BIN} ${node.usage}`);
  }

  for (const [commandName, child] of Object.entries(node.commands || {})) {
    const usage = child.usage || `${name} ${commandName}`;
    lines.push(`  ${BIN} ${usage}`);
  }

  lines.push("", "Subcommands:");
  for (const [commandName, child] of Object.entries(node.commands || {})) {
    lines.push(`  ${commandName.padEnd(16)} ${child.summary}`);
  }
  lines.push("", `Run \`${BIN} ${name} <subcommand> --help\` for details.`);
  console.log(lines.join("\n"));
}

export function printCommandHelp(commandArgs) {
  const parts = commandArgs.filter((arg) => !isHelpFlag(arg));
  if (parts.length === 0) {
    return false;
  }

  if (parts[0].startsWith("/") || /^https?:\/\//i.test(parts[0])) {
    console.log(`${BIN} <path>

Send a raw request to a TwexAPI path.

Usage:
  ${BIN} [global options] <path>
  ${BIN} -X POST -d '<json>' <path>

Examples:
  ${BIN} --app prod /twitter/elonmusk/about
  ${BIN} --app prod -X POST -d '["elonmusk"]' /twitter/users

Run \`${BIN} --help\` for global options.`);
    return true;
  }

  const { node, path } = walkTree(parts);
  if (path.length === 0) {
    return false;
  }

  const name = path.join(" ");
  if (node.commands) {
    printGroup(name, node);
    return true;
  }

  printLeaf(name, node);
  return true;
}
