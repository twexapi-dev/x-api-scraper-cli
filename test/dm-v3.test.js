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

test("dm send uses the v3 XChat endpoint", () => {
  const result = runCli([
    "--dry-run",
    "dm",
    "send",
    "elonmusk",
    "--text",
    "hello",
    "--media-url",
    "https://example.com/a.jpg",
  ]);

  assert.equal(result.status, 0, result.stderr);
  const preview = JSON.parse(result.stdout);
  assert.equal(preview.method, "POST");
  assert.equal(preview.url, "https://api.twexapi.io/v3/twitter/send-dm");
  assert.equal(preview.body.recipient, "elonmusk");
  assert.equal(preview.body.text, "hello");
  assert.deepEqual(preview.body.media_urls, ["https://example.com/a.jpg"]);
});

test("dm history uses the v3 XChat endpoint", () => {
  const result = runCli([
    "--dry-run",
    "dm",
    "history",
    "elonmusk",
    "--count",
    "50",
    "--before",
    "abc",
  ]);

  assert.equal(result.status, 0, result.stderr);
  const preview = JSON.parse(result.stdout);
  assert.equal(preview.method, "POST");
  assert.equal(preview.url, "https://api.twexapi.io/v3/twitter/dm-history");
  assert.equal(preview.body.recipient, "elonmusk");
  assert.equal(preview.body.count, 50);
  assert.equal(preview.body.before, "abc");
});

test("dm conversations uses the v3 inbox endpoint", () => {
  const result = runCli(["--dry-run", "dm", "conversations", "--count", "20"]);

  assert.equal(result.status, 0, result.stderr);
  const preview = JSON.parse(result.stdout);
  assert.equal(preview.method, "POST");
  assert.equal(preview.url, "https://api.twexapi.io/v3/twitter/conversations");
  assert.equal(preview.body.count, 20);
});
