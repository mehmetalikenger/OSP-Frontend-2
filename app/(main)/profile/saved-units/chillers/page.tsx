"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
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
}

interface UnitDetail extends UnitCard {
    description: string | null;
    iconUrls: string[];
    specs: TechSpecItem[];
}

export default function ChillersPage() {
    const router = useRouter();
    const { selectedType } = useContext(SavedUnitsContext);
    const [units, setUnits] = useState<UnitCard[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<UnitDetail | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useScrollLock(isDetailsOpen);

    const unitTypeParam = selectedType === "Air Cooled" ? "AW" : "WW";
    const calcRoute = selectedType === "Air Cooled" ? "/calculation/air-cooled-chiller" : "/calculation/water-cooled-chiller";

    useEffect(() => {
        fetchWithAuth(`${API}/units/saved?category=CHILLER&type=${unitTypeParam}`, { credentials: "include" })
            .then(r => r.ok ? r.json() : [])
            .then((data: UnitCard[]) => setUnits(data))
            .catch(() => {});
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

    const renderCard = (unit: UnitCard, isMobile: boolean) => (
        <div className={styles.product} key={`${isMobile ? "m" : "d"}-${unit.id}`}>
            <div className={styles.removeBtnContainer}>
                <div className={styles.closeBtn} onClick={() => handleRemove(unit.id)}>
                    <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Remove" />
                    <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Remove" />
                </div>
            </div>
            <div className={styles.productContent}>
                <div className={styles.productDetails}>
                    <div className={styles.productInfo}>
                        <div className={styles.productTitle}>
                            <h2>{unit.name || unit.model}</h2>
                            {unit.name && <p className={styles.modelName}>{unit.model}</p>}
                        </div>
                        {isMobile && (
                            <div className={styles.productImage}>
                                <img src={unit.primaryImageUrl || "/icons/profilePic.png"} alt="Chiller" />
                            </div>
                        )}
                        <div className={styles.productSpecs}>
                            {unit.capacityRange && (
                                <div className={styles.spec}>
                                    <div className={styles.specTitle}><h4>Capacity:</h4></div>
                                    <div className={styles.specValue}><p>{unit.capacityRange}</p></div>
                                </div>
                            )}
                            {unit.refrigerant && (
                                <div className={styles.spec}>
                                    <div className={styles.specTitle}><h4>Refrigerant:</h4></div>
                                    <div className={styles.specValue}><p>{unit.refrigerant}</p></div>
                                </div>
                            )}
                        </div>
                    </div>
                    {!isMobile && (
                        <div className={styles.productImage}>
                            <img src={unit.primaryImageUrl || "/icons/profilePic.png"} alt="Chiller" />
                        </div>
                    )}
                </div>
                <button className={styles.viewBtn} onClick={() => handleView(unit.id)}>View</button>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles.container} style={{ minHeight: "auto", paddingBottom: "50px" }}>
                <div className={`${styles.products} ${styles.productsMobile}`}>
                    {units.map(u => renderCard(u, true))}
                    {units.length === 0 && <p style={{ padding: "20px", color: "#888" }}>No saved chillers.</p>}
                </div>
                <div className={`${styles.products} ${styles.productsDesktop}`}>
                    {units.map(u => renderCard(u, false))}
                    {units.length === 0 && <p style={{ padding: "20px", color: "#888" }}>No saved chillers.</p>}
                </div>
            </div>

            {isDetailsOpen && selectedUnit && (
                <div className={styles.modalOverlay} onClick={handleClose} />
            )}
            {isDetailsOpen && selectedUnit && (
                <>
                    <div className={`${styles.unitDetails} ${styles.unitDetailsMobile}`}>
                        <div className={styles.closeBtn} onClick={handleClose}>
                            <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Close" />
                            <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close" />
                        </div>
                        <div className={styles.unitDetailContainer}>
                            <div className={styles.unitName}>
                                <h2>{selectedUnit.name || selectedUnit.model}</h2>
                                {selectedUnit.name && <p className={styles.modelName}>{selectedUnit.model}</p>}
                            </div>
                            <div className={styles.unitImage}>
                                <img src={selectedUnit.primaryImageUrl || "/icons/profilePic.png"} alt="Chiller" />
                            </div>
                            {selectedUnit.description && <div className={styles.unitDesc}><p>{selectedUnit.description}</p></div>}
                            <div className={styles.btnIcons}>
                                <div className={styles.icons}>
                                    {selectedUnit.iconUrls.map((url, i) => <img key={i} src={url} alt="icon" />)}
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.calcBtn} onClick={() => router.push(`${calcRoute}?id=${selectedUnit.id}`)}>Calculate</button>
                                </div>
                            </div>
                            {selectedUnit.specs.length > 0 && (
                                <div className={styles.unitSpecs}>
                                    <h3>Technical Specifications</h3>
                                    <ul>
                                        {selectedUnit.specs.map(s => (
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
                    <div className={`${styles.unitDetails} ${styles.unitDetailsDesktop}`}>
                        <div className={styles.closeBtn} onClick={handleClose}>
                            <img src="/icons/closeBtn.png" className={styles.closeBtnLight} alt="Close" />
                            <img src="/icons/closeBtn-second.png" className={styles.closeBtnDark} alt="Close" />
                        </div>
                        <div className={styles.unitDetailContainer}>
                            <div className={styles.unitName}>
                                <h2>{selectedUnit.name || selectedUnit.model}</h2>
                                {selectedUnit.name && <p className={styles.modelName}>{selectedUnit.model}</p>}
                            </div>
                            <div className={styles.unitInfo}>
                                {selectedUnit.description && <div className={styles.unitDesc}><p>{selectedUnit.description}</p></div>}
                                <div className={styles.unitImage}>
                                    <img src={selectedUnit.primaryImageUrl || "/icons/profilePic.png"} alt="Chiller" />
                                </div>
                            </div>
                            <div className={styles.btnIcons}>
                                <div className={styles.icons}>
                                    {selectedUnit.iconUrls.map((url, i) => <img key={i} src={url} alt="icon" />)}
                                </div>
                                <div className={styles.modalActions}>
                                    <button className={styles.calcBtn} onClick={() => router.push(`${calcRoute}?id=${selectedUnit.id}`)}>Calculate</button>
                                </div>
                            </div>
                            {selectedUnit.specs.length > 0 && (
                                <div className={styles.unitSpecs}>
                                    <h3>Technical Specifications</h3>
                                    <ul>
                                        {selectedUnit.specs.map(s => (
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
            )}
        </>
    );
}
