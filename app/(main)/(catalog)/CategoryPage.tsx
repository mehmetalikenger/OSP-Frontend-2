"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { fetchWithAuth } from "@/lib/api";
import { useScrollLock } from "@/hooks/useScrollLock";
import BookmarkToggle from "@/components/BookmarkToggle";
import AdminCombobox from "../(dashboard)/admin-panel/AdminCombobox";
import cardStyles from "./category.module.css";
import styles from "./categoryPage.module.css";

const API = process.env.NEXT_PUBLIC_API_URL;

type Category = "CHILLER" | "HEAT_PUMP";
type UnitType = "AW" | "WW";

interface TechSpecItem { label: string; value: string; }

interface UnitCard {
    id: number;
    name: string | null;
    model: string;
    primaryImageUrl: string | null;
    capacityRange: string | null;
    refrigerant: string | null;
    unitType: string;
    category: string;
    saved: boolean;
    iconUrls: string[];
}

interface UnitDetail extends UnitCard {
    description: string | null;
    specs: TechSpecItem[];
}

const PAGE_SIZE = 24;
const ALL = "ALL"; // refrigerant filter sentinel

// Map category + air/water type to the listing endpoint and the matching
// per-unit calculation route (kept intact for the unit detail modal).
const calcRouteFor = (category: Category, type: UnitType): string => {
    if (category === "CHILLER") return type === "AW" ? "/calculation/air-cooled-chiller" : "/calculation/water-cooled-chiller";
    return type === "AW" ? "/calculation/air-to-water-heat-pump" : "/calculation/water-to-water-heat-pump";
};

function normalizePage(data: unknown): { content: UnitCard[]; page: number; hasNext: boolean; total: number } {
    if (Array.isArray(data)) return { content: data as UnitCard[], page: 0, hasNext: false, total: data.length };
    const d = (data ?? {}) as { content?: UnitCard[]; page?: number; hasNext?: boolean; totalElements?: number };
    const content = d.content ?? [];
    return { content, page: d.page ?? 0, hasNext: !!d.hasNext, total: d.totalElements ?? content.length };
}

export default function CategoryPage() {
    const t = useTranslations("Catalog");
    const router = useRouter();

    // ---- Selection state ----
    const [category, setCategory] = useState<Category>("CHILLER");
    const [unitType, setUnitType] = useState<UnitType>("AW");
    const [refrigerant, setRefrigerant] = useState<string>(ALL);

    // ---- Listing state ----
    const [units, setUnits] = useState<UnitCard[]>([]);
    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [total, setTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    // ---- Detail modal ----
    const [selectedUnit, setSelectedUnit] = useState<UnitDetail | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    // On mobile the filters open in a full-screen modal.
    const [filtersOpen, setFiltersOpen] = useState(false);
    useScrollLock(isDetailsOpen || filtersOpen);

    // "Go to top" button appears once the page is scrolled down a bit.
    const [showTop, setShowTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 300);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Category cards stay outside the filters; on mobile they're a slidable carousel.
    const topRowRef = useRef<HTMLDivElement>(null);
    const [centeredIndex, setCenteredIndex] = useState(0);
    const centerCard = (index: number) => {
        const row = topRowRef.current;
        if (!row) return;
        const cards = Array.from(row.children) as HTMLElement[];
        const clamped = Math.max(0, Math.min(index, cards.length - 1));
        cards[clamped]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        setCenteredIndex(clamped);
    };
    const scrollCategories = (dir: -1 | 1) => centerCard(centeredIndex + dir);

    // ---- Calculation form ----
    const [ambient, setAmbient] = useState("");
    const [waterInlet, setWaterInlet] = useState("");
    const [waterOutlet, setWaterOutlet] = useState("");
    const [targetCapacity, setTargetCapacity] = useState("");
    const [capacityDiff, setCapacityDiff] = useState(10);
    // Capacity-match results: null = showing the normal listing, array = showing matches.
    const [matchResults, setMatchResults] = useState<UnitCard[] | null>(null);
    const [matching, setMatching] = useState(false);
    const [calcError, setCalcError] = useState<string | null>(null);

    const calcRoute = calcRouteFor(category, unitType);
    const basePath = category === "CHILLER" ? "/units/chillers" : "/units/heat-pumps";
    const pagedUrl = (p: number) => `${API}${basePath}?type=${unitType}&page=${p}&size=${PAGE_SIZE}`;

    const fetchPage = (p: number, replace: boolean) => {
        setLoadingMore(true);
        fetchWithAuth(pagedUrl(p), { credentials: "include" })
            .then(r => (r.ok ? r.json() : null))
            .then((data: unknown) => {
                if (!data) return;
                const { content, page: pageNum, hasNext: more, total: tot } = normalizePage(data);
                setUnits(prev => (replace ? content : [...prev, ...content]));
                setPage(pageNum);
                setHasNext(more);
                setTotal(tot);
            })
            .catch(() => {})
            .finally(() => setLoadingMore(false));
    };

    // Reload the first page whenever the category or air/water type changes, and
    // reset the refrigerant filter (its options come from the new result set).
    useEffect(() => {
        setRefrigerant(ALL);
        setMatchResults(null);
        setCalcError(null);
        fetchPage(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, unitType]);

    // Refrigerant options are derived from the loaded units (the backend doesn't
    // filter by refrigerant yet), plus the "All" sentinel.
    const refrigerantOptions = useMemo(() => {
        const set = new Set<string>();
        units.forEach(u => { if (u.refrigerant) set.add(u.refrigerant); });
        return [ALL, ...Array.from(set).sort()];
    }, [units]);

    const visibleUnits = useMemo(
        () => (refrigerant === ALL ? units : units.filter(u => u.refrigerant === refrigerant)),
        [units, refrigerant],
    );

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

    // Compute matching units: post the conditions + target capacity + tolerance and
    // replace the listing with the units whose computed capacity is within the band.
    const handleCalculate = async () => {
        const target = parseFloat(targetCapacity);
        if (isNaN(target) || target <= 0) {
            setCalcError(t("errEnterCapacity"));
            return;
        }
        setCalcError(null);
        setMatching(true);
        try {
            const res = await fetchWithAuth(`${API}/units/match`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    category,
                    type: unitType,
                    refrigerant: refrigerant === ALL ? null : refrigerant,
                    ambient: parseFloat(ambient) || 0,
                    evapIn: parseFloat(waterInlet) || 0,
                    evapOut: parseFloat(waterOutlet) || 0,
                    targetCapacity: target,
                    diffPercent: capacityDiff,
                }),
            });
            if (!res.ok) throw new Error();
            const data: UnitCard[] = await res.json();
            setMatchResults(data);
            setFiltersOpen(false); // reveal the results on mobile
        } catch {
            setCalcError(t("calcFailed"));
        } finally {
            setMatching(false);
        }
    };

    const clearMatches = () => {
        setMatchResults(null);
        setCalcError(null);
        setTargetCapacity("");
    };

    const refrigerantLabel = (v: string) => (v === ALL ? t("allRefrigerants") : v);

    const cardSpecs = (unit: UnitCard) => {
        const items: { label: string; value: string }[] = [];
        if (unit.capacityRange) items.push({ label: t("capacity"), value: unit.capacityRange });
        if (unit.refrigerant) items.push({ label: t("refrigerant"), value: unit.refrigerant });
        return items;
    };

    const altText = category === "CHILLER" ? t("chillers") : t("heatPumps");

    const renderCard = (unit: UnitCard) => (
        <div className={cardStyles.product} key={unit.id}>
            <div className={cardStyles.productDetails}>
                <div className={cardStyles.productInfo}>
                    <div className={cardStyles.productTitle}>
                        <h2>{unit.name || unit.model}</h2>
                        {unit.name && <p className={cardStyles.modelName}>{unit.model}</p>}
                    </div>
                    <div className={cardStyles.productImage}>
                        <img src={unit.primaryImageUrl || "/icons/profilePic.png"} alt={altText} loading="lazy" />
                    </div>
                    <div className={cardStyles.productSpecs}>
                        {cardSpecs(unit).map((s, i) => (
                            <div className={cardStyles.spec} key={`${s.label}-${i}`}>
                                <div className={cardStyles.specTitle}><h4>{s.label}:</h4></div>
                                <div className={cardStyles.specValue}><p>{s.value}</p></div>
                            </div>
                        ))}
                    </div>
                    {unit.iconUrls && unit.iconUrls.length > 0 && (
                        <div className={cardStyles.cardIcons}>
                            {unit.iconUrls.map((url, i) => (
                                <img key={i} src={url} alt="Unit feature icon" loading="lazy" />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className={cardStyles.productBottom}>
                <button className={cardStyles.viewBtn} onClick={() => handleView(unit.id)}>{t("view")}</button>
                <BookmarkToggle unitId={unit.id} initialSaved={unit.saved} onSavedChange={(s) => handleBookmarkChange(unit.id, s)} />
            </div>
        </div>
    );

    const renderModalBody = (d: UnitDetail) => (
        <div className={cardStyles.unitDetailContainer}>
            <div className={cardStyles.unitName}>
                <h2>{d.name || d.model}</h2>
                {d.name && <p className={cardStyles.modelName}>{d.model}</p>}
            </div>
            <div className={cardStyles.unitInfo}>
                {d.description && (
                    <div className={cardStyles.unitDesc}><p>{d.description}</p></div>
                )}
                <div className={cardStyles.unitImage}>
                    <img src={d.primaryImageUrl || "/icons/profilePic.png"} alt={altText} />
                </div>
            </div>
            <div className={cardStyles.btnIcons}>
                <div className={cardStyles.icons}>
                    {d.iconUrls.length > 0 ? d.iconUrls.map((url, i) => (
                        <img key={i} src={url} alt="Unit icon" />
                    )) : null}
                </div>
                <div className={cardStyles.modalActions}>
                    <button className={cardStyles.calcBtn} onClick={() => router.push(`${calcRoute}?id=${d.id}`)}>{t("calculate")}</button>
                    <BookmarkToggle unitId={d.id} initialSaved={d.saved} onSavedChange={(s) => handleBookmarkChange(d.id, s)} />
                </div>
            </div>
            {d.specs.length > 0 && (
                <div className={cardStyles.unitSpecs}>
                    <h3>{t("technicalSpecs")}</h3>
                    <ul>
                        {d.specs.map((s, i) => (
                            <li key={`${s.label}-${i}`}>
                                <span className={cardStyles.specTitle}>{s.label}:</span>
                                <span className={cardStyles.specValue}>{s.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    // Category selector — reused inline (desktop) and inside the mobile modal.
    const renderCategoryButtons = () => (
        <>
            <button
                className={`${styles.categoryBtn} ${category !== "CHILLER" ? styles.categoryBtnDisabled : ""}`}
                onClick={() => { setCategory("CHILLER"); centerCard(0); }}
            >
                <span className={styles.categoryLabel}>{t("chiller")}</span>
                <img src="/images/products/chiller.webp" alt="" className={`${styles.categoryImg} ${styles.categoryImgChiller}`} />
            </button>
            <button
                className={`${styles.categoryBtn} ${styles.categoryBtnHeat} ${category !== "HEAT_PUMP" ? styles.categoryBtnDisabled : ""}`}
                onClick={() => { setCategory("HEAT_PUMP"); centerCard(1); }}
            >
                <span className={styles.categoryLabel}>
                    {t("heatPump").split(" ").map((word, i) => (
                        <span key={i} className={styles.labelLine}>{word}</span>
                    ))}
                </span>
                <img src="/images/products/heat-pump.webp" alt="" className={styles.categoryImg} />
            </button>
        </>
    );

    // Air/water toggle + refrigerant filter + calculation form. `p` namespaces the input
    // ids so the desktop and modal copies don't collide.
    const renderFilterControls = (p: string) => (
        <>
            <div className={styles.typeToggle}>
                <button
                    className={`${styles.typeBtn} ${unitType === "AW" ? styles.typeBtnActive : ""}`}
                    onClick={() => setUnitType("AW")}
                >
                    {t("airToWater")}
                    {unitType === "AW" ? (
                        <>
                            <img src="/icons/air-enabled.png" alt="" className={`${styles.typeBtnIcon} ${styles.lightIcon}`} />
                            <img src="/icons/air-enabled-darkMode.png" alt="" className={`${styles.typeBtnIcon} ${styles.darkIcon}`} />
                        </>
                    ) : (
                        <img src="/icons/air-disabled.png" alt="" className={styles.typeBtnIcon} />
                    )}
                </button>
                <button
                    className={`${styles.typeBtn} ${unitType === "WW" ? styles.typeBtnActive : ""}`}
                    onClick={() => setUnitType("WW")}
                >
                    {t("waterToWater")}
                    {unitType === "WW" ? (
                        <>
                            <img src="/icons/water-enabled.png" alt="" className={`${styles.typeBtnIcon} ${styles.lightIcon}`} />
                            <img src="/icons/water-enabled-darkMode.png" alt="" className={`${styles.typeBtnIcon} ${styles.darkIcon}`} />
                        </>
                    ) : (
                        <img src="/icons/water-disabled.png" alt="" className={styles.typeBtnIcon} />
                    )}
                </button>
            </div>

            <div className={styles.filterField}>
                <label className={styles.filterLabel}>{t("refrigerant")}</label>
                <AdminCombobox
                    value={refrigerant}
                    options={refrigerantOptions}
                    getLabel={refrigerantLabel}
                    onChange={(v) => { setRefrigerant(v); clearMatches(); }}
                />
            </div>

            <div className={styles.form}>
                <h2 className={styles.formTitle}>{t("calculation")}</h2>
                <div className={styles.field}>
                    <label htmlFor={`${p}-ambientTemp`}>{t("ambientTemp")}</label>
                    <input
                        type="number" onWheel={(e) => e.currentTarget.blur()}
                        id={`${p}-ambientTemp`}
                        value={ambient}
                        onChange={(e) => setAmbient(e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor={`${p}-waterInlet`}>{t("waterInlet")}</label>
                    <input
                        type="number" onWheel={(e) => e.currentTarget.blur()}
                        id={`${p}-waterInlet`}
                        value={waterInlet}
                        onChange={(e) => setWaterInlet(e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor={`${p}-waterOutlet`}>{t("waterOutlet")}</label>
                    <input
                        type="number" onWheel={(e) => e.currentTarget.blur()}
                        id={`${p}-waterOutlet`}
                        value={waterOutlet}
                        onChange={(e) => setWaterOutlet(e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor={`${p}-targetCapacity`}>{t("requiredCapacity")}</label>
                    <input
                        type="number" onWheel={(e) => e.currentTarget.blur()}
                        id={`${p}-targetCapacity`}
                        min="0"
                        value={targetCapacity}
                        onChange={(e) => setTargetCapacity(e.target.value)}
                    />
                </div>
                <div className={styles.sliderField}>
                    <div className={styles.sliderHeader}>
                        <span>{t("capacityDifference")}</span>
                        <span className={styles.sliderValue}>{capacityDiff}%</span>
                    </div>
                    <input
                        type="range"
                        className={styles.slider}
                        min={0}
                        max={50}
                        step={1}
                        value={capacityDiff}
                        onChange={(e) => setCapacityDiff(Number(e.target.value))}
                    />
                </div>
                {calcError && <p className={styles.calcError}>{calcError}</p>}
                <button className={styles.calcBtn} onClick={handleCalculate} disabled={matching}>
                    {matching ? t("loading") : t("applyCalculation")}
                </button>
            </div>
        </>
    );

    return (
        <>
            <div className={styles.container}>
                {/* Category cards (kept outside the filters). Slidable carousel on mobile. */}
                <div className={styles.topRow} ref={topRowRef}>
                    {renderCategoryButtons()}
                </div>

                {/* Arrows to slide the category carousel (mobile only). */}
                <div className={styles.slideButtons}>
                    <button className={styles.slideBtn} onClick={() => scrollCategories(-1)} aria-label="Scroll left">
                        <img src="/icons/back.png" className={styles.lightIcon} alt="" />
                        <img src="/icons/back-darkMode.png" className={styles.darkIcon} alt="" />
                    </button>
                    <button className={`${styles.slideBtn} ${styles.slideBtnRight}`} onClick={() => scrollCategories(1)} aria-label="Scroll right">
                        <img src="/icons/back.png" className={styles.lightIcon} alt="" />
                        <img src="/icons/back-darkMode.png" className={styles.darkIcon} alt="" />
                    </button>
                </div>

                {/* Sticky button that opens the filters modal (mobile only). */}
                <button
                    className={styles.filterToggle}
                    onClick={() => setFiltersOpen(true)}
                    aria-haspopup="dialog"
                >
                    {t("filters")}
                </button>

                <div className={styles.body}>
                    <div className={styles.bodyContent}>
                    {/* Controls — inline on desktop; on mobile they live in the modal. */}
                    <div className={`${styles.controls} ${styles.desktopOnly}`}>
                        {renderFilterControls("d")}
                    </div>

                    {/* Product list beside the calculation form. When a capacity match has
                        been run, the matched units replace the normal listing. */}
                    <div className={styles.productsColumn}>
                        <div className={styles.topDivider} />
                        <div className={styles.countRow}>
                            <span className={styles.countLabel}>
                                {matchResults !== null
                                    ? `${matchResults.length} ${t("matchingUnits")}`
                                    : `${total} ${t("units")}`}
                            </span>
                            {matchResults !== null && (
                                <button className={styles.showAllBtn} onClick={clearMatches}>{t("showAllUnits")}</button>
                            )}
                        </div>
                        {(matchResults ?? visibleUnits).length === 0 ? (
                            <p className={styles.empty}>{t("noProducts")}</p>
                        ) : (
                            <div className={styles.products}>
                                {(matchResults ?? visibleUnits).map(u => renderCard(u))}
                            </div>
                        )}
                        {matchResults === null && hasNext && refrigerant === ALL && (
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
                    </div>
                </div>

                <div className={styles.bottomLogo}>
                    <img src="/logo/logo.png" alt="OffiTec Logo" />
                </div>
            </div>

            {showTop && (
                <button
                    className={styles.goTopBtn}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    aria-label="Go to top"
                >
                    <img src="/icons/back-darkMode.png" alt="" />
                </button>
            )}

            {/* Mobile full-screen filters modal: all filters live here on small screens. */}
            {filtersOpen && (
                <div className={styles.filterModal} role="dialog" aria-modal="true">
                    <div className={styles.filterModalHeader}>
                        <h2>{t("filters")}</h2>
                        <button className={styles.filterModalClose} onClick={() => setFiltersOpen(false)} aria-label="Close">
                            <img src="/icons/closeBtn.png" className={styles.lightIcon} alt="" />
                            <img src="/icons/closeBtn-second.png" className={styles.darkIcon} alt="" />
                        </button>
                    </div>
                    <div className={styles.filterModalBody}>
                        {renderFilterControls("m")}
                    </div>
                </div>
            )}

            {isDetailsOpen && selectedUnit && (
                <div className={cardStyles.modalOverlay} onClick={handleClose} />
            )}
            {isDetailsOpen && selectedUnit && (
                <>
                    <div className={`${cardStyles.unitDetails} ${cardStyles.unitDetailsMobile}`}>
                        <div className={cardStyles.closeBtn} onClick={handleClose}>
                            <img src="/icons/closeBtn.png" className={cardStyles.closeBtnLight} alt="Close" />
                            <img src="/icons/closeBtn-second.png" className={cardStyles.closeBtnDark} alt="Close" />
                        </div>
                        {renderModalBody(selectedUnit)}
                    </div>
                    <div className={`${cardStyles.unitDetails} ${cardStyles.unitDetailsDesktop}`}>
                        <div className={cardStyles.closeBtn} onClick={handleClose}>
                            <img src="/icons/closeBtn.png" className={cardStyles.closeBtnLight} alt="Close" />
                            <img src="/icons/closeBtn-second.png" className={cardStyles.closeBtnDark} alt="Close" />
                        </div>
                        {renderModalBody(selectedUnit)}
                    </div>
                </>
            )}
        </>
    );
}
