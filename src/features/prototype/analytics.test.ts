import { afterEach, describe, expect, it, vi } from "vitest";
import type { CaptureResult } from "posthog-js";
import {
  getFrontendErrorProperties,
  getUiClickProperties,
  sanitizeAnalyticsEvent,
} from "./analytics";

afterEach(() => vi.unstubAllGlobals());

describe("analytics privacy", () => {
  it("removes query strings and captured DOM content before sending", () => {
    vi.stubGlobal("window", { location: { origin: "https://doroboty-ai.vercel.app" } });
    const event = {
      properties: {
        $current_url: "https://doroboty-ai.vercel.app/#/oferty?query=private-marker",
        $referrer: "https://example.test/?query=private-marker",
        $elements: [{ text: "private-marker" }],
        $elements_chain: "button with text private-marker",
        text: "private-marker",
        $search: "private-marker",
        element_type: "button",
        job_id: "synthetic-job-1",
      },
    } as unknown as CaptureResult;

    const sanitized = sanitizeAnalyticsEvent(event);

    expect(sanitized.properties.$current_url).toBe("https://doroboty-ai.vercel.app/#/oferty");
    expect(sanitized.properties.$referrer).toBe("https://example.test/");
    expect(sanitized.properties).not.toHaveProperty("$elements");
    expect(sanitized.properties).not.toHaveProperty("$elements_chain");
    expect(sanitized.properties).not.toHaveProperty("text");
    expect(sanitized.properties).not.toHaveProperty("$search");
    expect(sanitized.properties.job_id).toBe("synthetic-job-1");
  });

  it("records only a coarse element type for link and button clicks", () => {
    expect(getUiClickProperties("A")).toEqual({ element_type: "link" });
    expect(getUiClickProperties("BUTTON")).toEqual({ element_type: "button" });
  });

  it("reports browser errors without messages, stacks, URLs, or rejected values", () => {
    expect(getFrontendErrorProperties("window")).toEqual({ error_source: "window" });
    expect(getFrontendErrorProperties("promise")).toEqual({ error_source: "promise" });
  });
});
