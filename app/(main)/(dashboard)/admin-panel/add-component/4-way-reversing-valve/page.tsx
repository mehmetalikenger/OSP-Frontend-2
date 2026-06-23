"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useTranslations } from "next-intl";

type FourWayReversingValve = {
    id: number;
    model: string;
}

export default function AddFourWayReversingValvePage() {
    const t = useTranslations("AdminComp");
    const [model, setModel] = useState("");

    // Specs states
    const [fourWayReversingValve, setFourWayReversingValve] = useState("Select 4-Way Reversing Valve");
    const [capacity, setCapacity] = useState("");

    const [valvesList, setValvesList] = useState<FourWayReversingValve[]>([]);
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const fetchValves = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/fourWayReversingValves`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setValvesList(data);
            }
        } catch (e) {
            console.error("Failed to fetch 4-way reversing valves", e);
        }
    };

    useEffect(() => {
        fetchValves();
    }, []);

    const handleAddValve = async () => {
        if (!model) {
            showToast(t("pleaseEnterModel"), "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addFourWayReversingValve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("addedSuccess", { name: t("names.fourWayValve.cap") }), "success");
                setModel("");
                fetchValves(); // Refresh the list
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedAdd", { name: t("names.fourWayValve.low") }), "error");
                } catch {
                    showToast(t("failedAdd", { name: t("names.fourWayValve.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleAddValveSpecs = async () => {
        if (fourWayReversingValve === "Select 4-Way Reversing Valve") {
            showToast(t("pleaseSelect", { name: t("names.fourWayValve.low") }), "error");
            return;
        }
        if (!capacity) {
            showToast(t("pleaseEnterCapacity"), "error");
            return;
        }

        const selectedValve = valvesList.find(v => v.model === fourWayReversingValve);
        if (!selectedValve) {
            showToast(t("invalidSelected", { name: t("names.fourWayValve.low") }), "error");
            return;
        }

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/addFourWayReversingValveSpecs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fourWayReversingValveId: selectedValve.id, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsAddedSuccess", { name: t("names.fourWayValve.cap") }), "success");
                setFourWayReversingValve("Select 4-Way Reversing Valve");
                setCapacity("");
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedAddSpecs", { name: t("names.fourWayValve.low") }), "error");
                } catch {
                    showToast(t("failedAddSpecs", { name: t("names.fourWayValve.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const valveOptions = ["Select 4-Way Reversing Valve", ...valvesList.map(v => v.model)];

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
                        {t("names.fourWayValve.cap")}
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
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.saveBtn} onClick={handleAddValve}>{t("add")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.fourWayValve.cap")}</label>
                                        <Combobox
                                            options={valveOptions}
                                            value={fourWayReversingValve}
                                            onChange={setFourWayReversingValve}
                                            getLabel={(v) => v === "Select 4-Way Reversing Valve" ? t("selectName", { name: t("names.fourWayValve.cap") }) : v}
                                            className={`${styles.comboBox} ${fourWayReversingValve.startsWith('Select') ? styles.placeholderText : ''}`}
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
                                <button className={styles.saveBtn} onClick={handleAddValveSpecs}>{t("add")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
