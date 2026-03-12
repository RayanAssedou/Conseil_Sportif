"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function TrackingScripts() {
  const [fbPixelId, setFbPixelId] = useState("");
  const [googleTagId, setGoogleTagId] = useState("");

  useEffect(() => {
    fetch("/api/content/section?key=facebook_pixel")
      .then((r) => r.json())
      .then((d) => setFbPixelId(d?.view_all_link || ""))
      .catch(() => {});

    fetch("/api/content/section?key=google_tag")
      .then((r) => r.json())
      .then((d) => setGoogleTagId(d?.view_all_link || ""))
      .catch(() => {});
  }, []);

  const isGTM = googleTagId.startsWith("GTM-");

  return (
    <>
      {fbPixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbPixelId}');fbq('track','PageView');`}
        </Script>
      )}

      {googleTagId && isGTM && (
        <>
          <Script src={`https://www.googletagmanager.com/gtm.js?id=${googleTagId}`} strategy="afterInteractive" />
          <Script id="gtm-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`}
          </Script>
        </>
      )}

      {googleTagId && !isGTM && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleTagId}');`}
          </Script>
        </>
      )}
    </>
  );
}
