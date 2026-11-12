import posthog, { type CaptureResult } from "posthog-js";

type AnalyticsConsent = "granted" | "denied" | "pending" | "unavailable";

const projectToken = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
let initialized = false;

function cleanUrl(value: string) {
  try {
    const origin = typeof window === "undefined" ? "https://localhost" : window.location.origin;
    const url = new URL(value, origin);
    url.search = "";

    if (url.hash.startsWith("#/")) {
      const route = url.hash.slice(1);
      const anchorIndex = route.indexOf("#");
      const pathAndQuery = anchorIndex === -1 ? route : route.slice(0, anchorIndex);
      const anchor = anchorIndex === -1 ? "" : route.slice(anchorIndex);
      const path = pathAndQuery.split("?", 1)[0];
      url.hash = path ? "#" + path + anchor : "";
    }

    return url.toString();
  } catch {
    return value;
  }
}

export function sanitizeAnalyticsEvent(event: CaptureResult): CaptureResult {
  for (const key of ["$current_url", "$initial_current_url", "$referrer", "$el_href", "$href"]) {
    const value = event.properties[key];
    if (typeof value === "string") event.properties[key] = cleanUrl(value);
  }

  for (const key of [
    "$search",
    "$elements",
    "$elements_chain",
    "elements_chain",
    "$element_text",
    "$el_text",
    "element_text",
    "text",
    "$selected_content",
    "$exception_message",
    "$exception_stack_trace_raw",
    "$exception_list",
    "exception_message",
  ]) {
    delete event.properties[key];
  }

  return event;
}

export function getUiClickProperties(tagName: string) {
  return { element_type: tagName.toLowerCase() === "a" ? "link" : "button" };
}

export function getFrontendErrorProperties(source: "window" | "promise") {
  return { error_source: source };
}

export function getAnalyticsConfig() {
  return {
    api_host: apiHost,
    defaults: "2026-08-30" as const,
    capture_pageview: "history_change" as const,
    capture_pageleave: "if_capture_pageview" as const,
    autocapture: false,
    disable_session_recording: true,
    disable_external_dependency_loading: true,
    disable_surveys: true,
    disable_product_tours: true,
    disable_web_experiments: true,
    advanced_disable_flags: true,
    opt_out_capturing_by_default: true,
    before_send: sanitizeAnalyticsEvent,
  };
}

export function captureOptionalAnalytics(capture: () => void) {
  try {
    capture();
  } catch {
    // Analytics is optional and must not interrupt a user action.
  }
}

function captureUiClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;
  if (event.target.closest(".ph-no-autocapture, [data-ph-no-autocapture]")) return;

  const element = event.target.closest("a, button");
  if (element) {
    captureAnalyticsEvent("ui_element_clicked", getUiClickProperties(element.tagName));
  }
}

export function initializeAnalytics() {
  if (initialized || !import.meta.env.PROD || !projectToken || !apiHost) return;

  try {
    posthog.init(projectToken, getAnalyticsConfig());

    document.addEventListener("click", captureUiClick);
    window.addEventListener("error", () => {
      captureAnalyticsEvent("frontend_error", getFrontendErrorProperties("window"));
    });
    window.addEventListener("unhandledrejection", () => {
      captureAnalyticsEvent("frontend_error", getFrontendErrorProperties("promise"));
    });
    initialized = true;
  } catch {
    // Analytics setup must never prevent the prototype from loading.
  }
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (!initialized) return "unavailable";

  const status = posthog.get_explicit_consent_status();
  if (status === "granted" || status === "denied") return status;
  return "pending";
}

export function setAnalyticsConsent(allowed: boolean) {
  if (!initialized) return;

  if (allowed) {
    posthog.opt_in_capturing({ captureEventName: false });
    posthog.capture("$pageview");
  } else {
    posthog.opt_out_capturing();
  }
}

export function captureAnalyticsEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  if (getAnalyticsConsent() === "granted") {
    captureOptionalAnalytics(() => posthog.capture(event, properties));
  }
}
