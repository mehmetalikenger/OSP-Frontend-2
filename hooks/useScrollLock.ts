import { useEffect } from "react";

/**
 * Locks the page scroll when `isLocked` is true, without hiding the scrollbar.
 * Prevents layout shift by padding the body to compensate for the scrollbar width.
 */
export function useScrollLock(isLocked: boolean) {
    useEffect(() => {
        if (!isLocked) return;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [isLocked]);
}
