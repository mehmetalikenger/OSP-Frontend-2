"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useTranslations } from "next-intl";

type Condenser = {
    id: number;
    model: string;
}

// Condenser type options -> backend CondenserType enum names.
const CONDENSER_TYPES: Record<string, string> = { "Microchannel": "MICROCHANNEL" };

export default function AddCondenserPage() {
    const t = useTranslations("AdminComp");
    const [model, setModel] = useState("");
    const [type, setType] = useState("Microchannel");

    // Specs states
    const [condenser, setCondenser] = useState("Select Condenser");
    const [capacity, setCapacity] = useState("");

    const [condensersList, setCondensersList] = useState<Condenser[]>([]);
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchCondensers = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/condensers`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCondensersList(data);
            }
        } catch (e) {
            console.error("Failed to fetch condensers", e);
        }
    };

    useEffect(() => {
        fetchCondensers();
    }, []);

    const handleAddCondenser = async () => {
        if (!model) {
            showToast(t("pleaseEnterModel"), "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addCondenser`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model, type: CONDENSER_TYPES[type] }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("addedSuccess", { name: t("names.condenser.cap") }), "success");
                setModel("");
                fetchCondensers(); // Refresh the list
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedAdd", { name: t("names.condenser.low") }), "error");
                } catch {
                    showToast(t("failedAdd", { name: t("names.condenser.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleAddCondenserSpecs = async () => {
        if (condenser === "Select Condenser") {
            showToast(t("pleaseSelect", { name: t("names.condenser.low") }), "error");
            return;
        }
        if (!capacity) {
            showToast(t("pleaseEnterCapacity"), "error");
            return;
        }

        const selectedCond = condensersList.find(c => c.model === condenser);
        if (!selectedCond) {
            showToast(t("invalidSelected", { name: t("names.condenser.low") }), "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addCondenserSpecs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ condenserId: selectedCond.id, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsAddedSuccess", { name: t("names.condenser.cap") }), "success");
                setCondenser("Select Condenser");
                setCapacity("");
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedAddSpecs", { name: t("names.condenser.low") }), "error");
                } catch {
                    showToast(t("failedAddSpecs", { name: t("names.condenser.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const condenserOptions = ["Select Condenser", ...condensersList.map(c => c.model)];

    return (
        <div className={styles.sectionsContainer} style={{ minHeight: 'fit-content', flex: 'none' }}>
            {toastInfo && (
                <div className={toastInfo.type === 'error' ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            <div className={styles.sectionContent} style={{ maxWidth: '1200px', flex: 'none' }}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                        {t("names.condenser.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("model")}</label>
                                        <input
                                            type="text"
                                            className={styles.inputElement}
                                            placeholder={t("enterModel")}
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("type")}</label>
                                        <Combobox
                                            options={Object.keys(CONDENSER_TYPES)}
                                            value={type}
                                            onChange={setType}
                                            className={styles.comboBox}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddCondenser}>{t("add")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.condenser.cap")}</label>
                                        <Combobox
                                            options={condenserOptions}
                                            value={condenser}
                                            onChange={setCondenser}
                                            getLabel={(v) => v === "Select Condenser" ? t("selectName", { name: t("names.condenser.cap") }) : v}
                                            className={`${styles.comboBox} ${condenser.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("capacity")}</label>
                                        <input
                                            type="number" onWheel={(e) => e.currentTarget.blur()}
                                            className={styles.inputElement}
                                            placeholder={t("enterCapacity")}
                                            value={capacity}
                                            onChange={(e) => setCapacity(e.target.value)}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddCondenserSpecs}>{t("add")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
