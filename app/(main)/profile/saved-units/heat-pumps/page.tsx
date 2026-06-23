"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SavedUnitsContext } from "../layout";
import styles from "../savedUnits.module.css";
import { useScrollLock } from "@/hooks/useScrollLock";
import { fetchWithAuth } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

interface TechSpecItem { label: string; value: string; }

interface UnitCard {
    id: number;
    name: string | null;
    model: string;
    primaryImageUrl: string | null;
    capacityRange: string | null;
    refrigerant: string | null;
    unitType: string;
    saved: boolean;
    iconUrls: string[];
}

interface UnitDetail extends UnitCard {
    description: string | null;
    iconUrls: string[];
    specs: TechSpecItem[];
}

interface UnitPage {
    content: UnitCard[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
}

const PAGE_SIZE = 24; // matches the backend default page size

// Accept either the paginated envelope or a bare array (older/uncached backend).
function normalizePage(data: unknown): { content: UnitCard[]; page: number; hasNext: boolean } {
    if (Array.isArray(data)) return { content: data as UnitCard[], page: 0, hasNext: false };
    const d = (data ?? {}) as Partial<UnitPage>;
    return { content: d.content ?? [], page: d.page ?? 0, hasNext: !!d.hasNext };
}

export default function HeatPumpsPage() {
    const t = useTranslations("SavedUnits");
    const router = useRouter();
    const { selectedType } = useContext(SavedUnitsContext);
    const [units, setUnits] = useState<UnitCard[]>([]);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitDetail | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useScrollLock(isDetailsOpen);

    const unitTypeParam = selectedType === "Air to Water" ? "AW" : "WW";
    const calcRoute = selectedType === "Air to Water" ? "/calculation/air-to-water-heat-pump" : "/calculation/water-to-water-heat-pump";

    const pagedUrl = (p: number) =>
        `${API}/units/saved?category=HEAT_PUMP&type=${unitTypeParam}&page=${p}&size=${PAGE_SIZE}`;

    const fetchPage = (p: number, replace: boolean) => {
        setLoadingMore(true);
        fetchWithAuth(pagedUrl(p), { credentials: "include" })
            .then(r => (r.ok ? r.json() : null))
            .then((data: unknown) => {
                if (!data) return;
                const { content, page: pageNum, hasNext: more } = normalizePage(data);
                setUnits(prev => (replace ? content : [...prev, ...content]));
                setPage(pageNum);
                setHasNext(more);
            })
            .catch(() => {})
            .finally(() => setLoadingMore(false));
    };

    useEffect(() => {
        fetchPage(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unitTypeParam]);

    const handleRemove = async (id: number) => {
        try {
            await fetchWithAuth(`${API}/units/${id}/save`, { method: "POST", credentials: "include" });
            setUnits(prev => prev.filter(u => u.id !== id));
        } catch { /* no-op */ }
    };

    const handleView = async (id: number) => {
        try {
            const res = await fetchWithAuth(`${API}/units/${id}`, { credentials: "include" });
            if (res.ok) {
                setSelectedUnit(await res.json());
                setIsDetailsOpen(true);
            }
        } catch { /* no-op */ }
    };

    const handleClose = () => { setIsDetailsOpen(false); setSelectedUnit(null); };

    const renderCard = (unit: UnitCard) => (
        <div className={styles.product} key={unit.id}>
            <div className={styles.removeBtnContainer}>
                <div className={styles.closeBtn} onClick={() => handleRemove(unit.id)}>
                    <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt={"Remove"} />
                    <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt={"Remove"} />
                </div>
            </div>
            <div className={styles.productContent}>
                <div className={styles.productDetails}>
                    <div className={styles.productInfo}>
                        <div className={styles.productTitle}>
                            <h2>{unit.name || unit.model}</h2>
                            {unit.name && <p className={styles.modelName}>{unit.model}</p>}
                        </div>
                        <div className={styles.productImage}>
                            <img src={unit.primaryImageUrl || "/icons/profilePic.png"} alt={"Heat Pump"} />
                        </div>
                        <div className={styles.productSpecs}>
                            {unit.capacityRange && (
                                <div className={styles.spec}>
                                    <div className={styles.specTitle}><h4>{t("capacity")}</h4></div>
                                    <div className={styles.specValue}><p>{unit.capacityRange}</p></div>
                                </div>
                            )}
                            {unit.refrigerant && (
                                <div className={styles.spec}>
                                    <div className={styles.specTitle}><h4>{t("refrigerant")}</h4></div>
                                    <div className={styles.specValue}><p>{unit.refrigerant}</p></div>
                                </div>
                            )}
                        </div>
                        {unit.iconUrls && unit.iconUrls.length > 0 && (
                            <div className={styles.cardIcons}>
                                {unit.iconUrls.map((url, i) => (
                                    <img key={i} src={url} alt="Unit feature icon" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button className={styles.viewBtn} onClick={() => handleView(unit.id)}>{t("view")}</button>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles.container} style={{ minHeight: "auto", paddingBottom: "50px" }}>
                <div className={styles.products}>
                    {units.map(u => renderCard(u))}
                    {units.length === 0 && <p style={{ padding: "20px", color: "#888" }}>{t("noSavedHeatPumps")}</p>}
                </div>
                {hasNext && (
                    <div className={styles.loadMoreContainer}>
                        <button
                            className={styles.loadMoreBtn}
                            onClick={() => fetchPage(page + 1, false)}
                            disabled={loadingMore}
                        >
                            {loadingMore ? t("loading") : t("loadMore")}
                        </button>
                    </div>
                )}
            </div>

            {isDetailsOpen && selectedUnit && (
                <div className={styles.modalOverlay} onClick={handleClose} />
            )}
            {isDetailsOpen && selectedUnit && (
                <>
                    <div className={`${styles.unitDetails} ${styles.unitDetailsMobile}`}>
                        <div className={styles.closeBtn} onClick={handleClose}>
                            <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt={"Close"} />
                            <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt={"Close"} />
                        </div>
                        <div className={styles.unitDetailContainer}>
                            <div className={styles.unitName}>
                                <h2>{selectedUnit.name || selectedUnit.model}</h2>
                                {selectedUnit.name && <p className={styles.modelName}>{selectedUnit.model}</p>}
                            </div>
                            <div className={styles.unitImage}>
                                <img src={selectedUnit.primaryImageUrl || "/icons/profilePic.png"} alt={"Heat Pump"} />
                            </div>
                            {selectedUnit.description && <div className={styles.unitDesc}><p>{selectedUnit.description}</p></div>}
                            <div className={styles.btnIcons}>
                                <div className={styles.icons}>
                                    {selectedUnit.iconUrls.map((url, i) => <img key={i} src={url} alt={"icon"} />)}
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.calcBtn} onClick={() => router.push(`${calcRoute}?id=${selectedUnit.id}`)}>{t("calculate")}</button>
                                </div>
                            </div>
                            {selectedUnit.specs.length > 0 && (
                                <div className={styles.unitSpecs}>
                                    <h3>{t("technicalSpecs")}</h3>
                                    <ul>
                                        {selectedUnit.specs.map((s, i) => (
                                            <li key={`${s.label}-${i}`}>
                                                <span className={styles.specTitle}>{s.label}:</span>
                                                <span className={styles.specValue}>{s.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={`${styles.unitDetails} ${styles.unitDetailsDesktop}`}>
                        <div className={styles.closeBtn} onClick={handleClose}>
                            <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt={"Close"} />
                            <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt={"Close"} />
                        </div>
                        <div className={styles.unitDetailContainer}>
                            <div className={styles.unitName}>
                                <h2>{selectedUnit.name || selectedUnit.model}</h2>
                                {selectedUnit.name && <p className={styles.modelName}>{selectedUnit.model}</p>}
                            </div>
                            <div className={styles.unitInfo}>
                                {selectedUnit.description && <div className={styles.unitDesc}><p>{selectedUnit.description}</p></div>}
                                <div className={styles.unitImage}>
                                    <img src={selectedUnit.primaryImageUrl || "/icons/profilePic.png"} alt={"Heat Pump"} />
                                </div>
                            </div>
                            <div className={styles.btnIcons}>
                                <div className={styles.icons}>
                                    {selectedUnit.iconUrls.map((url, i) => <img key={i} src={url} alt={"icon"} />)}
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.calcBtn} onClick={() => router.push(`${calcRoute}?id=${selectedUnit.id}`)}>{t("calculate")}</button>
                                </div>
                            </div>
                            {selectedUnit.specs.length > 0 && (
                                <div className={styles.unitSpecs}>
                                    <h3>{t("technicalSpecs")}</h3>
                                    <ul>
                                        {selectedUnit.specs.map((s, i) => (
                                            <li key={`${s.label}-${i}`}>
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
            )}
        </>
    );
}
