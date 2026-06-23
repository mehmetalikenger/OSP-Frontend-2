"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";
import { useTranslations } from "next-intl";

type ExpansionValve = {
    id: number;
    model: string;
}

type ExpansionValveSpecs = {
    id: number;
    model: string;
    capacity: number;
}

export default function EditExpansionValvePage() {
    const t = useTranslations("AdminComp");
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Expansion Valve");
    const [model, setModel] = useState("");

    // Specs states
    const [expansionValve, setExpansionValve] = useState("Select Expansion Valve");
    const [capacity, setCapacity] = useState("");

    const [expansionValvesList, setExpansionValvesList] = useState<ExpansionValve[]>([]);
    const [expansionValveSpecsList, setExpansionValveSpecsList] = useState<ExpansionValveSpecs[]>([]);
    
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

    const fetchExpansionValves = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/expansionValves`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setExpansionValvesList(data);
            }
        } catch (e) {
            console.error("Failed to fetch expansion valves", e);
        }
    };

    const fetchExpansionValveSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allExpansionValveSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setExpansionValveSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch expansion valve specs", e);
        }
    };

    useEffect(() => {
        fetchExpansionValves();
        fetchExpansionValveSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Expansion Valve") {
            const valve = expansionValvesList.find(v => v.model === selectedItemToEdit);
            if (valve) {
                setModel(valve.model);
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, expansionValvesList]);

    useEffect(() => {
        if (expansionValve !== "Select Expansion Valve") {
            const spec = expansionValveSpecsList.find(s => `${s.model} / C: ${s.capacity}` === expansionValve);
            if (spec) {
                setCapacity(spec.capacity.toString());
            }
        } else {
            setCapacity("");
        }
    }, [expansionValve, expansionValveSpecsList]);

    const handleEditExpansionValve = async () => {
        if (selectedItemToEdit === "Select Expansion Valve") {
            showToast(t("selectToEdit", { name: t("names.expansionValve.low") }), "error");
            return;
        }
        if (!model) {
            showToast(t("pleaseEnterModel"), "error");
            return;
        }

        const valve = expansionValvesList.find(v => v.model === selectedItemToEdit);
        if (!valve) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editExpansionValve/${valve.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("updatedSuccess", { name: t("names.expansionValve.cap") }), "success");
                setSelectedItemToEdit("Select Expansion Valve");
                fetchExpansionValves();
                fetchExpansionValveSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEdit", { name: t("names.expansionValve.low") }), "error");
                } catch {
                    showToast(t("failedEdit", { name: t("names.expansionValve.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleEditExpansionValveSpecs = async () => {
        if (expansionValve === "Select Expansion Valve") {
            showToast(t("selectSpecs", { name: t("names.expansionValve.cap") }), "error");
            return;
        }
        if (!capacity) {
            showToast(t("fillAllFields"), "error");
            return;
        }

        const selectedSpec = expansionValveSpecsList.find(s => `${s.model} / C: ${s.capacity}` === expansionValve);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editExpansionValveSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expansionValveId: 0, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsUpdatedSuccess", { name: t("names.expansionValve.cap") }), "success");
                setExpansionValve("Select Expansion Valve");
                fetchExpansionValveSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEditSpecs", { name: t("names.expansionValve.low") }), "error");
                } catch {
                    showToast(t("failedEditSpecs", { name: t("names.expansionValve.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const expansionValveOptions = ["Select Expansion Valve", ...expansionValvesList.map(v => v.model)];
    const specsOptions = ["Select Expansion Valve", ...expansionValveSpecsList.map(s => `${s.model} / C: ${s.capacity}`)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Expansion Valve") { showToast(t("selectToDelete", { name: t("names.expansionValve.low") }), "error"); return; }
        const item = expansionValvesList.find(v => v.model === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: t("deleteTitle", { name: t("names.expansionValve.cap") }), message: t("deleteMessage", { item: selectedItemToEdit }), confirmText: t("delete") });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/expansionValve/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast(t("deleted", { name: t("names.expansionValve.cap") }), "success");
                setSelectedItemToEdit("Select Expansion Valve");
                fetchExpansionValves();
                fetchExpansionValveSpecs();
            } else {
                showToast(t("failedDelete", { name: t("names.expansionValve.low") }), "error");
            }
        } catch (error) { console.error(error); showToast(t("networkError"), "error"); }
    };

    return (
        <div className={styles.sectionsContainer} style={{ minHeight: 'fit-content', flex: 'none' }}>
            {confirmElement}
            {toastInfo && (
                <div className={toastInfo.type === 'error' ? toastStyles.errorToast : toastStyles.toast}>
                    {toastInfo.message}
                </div>
            )}
            <div className={styles.sectionContent} style={{ maxWidth: '1200px', flex: 'none' }}>
                <div className={styles.breadcrumbContainer}>
                    <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                        {t("names.expansionValve.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.expansionValve.cap")}</label>
                                        <Combobox
                                            options={expansionValveOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            getLabel={(v) => v === "Select Expansion Valve" ? t("selectName", { name: t("names.expansionValve.cap") }) : v}
                                            className={`${styles.comboBox} ${selectedItemToEdit.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
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
                                <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e', marginRight: '12px' }} onClick={handleDelete}>{t("delete")}</button>
                                <button className={styles.saveBtn} onClick={handleEditExpansionValve}>{t("save")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("specsSuffix", { name: t("names.expansionValve.cap") })}</label>
                                        <Combobox
                                            options={specsOptions}
                                            value={expansionValve}
                                            onChange={setExpansionValve}
                                            getLabel={(v) => v === "Select Expansion Valve" ? t("selectName", { name: t("names.expansionValve.cap") }) : v}
                                            className={`${styles.comboBox} ${expansionValve.startsWith('Select') ? styles.placeholderText : ''}`}
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
                                <button className={styles.saveBtn} onClick={handleEditExpansionValveSpecs}>{t("save")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
