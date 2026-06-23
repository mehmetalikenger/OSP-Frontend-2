"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./combobox.module.css";

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    className?: string;
    containerClassName?: string;
    // Optional display formatter: keeps `value`/`options` as stable internal keys
    // while showing a translated label. Defaults to showing the raw value.
    getLabel?: (value: string) => string;
}

export default function Combobox({ value, onChange, options, className, containerClassName, getLabel }: ComboboxProps) {
    const label = (v: string) => (getLabel ? getLabel(v) : v);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className={`${styles.comboboxContainer} ${containerClassName || ""}`} ref={containerRef}>
            <div className={styles.inputWrapper} onClick={() => setIsOpen(!isOpen)}>
                <input
                    type="text"
                    value={label(value)}
                    readOnly
                    className={`${styles.comboboxInput} ${className || ""}`}
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
                <ul className={styles.dropdownList}>
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
