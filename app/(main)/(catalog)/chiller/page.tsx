"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import styles from "../catalog.module.css";
import toastStyles from "../../(dashboard)/admin-panel/toast.module.css";

export default function ChillerPage() {
    const t = useTranslations('Catalog');
    const [activeCategory, setActiveCategory] = useState<'chillers' | 'heatPumps'>('chillers');
    const [showToast, setShowToast] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('reactivated') === 'true') {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            
            // Clean up the URL
            router.replace('/chiller');
        }
    }, [router]);

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
            {showToast && (
                <div className={toastStyles.toast}>
                    {t('accountReactivated')}
                </div>
            )}
            <h1 className={styles.header}>{t('products')}</h1>
            <div className={styles.categories}>
                <div
                    className={`${styles.categoryBtn} ${activeCategory === 'chillers' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('chillers')}
                    style={{ cursor: 'pointer' }}
                >
                    <h2>{t('chillers')}</h2>
                </div>
                <div
                    className={`${styles.categoryBtn} ${activeCategory === 'heatPumps' ? styles.active : ''}`}
                    onClick={() => handleCategoryClick('heatPumps')}
                    style={{ cursor: 'pointer' }}
                >
                    <h2>{t('heatPumps')}</h2>
                </div>
            </div>
            <div className={styles.products}>
                <div className={styles.product}>
                    <div className={styles.productInfo}>
                        <div className={styles.productTitle}>
                            <h3>{t('airCooledChillers')}</h3>
                        </div>
                        <div className={styles.productImage}>
                            <img src="/images/products/745729.png" alt="Air Cooled Chiller" />
                        </div>
                    </div>
                    <button className={styles.viewBtn} onClick={() => router.push('/chiller/air-cooled-chillers')}>
                        {t('view')}
                    </button>
                </div>
                <div className={styles.product}>
                    <div className={styles.productInfo}>
                        <div className={styles.productTitle}>
                            <h3>{t('waterCooledChillers')}</h3>
                        </div>
                        <div className={styles.productImage}>
                            <img src="/images/products/569547.png" alt="Water Cooled Chiller" />
                        </div>
                    </div>
                    <button className={styles.viewBtn} onClick={() => router.push('/chiller/water-cooled-chillers')}>
                        {t('view')}
                    </button>
                </div>
            </div>
            <div className={styles.bottomLogo}>
                <img src="./logo/logo.png" alt="OffiTec Logo" />
            </div>
        </div>
    );
}