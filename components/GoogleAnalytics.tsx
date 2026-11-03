import React from 'react';
import Script from 'next/script';

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID;

const GoogleAnalytics = () => {
  if (!MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        id="ga-loader"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
      />

      <Script id="ga-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
