"use client";
import { useEffect } from "react";

// The login page is always shown in light mode. The root layout adds the
// `dark-mode` class to <body> based on the persisted `theme` cookie, so we
// strip it here while the login route is mounted. The inline script runs
// before first paint (full loads, e.g. logout redirects) to avoid a flash;
// the effect covers client-side navigations into the route.
export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    document.body.classList.remove("dark-mode");
    document.body.style.backgroundColor = "";
  }, []);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.body.classList.remove('dark-mode');document.body.style.backgroundColor='';",
        }}
      />
      {children}
    </>
  );
}
