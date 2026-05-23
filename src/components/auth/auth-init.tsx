"use client";

/**
 * EazoProvider (in layout) handles session init automatically.
 * In local development we hide the Eazo web handoff chrome so the app can be
 * tested as a normal mobile viewport without the promo modal covering it.
 */
export function AuthInit() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <style>{`
      html.eazo-host-web {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
      html.eazo-host-web .eazo-app-area {
        position: static !important;
        inset: auto !important;
        min-height: 100svh !important;
      }
      html.eazo-host-web .eazo-app-area-scroller {
        min-height: 100svh !important;
      }
      .eazo-handoff-root {
        display: none !important;
      }
    `}</style>
  );
}
