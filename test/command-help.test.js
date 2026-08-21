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

test("search tweets --help prints command-specific usage", () => {
  const result = runCli(["search", "tweets", "--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /x-api-scraper search tweets/);
  assert.match(result.stdout, /--sort/);
  assert.match(result.stdout, /--cursor/);
  assert.doesNotMatch(result.stdout, /Unknown search command/);
});

test("tweet create --help prints write-action usage", () => {
  const result = runCli(["tweet", "create", "--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /x-api-scraper tweet create/);
  assert.match(result.stdout, /--text/);
  assert.match(result.stdout, /--media-url/);
});

test("followers --help lists the v3 and verified forms", () => {
  const result = runCli(["followers", "--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /followers <username>/);
  assert.match(result.stdout, /followers verified/);
});

test("search --help lists search subcommands", () => {
  const result = runCli(["search", "--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /search tweets/);
  assert.match(result.stdout, /search users/);
  assert.match(result.stdout, /search hashtags/);
  assert.match(result.stdout, /search cashtags/);
});
