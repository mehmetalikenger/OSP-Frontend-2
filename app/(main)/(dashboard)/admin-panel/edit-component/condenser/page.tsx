"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";
import { useTranslations } from "next-intl";

type Condenser = {
    id: number;
    model: string;
    type?: string; // CondenserType enum name
}

// Display label <-> backend enum name
const CONDENSER_TYPES: Record<string, string> = { "Microchannel": "MICROCHANNEL" };
const condenserTypeLabel = (enumName?: string) =>
    Object.keys(CONDENSER_TYPES).find(k => CONDENSER_TYPES[k] === enumName) || "Microchannel";

type CondenserSpecs = {
    id: number;
    model: string;
    capacity: number;
}

export default function EditCondenserPage() {
    const t = useTranslations("AdminComp");
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Condenser");
    const [model, setModel] = useState("");
    const [type, setType] = useState("Microchannel");

    // Specs states
    const [condenser, setCondenser] = useState("Select Condenser");
    const [capacity, setCapacity] = useState("");

    const [condensersList, setCondensersList] = useState<Condenser[]>([]);
    const [condenserSpecsList, setCondenserSpecsList] = useState<CondenserSpecs[]>([]);
    
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

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

    const fetchCondenserSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allCondenserSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setCondenserSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch condenser specs", e);
        }
    };

    useEffect(() => {
        fetchCondensers();
        fetchCondenserSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Condenser") {
            const cond = condensersList.find(c => c.model === selectedItemToEdit);
            if (cond) {
                setModel(cond.model);
                setType(condenserTypeLabel(cond.type));
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, condensersList]);

    useEffect(() => {
        if (condenser !== "Select Condenser") {
            const spec = condenserSpecsList.find(s => `${s.model} / C: ${s.capacity}` === condenser);
            if (spec) {
                setCapacity(spec.capacity.toString());
            }
        } else {
            setCapacity("");
        }
    }, [condenser, condenserSpecsList]);

    const handleEditCondenser = async () => {
        if (selectedItemToEdit === "Select Condenser") {
            showToast(t("selectToEdit", { name: t("names.condenser.low") }), "error");
            return;
        }
        if (!model) {
            showToast(t("pleaseEnterModel"), "error");
            return;
        }

        const cond = condensersList.find(c => c.model === selectedItemToEdit);
        if (!cond) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCondenser/${cond.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model, type: CONDENSER_TYPES[type] }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("updatedSuccess", { name: t("names.condenser.cap") }), "success");
                setSelectedItemToEdit("Select Condenser");
                fetchCondensers();
                fetchCondenserSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEdit", { name: t("names.condenser.low") }), "error");
                } catch {
                    showToast(t("failedEdit", { name: t("names.condenser.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleEditCondenserSpecs = async () => {
        if (condenser === "Select Condenser") {
            showToast(t("selectSpecs", { name: t("names.condenser.cap") }), "error");
            return;
        }
        if (!capacity) {
            showToast(t("fillAllFields"), "error");
            return;
        }

        const selectedSpec = condenserSpecsList.find(s => `${s.model} / C: ${s.capacity}` === condenser);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editCondenserSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ condenserId: 0, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsUpdatedSuccess", { name: t("names.condenser.cap") }), "success");
                setCondenser("Select Condenser");
                fetchCondenserSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEditSpecs", { name: t("names.condenser.low") }), "error");
                } catch {
                    showToast(t("failedEditSpecs", { name: t("names.condenser.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const condenserOptions = ["Select Condenser", ...condensersList.map(c => c.model)];
    const specsOptions = ["Select Condenser", ...condenserSpecsList.map(s => `${s.model} / C: ${s.capacity}`)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Condenser") { showToast(t("selectToDelete", { name: t("names.condenser.low") }), "error"); return; }
        const item = condensersList.find(c => c.model === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: t("deleteTitle", { name: t("names.condenser.cap") }), message: t("deleteMessage", { item: selectedItemToEdit }), confirmText: t("delete") });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/condenser/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast(t("deleted", { name: t("names.condenser.cap") }), "success");
                setSelectedItemToEdit("Select Condenser");
                fetchCondensers();
                fetchCondenserSpecs();
            } else {
                showToast(t("failedDelete", { name: t("names.condenser.low") }), "error");
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
                        {t("names.condenser.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.condenser.cap")}</label>
                                        <Combobox
                                            options={condenserOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            getLabel={(v) => v === "Select Condenser" ? t("selectName", { name: t("names.condenser.cap") }) : v}
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
                                <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e', marginRight: '12px' }} onClick={handleDelete}>{t("delete")}</button>
                                <button className={styles.saveBtn} onClick={handleEditCondenser}>{t("save")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("specsSuffix", { name: t("names.condenser.cap") })}</label>
                                        <Combobox
                                            options={specsOptions}
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
                                <button className={styles.saveBtn} onClick={handleEditCondenserSpecs}>{t("save")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
