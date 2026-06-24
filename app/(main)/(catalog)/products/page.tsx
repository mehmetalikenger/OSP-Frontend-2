"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import CategoryPage from '../CategoryPage';
import toastStyles from "../../(dashboard)/admin-panel/toast.module.css";

// Single consolidated products page. The chiller/heat-pump and air/water selection
// all happens inside CategoryPage; this route just hosts it (and the post-reactivation
// toast carried over from the old catalog landing).
export default function ProductsPage() {
    const t = useTranslations('Catalog');
    const [showToast, setShowToast] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('reactivated') === 'true') {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            router.replace('/products');
        }
    }, [router]);

    return (
        <>
            {showToast && (
                <div className={toastStyles.toast}>
                    {t('accountReactivated')}
                </div>
            )}
            <CategoryPage />
        </>
    );
}
