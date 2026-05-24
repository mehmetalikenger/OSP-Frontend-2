"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "../catalog.module.css";

export default function ChillerPage() {
    const [activeCategory, setActiveCategory] = useState<'chillers' | 'heatPumps'>('chillers');
    const router = useRouter();

    const handleCategoryClick = (category: 'chillers' | 'heatPumps') => {
        setActiveCategory(category);
        if (category === 'heatPumps') {
            router.push('/heat-pumps');
        } else {
            router.push('/chiller');
        }
    };
    return (
        <div className={styles.container}>
            <h1 className={styles.header}>Products</h1>
            <div className={styles.categories}>
                <div
                    className={`${styles.categoryBtn} ${activeCategory === 'chillers' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('chillers')}
                    style={{ cursor: 'pointer' }}
                >
                    <h2>Chillers</h2>
                </div>
                <div
                    className={`${styles.categoryBtn} ${activeCategory === 'heatPumps' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('heatPumps')}
                    style={{ cursor: 'pointer' }}
                >
                    <h2>Heat Pumps</h2>
                </div>
            </div>
            <div className={styles.products}>
                <div className={styles.product}>
                    <div className={styles.productInfo}>
                        <div className={styles.productTitle}>
                            <h3>Air Cooled Chillers</h3>
                        </div>
                        <div className={styles.productImage}>
                            <img src="../images/products/745729.png" alt="Air Cooled Chiller" />
                        </div>
                    </div>
                    <button className={styles.viewBtn} onClick={() => router.push('/chiller/air-cooled-chillers')}>
                        View
                    </button>
                </div>
                <div className={styles.product}>
                    <div className={styles.productInfo}>
                        <div className={styles.productTitle}>
                            <h3>Water Cooled Chillers</h3>
                        </div>
                        <div className={styles.productImage}>
                            <img src="../images/products/569547.png" alt="Water Cooled Chiller" />
                        </div>
                    </div>
                    <button className={styles.viewBtn} onClick={() => router.push('/chiller/water-cooled-chillers')}>
                        View
                    </button>
                </div>
            </div>
            <div className={styles.bottomLogo}>
                <img src="./logo/logo.png" alt="OffiTec Logo" />
            </div>
        </div>
    );
}