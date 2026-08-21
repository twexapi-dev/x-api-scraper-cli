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

test("search tweets uses advanced search by page", () => {
  const body = preview(["search", "tweets", "founder", "ai", "--sort", "Top", "--cursor", "abc"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/twitter/advanced_search/page");
  assert.deepEqual(body.body.searchTerms, ["founder", "ai"]);
  assert.equal(body.body.sortBy, "Top");
  assert.equal(body.body.next_cursor, "abc");
  assert.equal(body.body.maxItems, undefined);
});

test("tweet replies uses replies by page", () => {
  const body = preview(["tweet", "replies", "1900000000000000000", "--sort", "Likes", "--cursor", "xyz"]);
  assert.equal(body.method, "POST");
  assert.equal(body.url, "https://api.twexapi.io/twitter/tweets/1900000000000000000/replies/page");
  assert.equal(body.body.sort_by, "Likes");
  assert.equal(body.body.next_cursor, "xyz");
});
