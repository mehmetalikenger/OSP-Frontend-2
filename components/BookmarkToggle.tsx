"use client";

import { useState } from "react";
import styles from "./BookmarkToggle.module.css";

interface BookmarkToggleProps {
    className?: string;
    initialSaved?: boolean;
}

export default function BookmarkToggle({ className, initialSaved = false }: BookmarkToggleProps) {
    const [isSaved, setIsSaved] = useState(initialSaved);

    return (
        <div className={`${styles.bookmarkBtn} ${className || ""}`} onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }}>
            {!isSaved ? (
                <>
                    <img src="/icons/bookmark.png" className={styles.lightIcon} alt="Save" />
                    <img src="/icons/bookmark-darkMode.png" className={styles.darkIcon} alt="Save" />
                </>
            ) : (
                <>
                    <img src="/icons/bookmark-selected.png" className={styles.lightIcon} alt="Saved" />
                    <img src="/icons/bookmark-darkMode-selected.png" className={styles.darkIcon} alt="Saved" />
                </>
            )}
        </div>
    );
}