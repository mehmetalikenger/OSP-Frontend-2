"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./adminCombobox.module.css";

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: string[];
    className?: string;
    containerClassName?: string;
}

export default function AdminCombobox({ value, onChange, options, className, containerClassName }: ComboboxProps) {
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
                    value={value}
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
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
