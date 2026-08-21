import fs from "node:fs/promises";

import {
  collectPositionals,
  exitWithError,
  findAllOptions,
  findOption,
  hasFlag,
  normalizePath,
  printJson,
  readCountOption,
  requireCommandValue,
  sanitizeForOutput,
} from "./utils.js";
import {
  handleAuthAppsCommand,
  handleAuthProfilesCommand,
  handleConfigCommand,
  resolveCookieArg,
  resolveAppState,
  saveConfig,
} from "./config.js";
import { performRequest } from "./request.js";

const ARTICLE_PUBLISH_MD_USAGE = "Usage: x-api-scraper article publish-md <file.md> --title <title> [--cover-image <url_or_path>] [--visibility Public|Followers|Mentioned]";
const ARTICLE_ID_PLACEHOLDER = "{article_id_from_step_1}";
const ARTICLE_VISIBILITIES = new Set(["Public", "Followers", "Mentioned"]);
const COMMUNITY_TWEET_TYPES = new Set(["Top", "Latest", "Media"]);
const REPLY_SORTS = new Set(["Relevance", "Recency", "Likes"]);
const TAG_SEARCH_OPTIONS = ["--count", "--sort"];
const TWEET_SEARCH_OPTIONS = ["--sort", "--cursor"];

function tweetActionBody(args, state, config) {
  const proxy = findOption(args, "--proxy");
  return {
    cookie: resolveCookieArg(args, state, config),
    ...(proxy ? { proxy } : {}),
  };
}

function buildTweetBody(args, state, config) {
  const text = requireCommandValue(findOption(args, "--text"), "Usage: x-api-scraper tweet create --text <content> [--media-url <url>] [--reply-to <tweet_id>]");
  const mediaUrls = findAllOptions(args, "--media-url");
  const proxy = findOption(args, "--proxy");
  const delegatedAccount = findOption(args, "--delegated-account");
  const communityName = findOption(args, "--community");
  const schedule = findOption(args, "--schedule");
  const replyTweetId = findOption(args, "--reply-to");

  return {
    tweet_content: text,
    cookie: resolveCookieArg(args, state, config),
    ...(mediaUrls[0] ? { media_url: mediaUrls[0] } : {}),
    ...(delegatedAccount ? { delegated_account_username: delegatedAccount } : {}),
    ...(communityName ? { community_name: communityName } : {}),
    ...(schedule ? { schedule } : {}),
    ...(replyTweetId ? { reply_tweet_id: replyTweetId } : {}),
    ...(proxy ? { proxy } : {}),
  };
}

async function handleAuthCookieCommand(state, config, args) {
  const authToken = requireCommandValue(findOption(args, "--auth-token"), "Usage: x-api-scraper auth cookie --auth-token <token> [--save-as <profile>] [--ct0 <value>]");
  const saveAs = findOption(args, "--save-as");
  const response = await performRequest(state, config, {
    method: "GET",
    path: `/twitter/${encodeURIComponent(authToken)}/cookie`,
    silent: Boolean(saveAs),
  });

  if (state.dryRun || !saveAs) {
    return;
  }

  const cookie = typeof response.data?.data === "string" ? response.data.data : "";
  if (!cookie) {
    exitWithError("Cookie response did not contain a usable cookie string.");
  }

  const ct0 = findOption(args, "--ct0");
  config.profiles[saveAs] = {
    cookie,
    authToken,
    ...(ct0 ? { ct0 } : {}),
  };
  if (!config.currentProfile || hasFlag(args, "--use")) {
    config.currentProfile = saveAs;
  }
  await saveConfig(state.configDir, config);

  console.log(JSON.stringify({
    saved: saveAs,
    currentProfile: config.currentProfile,
    profile: {
      cookie: cookie ? `${cookie.slice(0, 4)}...${cookie.slice(-4)}` : "",
      authToken: authToken ? `${authToken.slice(0, 4)}...${authToken.slice(-4)}` : "",
      ct0: ct0 ? `${ct0.slice(0, 4)}...${ct0.slice(-4)}` : "",
    },
  }, null, 2));
}

async function handleAuthCommand(state, config, args) {
  const area = args[1];
  if (area === "apps") {
    await handleAuthAppsCommand(state, config, args);
    return;
  }
  if (area === "profiles") {
    await handleAuthProfilesCommand(state, config, args);
    return;
  }
  if (area === "cookie") {
    await handleAuthCookieCommand(state, config, args);
    return;
  }

  exitWithError("Unknown auth command.", "Use: auth apps | auth profiles | auth cookie");
}

async function handleUsersCommand(state, config, args) {
  const usernames = collectPositionals(args, 1);
  if (usernames.length === 0) {
    exitWithError("Usage: x-api-scraper users <username...>");
  }

  await performRequest(state, config, {
    method: "POST",
    path: "/twitter/users",
    body: usernames,
  });
}

async function handleAboutCommand(state, config, args) {
  const screenName = requireCommandValue(args[1], "Usage: x-api-scraper about <screen_name>");
  await performRequest(state, config, {
    method: "GET",
    path: `/twitter/${encodeURIComponent(screenName)}/about`,
  });
}

async function handleSearchCommand(state, config, args) {
  const scope = args[1];

  if (scope === "tweets") {
    const terms = collectPositionals(args, 2, TWEET_SEARCH_OPTIONS);
    if (terms.length === 0) {
      exitWithError("Usage: x-api-scraper search tweets <term...> [--sort Latest|Top] [--cursor <token>]");
    }
    const cursor = findOption(args, "--cursor");

    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/advanced_search/page",
      body: {
        searchTerms: terms,
        sortBy: findOption(args, "--sort") || "Latest",
        ...(cursor ? { next_cursor: cursor } : {}),
      },
    });
    return;
  }

  if (scope === "users") {
    const keyword = requireCommandValue(args[2], "Usage: x-api-scraper search users <keyword> [--count <n>]");
    await performRequest(state, config, {
      method: "GET",
      path: `/twitter/search-user/${encodeURIComponent(keyword)}/${readCountOption(args, 20)}`,
    });
    return;
  }

  if (scope === "hashtags" || scope === "cashtags") {
    const field = scope === "hashtags" ? "hashtags" : "cashtags";
    const terms = collectPositionals(args, 2, TAG_SEARCH_OPTIONS);
    if (terms.length === 0) {
      exitWithError(`Usage: x-api-scraper search ${scope} <term...> [--count <n>] [--sort Latest|Top]`);
    }

    await performRequest(state, config, {
      method: "POST",
      path: `/twitter/${scope}`,
      body: {
        [field]: terms,
        maxItems: readCountOption(args, 20),
        sortBy: findOption(args, "--sort") || "Latest",
      },
    });
    return;
  }

  exitWithError("Unknown search command.", "Use: search tweets | search users | search hashtags | search cashtags");
}

async function handleArticleCommand(state, config, args) {
  const action = args[1];
  if (action === "markdown") {
    const tweetId = requireCommandValue(args[2], "Usage: x-api-scraper article markdown <tweet_id>");
    await performRequest(state, config, {
      method: "GET",
      path: `/x/article/${encodeURIComponent(tweetId)}/markdown`,
    });
    return;
  }

  if (action === "lookup") {
    const tweetIds = collectPositionals(args, 2);
    if (tweetIds.length === 0) {
      exitWithError("Usage: x-api-scraper article lookup <tweet_id...>");
    }
    await performRequest(state, config, {
      method: "POST",
      path: "/x/article",
      body: tweetIds,
    });
    return;
  }

  if (action === "publish-md") {
    await handleArticlePublishMdCommand(state, config, args);
    return;
  }

  exitWithError("Unknown article command.", "Use: article markdown | article lookup | article publish-md");
}

function articlePublishMdRequests(articleId, data) {
  const { cookie, coverImage, markdown, title, visibility } = data;
  const articlePath = `/x/articles/${articleId}`;
  const requests = [
    {
      name: "create_draft",
      method: "POST",
      path: "/x/articles/draft",
      body: { cookie },
    },
  ];

  if (coverImage) {
    requests.push({
      name: "set_cover",
      method: "PUT",
      path: `${articlePath}/cover`,
      body: {
        cookie,
        cover_image: coverImage,
      },
    });
  }

  requests.push(
    {
      name: "set_title",
      method: "PUT",
      path: `${articlePath}/title`,
      body: {
        cookie,
        title,
      },
    },
    {
      name: "set_content",
      method: "PUT",
      path: `${articlePath}/content`,
      body: {
        cookie,
        markdown,
      },
    },
    {
      name: "publish",
      method: "POST",
      path: `${articlePath}/publish`,
      body: {
        cookie,
        visibility,
      },
    },
  );

  return requests;
}

function buildDryRunPreview(state, config, request) {
  const appState = resolveAppState(state, config);
  const target = normalizePath(request.path);
  const url = /^https?:\/\//i.test(target) ? target : `${appState.baseUrl}${target}`;
  const headers = {
    Accept: "application/json",
    ...state.headers,
    ...request.headers,
  };

  if (appState.apiKey) {
    headers.Authorization = `Bearer ${appState.apiKey}`;
  }

  return sanitizeForOutput({
    name: request.name,
    method: request.method,
    url,
    headers,
    ...(request.body !== undefined ? { body: request.body } : {}),
  });
}

function articleIdFromDraftResponse(response) {
  const articleId = response.data?.data?.article_id;
  if (!articleId) {
    exitWithError("Draft response did not contain article_id.");
  }
  return articleId;
}

async function readMarkdownFile(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    exitWithError("Failed to read markdown file.", error.message);
  }
}

async function handleArticlePublishMdCommand(state, config, args) {
  const filePath = requireCommandValue(args[2], ARTICLE_PUBLISH_MD_USAGE);
  const title = requireCommandValue(findOption(args, "--title"), ARTICLE_PUBLISH_MD_USAGE);
  const coverImage = findOption(args, "--cover-image");
  const visibility = findOption(args, "--visibility") || "Public";

  if (!ARTICLE_VISIBILITIES.has(visibility)) {
    exitWithError(`Invalid --visibility value: ${visibility}`, "Use: Public | Followers | Mentioned");
  }

  const markdown = await readMarkdownFile(filePath);
  const cookie = resolveCookieArg(args, state, config);
  const data = {
    cookie,
    coverImage,
    markdown,
    title,
    visibility,
  };

  if (state.dryRun) {
    printJson({
      articleId: ARTICLE_ID_PLACEHOLDER,
      steps: articlePublishMdRequests(ARTICLE_ID_PLACEHOLDER, data).map((request) => buildDryRunPreview(state, config, request)),
    });
    return;
  }

  const draftRequest = articlePublishMdRequests("", data)[0];
  const draftResponse = await performRequest(state, config, {
    ...draftRequest,
    silent: true,
  });
  const articleId = articleIdFromDraftResponse(draftResponse);
  const remainingRequests = articlePublishMdRequests(encodeURIComponent(articleId), data).slice(1);

  for (const [index, request] of remainingRequests.entries()) {
    await performRequest(state, config, {
      ...request,
      silent: index < remainingRequests.length - 1,
    });
  }
}

async function handleDmCommand(state, config, args) {
  const action = args[1];
  const proxy = findOption(args, "--proxy");
  const pin = findOption(args, "--pin");
  const cookie = () => resolveCookieArg(args, state, config);

  if (action === "status") {
    const targets = collectPositionals(args, 2);
    if (targets.length === 0) {
      exitWithError("Usage: x-api-scraper dm status <id_or_username...>");
    }
    await performRequest(state, config, {
      method: "POST",
      path: "/v2/dm/status",
      body: targets,
    });
    return;
  }

  if (action === "history") {
    const recipient = requireCommandValue(args[2], "Usage: x-api-scraper dm history <recipient> [--count <n>] [--before <id>] [--all]");
    const before = findOption(args, "--before") || findOption(args, "--max-id");
    await performRequest(state, config, {
      method: "POST",
      path: "/v3/twitter/dm-history",
      body: {
        recipient,
        cookie: cookie(),
        count: readCountOption(args, 50),
        ...(hasFlag(args, "--all") ? { all: true } : {}),
        ...(before ? { before } : {}),
        ...(pin ? { pin } : {}),
        ...(proxy ? { proxy } : {}),
      },
    });
    return;
  }

  if (action === "send") {
    const recipient = requireCommandValue(args[2], "Usage: x-api-scraper dm send <recipient> --text <content> [--media-url <url>] [--video-url <url>]");
    const text = requireCommandValue(findOption(args, "--text"), "Usage: x-api-scraper dm send <recipient> --text <content> [--media-url <url>] [--video-url <url>]");
    const mediaUrl = findOption(args, "--media-url");
    const videoUrl = findOption(args, "--video-url");

    await performRequest(state, config, {
      method: "POST",
      path: "/v3/twitter/send-dm",
      body: {
        recipient,
        text,
        cookie: cookie(),
        ...(mediaUrl ? { media_urls: [mediaUrl] } : {}),
        ...(videoUrl ? { video_url: videoUrl } : {}),
        ...(pin ? { pin } : {}),
        ...(proxy ? { proxy } : {}),
      },
    });
    return;
  }

  if (action === "media") {
    const conversationId = requireCommandValue(findOption(args, "--conversation-id"), "Usage: x-api-scraper dm media --conversation-id <id> --media-hash-key <key>");
    const mediaHashKey = requireCommandValue(findOption(args, "--media-hash-key"), "Usage: x-api-scraper dm media --conversation-id <id> --media-hash-key <key>");
    await performRequest(state, config, {
      method: "POST",
      path: "/v3/twitter/dm-media",
      body: {
        conversation_id: conversationId,
        media_hash_key: mediaHashKey,
        cookie: cookie(),
        ...(findOption(args, "--key-version") ? { key_version: findOption(args, "--key-version") } : {}),
        ...(findOption(args, "--type") ? { type_name: findOption(args, "--type") } : {}),
        ...(findOption(args, "--filename") ? { filename: findOption(args, "--filename") } : {}),
        ...(pin ? { pin } : {}),
        ...(proxy ? { proxy } : {}),
      },
    });
    return;
  }

  if (action === "conversations") {
    await performRequest(state, config, {
      method: "POST",
      path: "/v3/twitter/conversations",
      body: {
        cookie: cookie(),
        count: readCountOption(args, 20),
        ...(hasFlag(args, "--all") ? { all: true } : {}),
        ...(proxy ? { proxy } : {}),
      },
    });
    return;
  }

  exitWithError("Unknown dm command.", "Use: dm status | dm history | dm send | dm media | dm conversations");
}

function followersV3Body(args, username) {
  const cursor = findOption(args, "--cursor");
  return {
    username,
    count: readCountOption(args, 20),
    ...(cursor ? { cursor } : {}),
  };
}

async function handleFollowersCommand(state, config, args) {
  if (args[1] === "verified") {
    const username = requireCommandValue(args[2], "Usage: x-api-scraper followers verified <username> [--count <n>] [--cursor <token>]");
    await performRequest(state, config, {
      method: "POST",
      path: "/v3/twitter/users/verified-followers",
      body: followersV3Body(args, username),
    });
    return;
  }

  const username = requireCommandValue(args[1], "Usage: x-api-scraper followers <username> [--count <n>] [--cursor <token>]");
  await performRequest(state, config, {
    method: "POST",
    path: "/v3/twitter/users/followers",
    body: followersV3Body(args, username),
  });
}

async function handleFollowingCommand(state, config, args) {
  const username = requireCommandValue(args[1], "Usage: x-api-scraper following <username> [--count <n>] [--cursor <token>]");
  await performRequest(state, config, {
    method: "POST",
    path: "/v3/twitter/users/following",
    body: followersV3Body(args, username),
  });
}

async function handleCommunityCommand(state, config, args) {
  const action = args[1];

  if (action === "search") {
    const query = requireCommandValue(findOption(args, "--query"), "Usage: x-api-scraper community search --query <text> [--count <n>]");
    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/community/search",
      body: {
        query,
        target_count: readCountOption(args, 20),
      },
    });
    return;
  }

  if (action === "get") {
    const communityId = requireCommandValue(args[2], "Usage: x-api-scraper community get <community_id>");
    await performRequest(state, config, {
      method: "GET",
      path: `/twitter/community/${encodeURIComponent(communityId)}`,
    });
    return;
  }

  if (action === "members") {
    const communityId = requireCommandValue(args[2], "Usage: x-api-scraper community members <community_id> [--count <n>]");
    await performRequest(state, config, {
      method: "GET",
      path: `/twitter/community/${encodeURIComponent(communityId)}/members/${readCountOption(args, 100)}`,
    });
    return;
  }

  if (action === "tweets") {
    const communityId = requireCommandValue(args[2], "Usage: x-api-scraper community tweets <community_id> [--type Top|Latest|Media] [--count <n>]");
    const tweetType = findOption(args, "--type") || "Latest";
    if (!COMMUNITY_TWEET_TYPES.has(tweetType)) {
      exitWithError(`Invalid --type value: ${tweetType}`, "Use: Top | Latest | Media");
    }
    await performRequest(state, config, {
      method: "GET",
      path: `/twitter/community/${encodeURIComponent(communityId)}/tweets/${encodeURIComponent(tweetType)}/${readCountOption(args, 20)}`,
    });
    return;
  }

  if (action === "search-tweets") {
    const communityId = requireCommandValue(args[2], "Usage: x-api-scraper community search-tweets <community_id> --query <text> [--count <n>]");
    const query = requireCommandValue(findOption(args, "--query"), "Usage: x-api-scraper community search-tweets <community_id> --query <text> [--count <n>]");
    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/community/search-tweets",
      body: {
        community_id: communityId,
        query,
        target_count: readCountOption(args, 20),
      },
    });
    return;
  }

  exitWithError("Unknown community command.", "Use: community search | community get | community members | community tweets | community search-tweets");
}

async function handleTimelineCommand(state, config, args) {
  const action = args[1];
  if (action === "user") {
    const screenName = requireCommandValue(args[2], "Usage: x-api-scraper timeline user <screen_name> [--cursor <token>] [--count <n>]");
    const cursor = findOption(args, "--cursor");
    const count = readCountOption(args, 20);

    await performRequest(state, config, {
      method: "POST",
      path: `/twitter/${encodeURIComponent(screenName)}/timeline/page`,
      body: {
        ...(cursor ? { next_cursor: cursor } : {}),
        count,
      },
    });
    return;
  }

  exitWithError("Unknown timeline command.", "Use: timeline user");
}

async function handleTrendingCommand(state, config, args) {
  const action = args[1];

  if (action === "tweets") {
    const country = requireCommandValue(findOption(args, "--country"), "Usage: x-api-scraper trending tweets --country <country> [--topic <topic>] [--content <content>] [--count <n>]");
    const topic = findOption(args, "--topic");
    const content = findOption(args, "--content");
    const count = readCountOption(args, 20);
    const params = new URLSearchParams({ country });

    if (topic) {
      params.set("topic", topic);
    }
    if (content) {
      params.set("content", content);
    }
    params.set("count", String(count));

    await performRequest(state, config, {
      method: "GET",
      path: `/twitter/global-trending/tweets?${params.toString()}`,
    });
    return;
  }

  exitWithError("Unknown trending command.", "Use: trending tweets");
}

async function handleProfileCommand(state, config, args) {
  const action = args[1];
  if (action === "update") {
    const name = findOption(args, "--name");
    const description = findOption(args, "--description");
    const location = findOption(args, "--location");
    const website = findOption(args, "--website");
    const profileImage = findOption(args, "--image-url");
    const profileBanner = findOption(args, "--banner-url");
    const proxy = findOption(args, "--proxy");

    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/profile",
      body: {
        cookie: resolveCookieArg(args, state, config),
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        ...(location ? { location } : {}),
        ...(website ? { website } : {}),
        ...(profileImage ? { profile_image: profileImage } : {}),
        ...(profileBanner ? { profile_banner: profileBanner } : {}),
        ...(proxy ? { proxy } : {}),
      },
    });
    return;
  }

  exitWithError("Unknown profile command.", "Use: profile update");
}

async function handleListCommand(state, config, args) {
  const action = args[1];

  if (action === "search") {
    const query = requireCommandValue(findOption(args, "--query"), "Usage: x-api-scraper list search --query <text> [--count <n>]");
    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/list/search",
      body: {
        query,
        target_count: readCountOption(args, 20),
      },
    });
    return;
  }

  if (action === "create") {
    const listName = requireCommandValue(findOption(args, "--name"), "Usage: x-api-scraper list create --name <name> --description <text> [--private]");
    const listDescription = requireCommandValue(findOption(args, "--description"), "Usage: x-api-scraper list create --name <name> --description <text> [--private]");
    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/list/create",
      body: {
        cookie: resolveCookieArg(args, state, config),
        list_name: listName,
        list_description: listDescription,
        is_private: hasFlag(args, "--private"),
      },
    });
    return;
  }

  if (action === "members") {
    const listId = requireCommandValue(args[2], "Usage: x-api-scraper list members <list_id> [--count <n>]");
    await performRequest(state, config, {
      method: "GET",
      path: `/twitter/list/${encodeURIComponent(listId)}/members/${readCountOption(args, 100)}`,
    });
    return;
  }

  if (action === "subscribers") {
    const listId = requireCommandValue(args[2], "Usage: x-api-scraper list subscribers <list_id> [--count <n>]");
    await performRequest(state, config, {
      method: "GET",
      path: `/twitter/list/${encodeURIComponent(listId)}/subscribers/${readCountOption(args, 100)}`,
    });
    return;
  }

  exitWithError("Unknown list command.", "Use: list search | list create | list members | list subscribers");
}

async function handleTweetCommand(state, config, args) {
  const action = args[1];

  if (action === "create") {
    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/tweets/create",
      body: buildTweetBody(args, state, config),
    });
    return;
  }

  if (action === "quote") {
    const quoteUrl = requireCommandValue(findOption(args, "--quote-url"), "Usage: x-api-scraper tweet quote --text <content> --quote-url <url>");
    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/tweets/quote",
      body: {
        ...buildTweetBody(args, state, config),
        quote_tweet_url: quoteUrl,
      },
    });
    return;
  }

  if (action === "thread") {
    const tweetId = requireCommandValue(args[2], "Usage: x-api-scraper tweet thread <tweet_id> [--count <n>]");
    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/tweets/thread_by_id",
      body: {
        tweet_id: tweetId,
        max_items: readCountOption(args, 40),
      },
    });
    return;
  }

  if (action === "lookup") {
    const tweetIds = collectPositionals(args, 2);
    if (tweetIds.length === 0) {
      exitWithError("Usage: x-api-scraper tweet lookup <tweet_id...>");
    }
    const summary = args.includes("--summary");
    const result = await performRequest(state, config, {
      method: "POST",
      path: "/twitter/tweets/lookup",
      body: tweetIds,
      silent: summary,
    });

    if (summary && result.data && Array.isArray(result.data.data)) {
      for (const tweet of result.data.data) {
        console.log(`${tweet.tweet_id}:${tweet.is_paid_promotion}`);
      }
    }
    return;
  }

  if (action === "replies") {
    const tweetId = requireCommandValue(args[2], "Usage: x-api-scraper tweet replies <tweet_id> [--sort Relevance|Recency|Likes] [--cursor <token>]");
    const sort = findOption(args, "--sort") || "Recency";
    const cursor = findOption(args, "--cursor");
    if (!REPLY_SORTS.has(sort)) {
      exitWithError(`Invalid --sort value: ${sort}`, "Use: Relevance | Recency | Likes");
    }
    await performRequest(state, config, {
      method: "POST",
      path: `/twitter/tweets/${encodeURIComponent(tweetId)}/replies/page`,
      body: {
        sort_by: sort,
        ...(cursor ? { next_cursor: cursor } : {}),
      },
    });
    return;
  }

  if (action === "like" || action === "unlike" || action === "bookmark" || action === "unbookmark" || action === "retweet" || action === "unretweet") {
    const tweetId = requireCommandValue(args[2], `Usage: x-api-scraper tweet ${action} <tweet_id>`);
    const mapping = {
      like: { method: "POST", path: `/twitter/tweets/${encodeURIComponent(tweetId)}/like` },
      unlike: { method: "DELETE", path: `/twitter/tweets/${encodeURIComponent(tweetId)}/like` },
      bookmark: { method: "POST", path: `/twitter/tweets/${encodeURIComponent(tweetId)}/bookmark` },
      unbookmark: { method: "DELETE", path: `/twitter/tweets/${encodeURIComponent(tweetId)}/bookmark` },
      retweet: { method: "POST", path: `/twitter/tweets/${encodeURIComponent(tweetId)}/retweet` },
      unretweet: { method: "DELETE", path: `/twitter/tweets/${encodeURIComponent(tweetId)}/retweet` },
    };
    await performRequest(state, config, {
      ...mapping[action],
      body: tweetActionBody(args, state, config),
    });
    return;
  }

  exitWithError(
    "Unknown tweet command.",
    "Use: tweet create | tweet quote | tweet lookup | tweet thread | tweet replies | tweet like | tweet unlike | tweet bookmark | tweet unbookmark | tweet retweet | tweet unretweet",
  );
}

async function handleUserCommand(state, config, args) {
  const action = args[1];
  const username = requireCommandValue(args[2], "Usage: x-api-scraper user follow <username> | user unfollow <username>");
  const proxy = findOption(args, "--proxy");

  if (action === "follow") {
    await performRequest(state, config, {
      method: "POST",
      path: "/twitter/user/follow",
      body: {
        username,
        cookie: resolveCookieArg(args, state, config),
        ...(proxy ? { proxy } : {}),
      },
    });
    return;
  }

  if (action === "unfollow") {
    await performRequest(state, config, {
      method: "DELETE",
      path: "/twitter/user/follow",
      body: {
        username,
        cookie: resolveCookieArg(args, state, config),
        ...(proxy ? { proxy } : {}),
      },
    });
    return;
  }

  exitWithError("Unknown user command.", "Use: user follow | user unfollow");
}

async function handleGenericRequest(state, config, args) {
  const requestPath = requireCommandValue(args[0], "Usage: x-api-scraper <path>");
  await performRequest(state, config, {
    method: state.method,
    path: requestPath,
    body: state.data,
  });
}

export async function runCommand(state, config) {
  const [command] = state.commandArgs;

  if (!command) {
    return false;
  }

  if (command.startsWith("/") || /^https?:\/\//i.test(command)) {
    await handleGenericRequest(state, config, state.commandArgs);
    return true;
  }

  if (command === "config") {
    await handleConfigCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "auth") {
    await handleAuthCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "users") {
    await handleUsersCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "about") {
    await handleAboutCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "search") {
    await handleSearchCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "followers") {
    await handleFollowersCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "following") {
    await handleFollowingCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "community") {
    await handleCommunityCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "list") {
    await handleListCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "tweet") {
    await handleTweetCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "user") {
    await handleUserCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "article") {
    await handleArticleCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "dm") {
    await handleDmCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "profile") {
    await handleProfileCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "timeline") {
    await handleTimelineCommand(state, config, state.commandArgs);
    return true;
  }

  if (command === "trending") {
    await handleTrendingCommand(state, config, state.commandArgs);
    return true;
  }

  exitWithError(`Unknown command: ${command}`, "Run x-api-scraper --help for usage.");
}
