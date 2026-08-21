export function printHelp() {
  console.log(`x-api-scraper - command-line client for TwexAPI X/Twitter endpoints

Usage:
  x-api-scraper [global options] <path>                                         # Raw API request

  # Twitter/X User and Search
  x-api-scraper [global options] users <username...>                            # Multi-user lookup
  x-api-scraper [global options] about <screen_name>                            # User profile details
  x-api-scraper [global options] search tweets <term...> [--sort Latest|Top]    # Search tweets by page
  x-api-scraper [global options] search users <keyword> [--count <n>]           # Search Twitter/X users
  x-api-scraper [global options] search hashtags <tag...> [--count <n>]         # Search tweets by hashtag
  x-api-scraper [global options] search cashtags <tag...> [--count <n>]         # Search tweets by cashtag
  x-api-scraper [global options] followers <username> [--count <n>]             # List followers (v3)
  x-api-scraper [global options] followers verified <username> [--count <n>]    # List verified followers (v3)
  x-api-scraper [global options] following <username> [--count <n>]             # List following (v3)

  # Twitter/X Communities
  x-api-scraper [global options] community search --query <text> [--count <n>]  # Search communities
  x-api-scraper [global options] community get <community_id>                   # Get community details
  x-api-scraper [global options] community members <community_id> [--count <n>] # List community members
  x-api-scraper [global options] community tweets <community_id> [--type Top|Latest|Media]  # List community tweets
  x-api-scraper [global options] community search-tweets <id> --query <text>    # Search tweets in a community

  # Twitter/X Lists
  x-api-scraper [global options] list search --query <text> [--count <n>]       # Search for lists
  x-api-scraper [global options] list create --name <n> --desc <t> [--private]  # Create a new list
  x-api-scraper [global options] list members <list_id> [--count <n>]           # List members in a list
  x-api-scraper [global options] list subscribers <list_id> [--count <n>]       # List list subscribers

  # Twitter/X Articles and DMs
  x-api-scraper [global options] article markdown <tweet_id>                    # Fetch article as Markdown
  x-api-scraper [global options] article lookup <tweet_id...>                   # Batch article details
  x-api-scraper [global options] article publish-md <file.md> --title <title>   # Publish Markdown as an X article
  x-api-scraper [global options] dm status <id_or_username...>                  # Check XChat / DM status
  x-api-scraper [global options] dm conversations [--count <n>] [--all]         # List XChat conversations
  x-api-scraper [global options] dm history <recipient> [--count <n>]           # Fetch XChat / DM history
  x-api-scraper [global options] dm send <recipient> --text <content>           # Send an XChat / DM
  x-api-scraper [global options] dm media --conversation-id <id> --media-hash-key <k>  # Fetch DM media

  # Twitter/X Profile and Timeline
  x-api-scraper [global options] profile update [--name <n>] [--desc <t>] ...   # Update your profile info
  x-api-scraper [global options] timeline user <screen_name> [--cursor <c>]     # Fetch user timeline page

  # Twitter/X Global Trending
  x-api-scraper [global options] trending tweets --country <country>            # Fetch global trending tweets

  # Twitter/X Tweets
  x-api-scraper [global options] tweet create --text <c> [--media-url <u>]      # Create a new tweet
  x-api-scraper [global options] tweet quote --text <c> --quote-url <u>         # Quote a tweet
  x-api-scraper [global options] tweet lookup <tweet_id...> [--summary]         # Batch tweet lookup
  x-api-scraper [global options] tweet thread <tweet_id> [--count <n>]          # Fetch a tweet thread
  x-api-scraper [global options] tweet replies <tweet_id> [--sort Recency]      # Fetch tweet replies by page
  x-api-scraper [global options] tweet like <tweet_id>                          # Like a tweet
  x-api-scraper [global options] tweet bookmark <tweet_id>                      # Bookmark a tweet
  x-api-scraper [global options] tweet retweet <tweet_id>                       # Retweet a tweet

  # Twitter/X Actions
  x-api-scraper [global options] user follow <username>                         # Follow a user
  x-api-scraper [global options] user unfollow <username>                       # Unfollow a user

  # Config and Auth
  x-api-scraper [global options] auth apps add --name <n> --api-key <k>         # Add an app config
  x-api-scraper [global options] auth profiles add --name <n> [--cookie <v>]    # Add an auth profile
  x-api-scraper [global options] auth cookie --auth-token <t> [--save-as <p>]   # Create profile from token
  x-api-scraper [global options] config show                                    # Show current config

Examples:
  x-api-scraper --app prod users elonmusk sama
  x-api-scraper --profile founder tweet create --text "hello world" --media-url "https://example.com/image.jpg"
  x-api-scraper --app prod --profile founder article publish-md ./article.md --title "Launch Notes" --cover-image "https://example.com/cover.jpg"
  x-api-scraper --profile founder tweet like 1900000000000000000
  x-api-scraper --app prod trending tweets --country "United States" --topic "Sports" --content "NFL" --count 50
  x-api-scraper --app prod -X POST -d '["1900000000000000000"]' /twitter/tweets/lookup # Twitter/X tweet lookup
  x-api-scraper auth apps add --name prod --api-key "twitterx_..."
  x-api-scraper auth profiles add --name founder --cookie "ct0=...; auth_token=..."
  x-api-scraper auth cookie --auth-token "<auth_token>" --save-as founder
  x-api-scraper config show

Global options:
  -X, --method <METHOD>       HTTP method for generic path requests, default GET
  -d, --data <JSON>           JSON body for generic path requests
  -H, --header <K:V>          Extra header for generic path requests, can be repeated
  --app <NAME>                Use a saved app config
  --profile <NAME>            Use a saved profile config
  --api-key <KEY>             Override API key for this request
  --base-url <URL>            Override base URL for this request
  --config-dir <DIR>          Override config directory, default ~/.x-api-scraper
  --dry-run                   Print the request payload without sending it
  --raw                       Print response body without pretty JSON formatting
  -h, --help                  Show help. Place after a command for command-specific help

Notes:
  Global options should be placed before the command.
  Saved apps store API keys and base URLs.
  Saved profiles store cookies or auth_token values for write actions.
  Get API keys from https://twexapi.io/dashboard.
  Copy the API key from the dashboard and save it with auth apps add.
  Run x-api-scraper <command> --help for command-specific usage.
`);
}
