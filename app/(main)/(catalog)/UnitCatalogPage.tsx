"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { useScrollLock } from "@/hooks/useScrollLock";
import BookmarkToggle from "@/components/BookmarkToggle";
import styles from "./category.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

interface TechSpecItem { label: string; value: string; }

export interface UnitCard {
    id: number;
    name: string | null;
    model: string;
    primaryImageUrl: string | null;
    capacityRange: string | null;
    refrigerant: string | null;
    unitType: string;
    category: string;
    saved: boolean;
}

interface UnitDetail extends UnitCard {
    description: string | null;
    iconUrls: string[];
    specs: TechSpecItem[];
}

interface Props {
    title: string;
    apiPath: string;                 // backend path, e.g. "/units/chillers?type=AW"
    calcRoute: string;
    altText: string;
    initialUnits?: UnitCard[] | null; // provided by the server render (SSR)
}

export default function UnitCatalogPage({ title, apiPath, calcRoute, altText, initialUnits }: Props) {
    // Seeded from the server render so the cards are in the initial HTML.
    const [units, setUnits] = useState<UnitCard[]>(initialUnits ?? []);
    const [selectedUnit, setSelectedUnit] = useState<UnitDetail | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const router = useRouter();

    useScrollLock(isDetailsOpen);

    useEffect(() => {
        // Fallback: only fetch on the client if the server didn't provide the list.
        if (initialUnits) return;
        fetchWithAuth(`${API}${apiPath}`, { credentials: "include" })
            .then(r => r.ok ? r.json() : [])
            .then((data: UnitCard[]) => setUnits(data))
            .catch(() => {});
    }, [apiPath, initialUnits]);

    const handleView = async (id: number) => {
        try {
            const res = await fetchWithAuth(`${API}/units/${id}`, { credentials: "include" });
            if (res.ok) {
                const data: UnitDetail = await res.json();
                setSelectedUnit(data);
                setIsDetailsOpen(true);
            }
        } catch { /* no-op */ }
    };

    const handleClose = () => {
        setIsDetailsOpen(false);
        setSelectedUnit(null);
    };

    const handleBookmarkChange = (id: number, nowSaved: boolean) => {
        setUnits(prev => prev.map(u => u.id === id ? { ...u, saved: nowSaved } : u));
        if (selectedUnit?.id === id) setSelectedUnit(prev => prev ? { ...prev, saved: nowSaved } : prev);
    };

    const cardSpecs = (unit: UnitCard) => {
        const items: { label: string; value: string }[] = [];
        if (unit.capacityRange) items.push({ label: "Capacity", value: unit.capacityRange });
        if (unit.refrigerant) items.push({ label: "Refrigerant", value: unit.refrigerant });
        return items;
    };

    const renderCard = (unit: UnitCard, isMobile: boolean) => (
        <div className={styles.product} key={`${isMobile ? "m" : "d"}-${unit.id}`}>
            <div className={styles.productDetails}>
                <div className={styles.productInfo}>
                    <div className={styles.productTitle}>
                        <h2>{unit.name || unit.model}</h2>
                    </div>
                    {isMobile && (
                        <div className={styles.productImage}>
                            <img src={unit.primaryImageUrl || "/icons/profilePic.png"} alt={altText} loading="lazy" />
                        </div>
                    )}
                    <div className={styles.productSpecs}>
                        {cardSpecs(unit).map(s => (
                            <div className={styles.spec} key={s.label}>
                                <div className={styles.specTitle}><h4>{s.label}:</h4></div>
                                <div className={styles.specValue}><p>{s.value}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
                {!isMobile && (
                    <div className={styles.productImage}>
                        <img src={unit.primaryImageUrl || "/icons/profilePic.png"} alt={altText} loading="lazy" />
                    </div>
                )}
            </div>
            <div className={styles.productBottom}>
                <button className={styles.viewBtn} onClick={() => handleView(unit.id)}>View</button>
                <BookmarkToggle unitId={unit.id} initialSaved={unit.saved} onSavedChange={(s) => handleBookmarkChange(unit.id, s)} />
            </div>
        </div>
    );

    const renderModal = (d: UnitDetail) => (
        <>
            {/* Mobile modal */}
            <div className={`${styles.unitDetails} ${styles.unitDetailsMobile}`}>
                <div className={styles.closeBtn} onClick={handleClose}>
                    <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Close" />
                    <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close" />
                </div>
                <div className={styles.unitDetailContainer}>
                    <div className={styles.unitName}><h2>{d.name || d.model}</h2></div>
                    <div className={styles.unitImage}>
                        <img src={d.primaryImageUrl || "/icons/profilePic.png"} alt={altText} />
                    </div>
                    {d.description && (
                        <div className={styles.unitDesc}><p>{d.description}</p></div>
                    )}
                    <div className={styles.btnIcons}>
                        <div className={styles.icons}>
                            {d.iconUrls.length > 0 ? d.iconUrls.map((url, i) => (
                                <img key={i} src={url} alt="Unit icon" />
                            )) : null}
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.calcBtn} onClick={() => router.push(`${calcRoute}?id=${d.id}`)}>Calculate</button>
                            <BookmarkToggle unitId={d.id} initialSaved={d.saved} onSavedChange={(s) => handleBookmarkChange(d.id, s)} />
                        </div>
                    </div>
                    {d.specs.length > 0 && (
                        <div className={styles.unitSpecs}>
                            <h3>Technical Specifications</h3>
                            <ul>
                                {d.specs.map(s => (
                                    <li key={s.label}>
                                        <span className={styles.specTitle}>{s.label}:</span>
                                        <span className={styles.specValue}>{s.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            {/* Desktop modal */}
            <div className={`${styles.unitDetails} ${styles.unitDetailsDesktop}`}>
                <div className={styles.closeBtn} onClick={handleClose}>
                    <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Close" />
                    <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close" />
                </div>
                <div className={styles.unitDetailContainer}>
                    <div className={styles.unitName}><h2>{d.name || d.model}</h2></div>
                    <div className={styles.unitInfo}>
                        {d.description && (
                            <div className={styles.unitDesc}><p>{d.description}</p></div>
                        )}
                        <div className={styles.unitImage}>
                            <img src={d.primaryImageUrl || "/icons/profilePic.png"} alt={altText} />
                        </div>
                    </div>
                    <div className={styles.btnIcons}>
                        <div className={styles.icons}>
                            {d.iconUrls.length > 0 ? d.iconUrls.map((url, i) => (
                                <img key={i} src={url} alt="Unit icon" />
                            )) : null}
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.calcBtn} onClick={() => router.push(`${calcRoute}?id=${d.id}`)}>Calculate</button>
                            <BookmarkToggle unitId={d.id} initialSaved={d.saved} onSavedChange={(s) => handleBookmarkChange(d.id, s)} />
                        </div>
                    </div>
                    {d.specs.length > 0 && (
                        <div className={styles.unitSpecs}>
                            <h3>Technical Specifications</h3>
                            <ul>
                                {d.specs.map(s => (
                                    <li key={s.label}>
                                        <span className={styles.specTitle}>{s.label}:</span>
                                        <span className={styles.specValue}>{s.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <>
            <div className={styles.container}>
                <div className={styles.category}>
                    <h1>{title}</h1>
                </div>
                <div className={`${styles.products} ${styles.productsMobile}`}>
                    {units.map(u => renderCard(u, true))}
                </div>
                <div className={`${styles.products} ${styles.productsDesktop}`}>
                    {units.map(u => renderCard(u, false))}
                </div>
                <div className={styles.bottomLogo}>
                    <img src="/logo/logo.png" alt="OffiTec Logo" />
                </div>
            </div>
            {isDetailsOpen && selectedUnit && (
                <div className={styles.modalOverlay} onClick={handleClose} />
            )}
            {isDetailsOpen && selectedUnit && renderModal(selectedUnit)}
        </>
    );
}
