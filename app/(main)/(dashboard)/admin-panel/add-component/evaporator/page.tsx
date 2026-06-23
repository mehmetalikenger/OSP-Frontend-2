"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useTranslations } from "next-intl";

type Evaporator = {
    id: number;
    model: string;
}

// Evaporator type options -> backend EvaporatorType enum names.
const EVAPORATOR_TYPES: Record<string, string> = {
    "Plate": "PLATE",
    "Coil": "COIL",
    "Shell & Tube": "SHELL_AND_TUBE",
};

export default function AddEvaporatorPage() {
    const t = useTranslations("AdminComp");
    const [model, setModel] = useState("");
    const [type, setType] = useState("Plate");

    // Specs states
    const [evaporator, setEvaporator] = useState("Select Evaporator");
    const [capacity, setCapacity] = useState("");

    const [evaporatorsList, setEvaporatorsList] = useState<Evaporator[]>([]);
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchEvaporators = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/evaporators`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setEvaporatorsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch evaporators", e);
        }
    };

    useEffect(() => {
        fetchEvaporators();
    }, []);

    const handleAddEvaporator = async () => {
        if (!model) {
            showToast(t("pleaseEnterModel"), "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addEvaporator`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model, type: EVAPORATOR_TYPES[type] }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("addedSuccess", { name: t("names.evaporator.cap") }), "success");
                setModel("");
                fetchEvaporators(); // Refresh the list
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedAdd", { name: t("names.evaporator.low") }), "error");
                } catch {
                    showToast(t("failedAdd", { name: t("names.evaporator.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleAddEvaporatorSpecs = async () => {
        if (evaporator === "Select Evaporator") {
            showToast(t("pleaseSelect", { name: t("names.evaporator.low") }), "error");
            return;
        }
        if (!capacity) {
            showToast(t("pleaseEnterCapacity"), "error");
            return;
        }

        const selectedEvap = evaporatorsList.find(e => e.model === evaporator);
        if (!selectedEvap) {
            showToast(t("invalidSelected", { name: t("names.evaporator.low") }), "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addEvaporatorSpecs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ evaporatorId: selectedEvap.id, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsAddedSuccess", { name: t("names.evaporator.cap") }), "success");
                setEvaporator("Select Evaporator");
                setCapacity("");
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedAddSpecs", { name: t("names.evaporator.low") }), "error");
                } catch {
                    showToast(t("failedAddSpecs", { name: t("names.evaporator.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const evaporatorOptions = ["Select Evaporator", ...evaporatorsList.map(e => e.model)];

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
                        {t("names.evaporator.cap")}
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
                                            options={Object.keys(EVAPORATOR_TYPES)}
                                            value={type}
                                            onChange={setType}
                                            className={styles.comboBox}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddEvaporator}>{t("add")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.evaporator.cap")}</label>
                                        <Combobox
                                            options={evaporatorOptions}
                                            value={evaporator}
                                            onChange={setEvaporator}
                                            getLabel={(v) => v === "Select Evaporator" ? t("selectName", { name: t("names.evaporator.cap") }) : v}
                                            className={`${styles.comboBox} ${evaporator.startsWith('Select') ? styles.placeholderText : ''}`}
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
                                <button className={styles.saveBtn} onClick={handleAddEvaporatorSpecs}>{t("add")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
