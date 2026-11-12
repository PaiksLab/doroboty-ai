import { afterEach, describe, expect, it, vi } from "vitest";
import type { CaptureResult } from "posthog-js";
import {
  captureOptionalAnalytics,
  getAnalyticsConfig,
  getFrontendErrorProperties,
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

  it("reports browser errors without messages, stacks, URLs, or rejected values", () => {
    expect(getFrontendErrorProperties("window")).toEqual({ error_source: "window" });
    expect(getFrontendErrorProperties("promise")).toEqual({ error_source: "promise" });
  });

  it("disables unused PostHog remote features and external scripts", () => {
    const config = getAnalyticsConfig();
    expect(config.advanced_disable_flags).toBe(true);
    expect(config.disable_external_dependency_loading).toBe(true);
    expect(config.disable_session_recording).toBe(true);
    expect(config.disable_surveys).toBe(true);
    expect(config.disable_product_tours).toBe(true);
    expect(config.disable_web_experiments).toBe(true);
    expect(config.opt_out_capturing_by_default).toBe(true);
    expect(config.autocapture).toEqual({
      dom_event_allowlist: ["click"],
      element_allowlist: ["a", "button"],
      css_selector_ignorelist: [".ph-no-autocapture", "[data-ph-no-autocapture]"],
      capture_copied_text: false,
    });
    expect(config.mask_all_text).toBe(true);
    expect(config.mask_all_element_attributes).toBe(true);
  });

  it("swallows synchronous analytics failures so product actions can continue", () => {
    expect(() =>
      captureOptionalAnalytics(() => {
        throw new Error("offline");
      }),
    ).not.toThrow();
  });
});
