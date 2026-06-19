"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import styles from "./BookmarkToggle.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

interface BookmarkToggleProps {
    className?: string;
    unitId: number;
    initialSaved?: boolean;
    onSavedChange?: (nowSaved: boolean) => void;
}

export default function BookmarkToggle({ className, unitId, initialSaved = false, onSavedChange }: BookmarkToggleProps) {
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsSaved(initialSaved);
    }, [initialSaved]);

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (loading) return;
        const optimisticSaved = !isSaved;
        setIsSaved(optimisticSaved);
        onSavedChange?.(optimisticSaved);
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API}/units/${unitId}/save`, {
                method: "POST",
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setIsSaved(data.saved);
                onSavedChange?.(data.saved);
            } else {
                setIsSaved(!optimisticSaved);
                onSavedChange?.(!optimisticSaved);
            }
        } catch {
            setIsSaved(!optimisticSaved);
            onSavedChange?.(!optimisticSaved);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`${styles.bookmarkBtn} ${className || ""}`}
            onClick={handleClick}
            style={{ opacity: loading ? 0.6 : 1 }}
        >
            <img src="/icons/bookmark.png" className={`${styles.lightIcon} ${isSaved ? styles.hide : ""}`} alt="Save" />
            <img src="/icons/bookmark-darkMode.png" className={`${styles.darkIcon} ${isSaved ? styles.hide : ""}`} alt="Save" />
            <img src="/icons/bookmark-selected.png" className={`${styles.lightIcon} ${!isSaved ? styles.hide : ""}`} alt="Saved" />
            <img src="/icons/bookmark-darkMode-selected.png" className={`${styles.darkIcon} ${!isSaved ? styles.hide : ""}`} alt="Saved" />
        </div>
    );
}
