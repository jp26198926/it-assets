"use client";

import { useEffect } from "react";
import { getAppSettings } from "@/lib/actions/application-actions";

export function DynamicFavicon() {
  useEffect(() => {
    getAppSettings().then((settings) => {
      if (settings.app_favicon) {
        let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = settings.app_favicon;
      }
    });
  }, []);

  return null;
}
