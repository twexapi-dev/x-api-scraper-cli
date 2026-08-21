import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(rootDir, "bin", "x-api-scraper.js");

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: rootDir,
    encoding: "utf8",
  });
}

function preview(args) {
  const result = runCli(["--dry-run", ...args]);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("followers uses the v3 endpoint", () => {
  const body = preview(["followers", "elonmusk", "--count", "20", "--cursor", "abc"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/v3/twitter/users/followers");
  assert.equal(body.body.username, "elonmusk");
  assert.equal(body.body.count, 20);
  assert.equal(body.body.cursor, "abc");
});

test("followers verified uses the v3 verified-followers endpoint", () => {
  const body = preview(["followers", "verified", "elonmusk", "--count", "10"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/v3/twitter/users/verified-followers");
  assert.equal(body.body.username, "elonmusk");
  assert.equal(body.body.count, 10);
});

test("following uses the v3 endpoint", () => {
  const body = preview(["following", "elonmusk", "--count", "20"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/v3/twitter/users/following");
  assert.equal(body.body.username, "elonmusk");
  assert.equal(body.body.count, 20);
});

test("search hashtags posts the hashtag search body", () => {
  const body = preview(["search", "hashtags", "ai", "openai", "--count", "30", "--sort", "Top"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/twitter/hashtags");
  assert.deepEqual(body.body.hashtags, ["ai", "openai"]);
  assert.equal(body.body.maxItems, 30);
  assert.equal(body.body.sortBy, "Top");
});

test("search cashtags posts the cashtag search body", () => {
  const body = preview(["search", "cashtags", "TSLA", "--count", "15"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/twitter/cashtags");
  assert.deepEqual(body.body.cashtags, ["TSLA"]);
  assert.equal(body.body.maxItems, 15);
  assert.equal(body.body.sortBy, "Latest");
});

test("tweet thread fetches a thread by root tweet id", () => {
  const body = preview(["tweet", "thread", "1900000000000000000", "--count", "40"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/twitter/tweets/thread_by_id");
  assert.equal(body.body.tweet_id, "1900000000000000000");
  assert.equal(body.body.max_items, 40);
});

test("community search posts the community search body", () => {
  const body = preview(["community", "search", "--query", "ai", "--count", "10"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/twitter/community/search");
  assert.equal(body.body.query, "ai");
  assert.equal(body.body.target_count, 10);
});

test("community get fetches community details", () => {
  const body = preview(["community", "get", "123"]);
  assert.equal(body.method, "GET");
  assert.equal(body.url, "https://api.twexapi.io/twitter/community/123");
});

test("community members fetches community members", () => {
  const body = preview(["community", "members", "123", "--count", "50"]);
  assert.equal(body.method, "GET");
  assert.equal(body.url, "https://api.twexapi.io/twitter/community/123/members/50");
});

test("community tweets fetches community tweets", () => {
  const body = preview(["community", "tweets", "123", "--type", "Top", "--count", "25"]);
  assert.equal(body.method, "GET");
  assert.equal(body.url, "https://api.twexapi.io/twitter/community/123/tweets/Top/25");
});

test("community search-tweets posts the community tweet search body", () => {
  const body = preview(["community", "search-tweets", "123", "--query", "launch", "--count", "20"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/twitter/community/search-tweets");
  assert.equal(body.body.community_id, "123");
  assert.equal(body.body.query, "launch");
  assert.equal(body.body.target_count, 20);
});
