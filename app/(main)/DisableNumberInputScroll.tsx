"use client";

import { useEffect } from "react";

// Prevents <input type="number"> from changing its value on mouse-wheel scroll.
// When the wheel fires over a focused number input we blur it; the listener runs
// before the browser's default increment, so the value stays put and the page
// still scrolls normally.
export default function DisableNumberInputScroll() {
    useEffect(() => {
        const handler = () => {
            const el = document.activeElement as HTMLElement | null;
            if (el && el.tagName === "INPUT" && (el as HTMLInputElement).type === "number") {
                el.blur();
            }
        };
        document.addEventListener("wheel", handler, { passive: true });
        return () => document.removeEventListener("wheel", handler);
    }, []);

    return null;
}
