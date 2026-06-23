"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./adminCombobox.module.css";

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    className?: string;
    containerClassName?: string;
    disabled?: boolean;
    // Optional display formatter: keeps option values as stable keys (e.g. the
    // "All" filter sentinel) while showing a translated label.
    getLabel?: (value: string) => string;
}

export default function AdminCombobox({ value, onChange, options, className, containerClassName, disabled, getLabel }: ComboboxProps) {
    const label = (v: string) => (getLabel ? getLabel(v) : v);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOptionSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.key.length === 1) {
            const letter = e.key.toLowerCase();
            // Start searching from the next item after the current value, wrapping around
            const currentIndex = options.indexOf(value);
            let match = options.slice(currentIndex + 1).find(opt => opt.toLowerCase().startsWith(letter));
            if (!match) {
                match = options.find(opt => opt.toLowerCase().startsWith(letter));
            }
            
            if (match) {
                onChange(match);
                if (isOpen && listRef.current) {
                    const index = options.indexOf(match);
                    const liElement = listRef.current.children[index] as HTMLElement;
                    if (liElement) {
                        liElement.scrollIntoView({ block: "nearest" });
                    }
                }
            }
        }
    };

    return (
        <div className={`${styles.comboboxContainer} ${containerClassName || ""} ${disabled ? styles.disabled : ""}`} ref={containerRef}>
            <div className={styles.inputWrapper} onClick={() => !disabled && setIsOpen(!isOpen)}>
                <input
                    type="text"
                    value={label(value)}
                    readOnly
                    disabled={disabled}
                    className={`${styles.comboboxInput} ${className || ""}`}
                    onKeyDown={handleKeyDown}
                />
                <img
                    src="/icons/back.png"
                    alt="arrow"
                    className={`${styles.arrowIcon} ${isOpen ? styles.arrowIconOpen : ""} ${styles.lightIcon}`}
                />
                <img
                    src="/icons/back-darkMode.png"
                    alt="arrow"
                    className={`${styles.arrowIcon} ${isOpen ? styles.arrowIconOpen : ""} ${styles.darkIcon}`}
                />
            </div>
            {isOpen && (
                <ul className={styles.dropdownList} ref={listRef}>
                    {options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleOptionSelect(option)}
                            className={`${styles.dropdownItem} ${
                                option === value ? styles.dropdownItemActive : ""
                            }`}
                        >
                            {label(option)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
