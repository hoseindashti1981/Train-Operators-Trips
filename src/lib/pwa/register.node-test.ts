import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isGrokHost, shouldRegisterServiceWorker } from "./policy.ts";

describe("pwa registration gate", () => {
  it("skips Grok hosts so the platform PWA overlay stays in charge", () => {
    assert.equal(isGrokHost("example.grok.me"), true);
    assert.equal(
      shouldRegisterServiceWorker({
        hostname: "abc.grok.me",
        protocol: "https:",
        secure: true,
        hasServiceWorker: true,
        prod: true,
      }),
      false,
    );
  });

  it("registers on GitHub Pages even if prod flag is missing", () => {
    assert.equal(
      shouldRegisterServiceWorker({
        hostname: "hoseindashti1981.github.io",
        protocol: "https:",
        secure: true,
        hasServiceWorker: true,
        prod: false,
      }),
      true,
    );
  });

  it("registers production builds on localhost preview", () => {
    assert.equal(
      shouldRegisterServiceWorker({
        hostname: "127.0.0.1",
        protocol: "http:",
        secure: true,
        hasServiceWorker: true,
        prod: true,
      }),
      true,
    );
  });

  it("does not register insecure non-localhost", () => {
    assert.equal(
      shouldRegisterServiceWorker({
        hostname: "example.com",
        protocol: "http:",
        secure: false,
        hasServiceWorker: true,
        prod: true,
      }),
      false,
    );
  });
});
