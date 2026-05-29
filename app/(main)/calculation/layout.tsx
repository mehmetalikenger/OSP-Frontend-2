"use client";

import styles from "./calculation.module.css";

export default function CalculationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${styles.mobileContainer} ${styles.container}`}>
            {children}
            <div className={styles.bottomLogo}>
                <img src="../../logo/logo.png" alt="OffiTec Logo" />
            </div>
        </div>
    );
}
