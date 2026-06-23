"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";
import { useTranslations } from "next-intl";

type Evaporator = {
    id: number;
    model: string;
    type?: string; // EvaporatorType enum name
}

// Display label <-> backend enum name
const EVAPORATOR_TYPES: Record<string, string> = {
    "Plate": "PLATE",
    "Coil": "COIL",
    "Shell & Tube": "SHELL_AND_TUBE",
};
const evaporatorTypeLabel = (enumName?: string) =>
    Object.keys(EVAPORATOR_TYPES).find(k => EVAPORATOR_TYPES[k] === enumName) || "Plate";

type EvaporatorSpecs = {
    id: number;
    model: string;
    capacity: number;
}

export default function EditEvaporatorPage() {
    const t = useTranslations("AdminComp");
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Evaporator");
    const [model, setModel] = useState("");
    const [type, setType] = useState("Plate");

    // Specs states
    const [evaporator, setEvaporator] = useState("Select Evaporator");
    const [capacity, setCapacity] = useState("");

    const [evaporatorsList, setEvaporatorsList] = useState<Evaporator[]>([]);
    const [evaporatorSpecsList, setEvaporatorSpecsList] = useState<EvaporatorSpecs[]>([]);
    
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

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

    const fetchEvaporatorSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allEvaporatorSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setEvaporatorSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch evaporator specs", e);
        }
    };

    useEffect(() => {
        fetchEvaporators();
        fetchEvaporatorSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Evaporator") {
            const evap = evaporatorsList.find(e => e.model === selectedItemToEdit);
            if (evap) {
                setModel(evap.model);
                setType(evaporatorTypeLabel(evap.type));
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, evaporatorsList]);

    useEffect(() => {
        if (evaporator !== "Select Evaporator") {
            const spec = evaporatorSpecsList.find(s => `${s.model} / C: ${s.capacity}` === evaporator);
            if (spec) {
                setCapacity(spec.capacity.toString());
            }
        } else {
            setCapacity("");
        }
    }, [evaporator, evaporatorSpecsList]);

    const handleEditEvaporator = async () => {
        if (selectedItemToEdit === "Select Evaporator") {
            showToast(t("selectToEdit", { name: t("names.evaporator.low") }), "error");
            return;
        }
        if (!model) {
            showToast(t("pleaseEnterModel"), "error");
            return;
        }

        const evap = evaporatorsList.find(e => e.model === selectedItemToEdit);
        if (!evap) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editEvaporator/${evap.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model, type: EVAPORATOR_TYPES[type] }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("updatedSuccess", { name: t("names.evaporator.cap") }), "success");
                setSelectedItemToEdit("Select Evaporator");
                fetchEvaporators();
                fetchEvaporatorSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEdit", { name: t("names.evaporator.low") }), "error");
                } catch {
                    showToast(t("failedEdit", { name: t("names.evaporator.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleEditEvaporatorSpecs = async () => {
        if (evaporator === "Select Evaporator") {
            showToast(t("selectSpecs", { name: t("names.evaporator.cap") }), "error");
            return;
        }
        if (!capacity) {
            showToast(t("fillAllFields"), "error");
            return;
        }

        const selectedSpec = evaporatorSpecsList.find(s => `${s.model} / C: ${s.capacity}` === evaporator);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editEvaporatorSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ evaporatorId: 0, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsUpdatedSuccess", { name: t("names.evaporator.cap") }), "success");
                setEvaporator("Select Evaporator");
                fetchEvaporatorSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEditSpecs", { name: t("names.evaporator.low") }), "error");
                } catch {
                    showToast(t("failedEditSpecs", { name: t("names.evaporator.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const evaporatorOptions = ["Select Evaporator", ...evaporatorsList.map(e => e.model)];
    const specsOptions = ["Select Evaporator", ...evaporatorSpecsList.map(s => `${s.model} / C: ${s.capacity}`)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Evaporator") { showToast(t("selectToDelete", { name: t("names.evaporator.low") }), "error"); return; }
        const item = evaporatorsList.find(e => e.model === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: t("deleteTitle", { name: t("names.evaporator.cap") }), message: t("deleteMessage", { item: selectedItemToEdit }), confirmText: t("delete") });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/evaporator/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast(t("deleted", { name: t("names.evaporator.cap") }), "success");
                setSelectedItemToEdit("Select Evaporator");
                fetchEvaporators();
                fetchEvaporatorSpecs();
            } else {
                showToast(t("failedDelete", { name: t("names.evaporator.low") }), "error");
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
                        {t("names.evaporator.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.evaporator.cap")}</label>
                                        <Combobox
                                            options={evaporatorOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            getLabel={(v) => v === "Select Evaporator" ? t("selectName", { name: t("names.evaporator.cap") }) : v}
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
                                            options={Object.keys(EVAPORATOR_TYPES)}
                                            value={type}
                                            onChange={setType}
                                            className={styles.comboBox}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e', marginRight: '12px' }} onClick={handleDelete}>{t("delete")}</button>
                                <button className={styles.saveBtn} onClick={handleEditEvaporator}>{t("save")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("specsSuffix", { name: t("names.evaporator.cap") })}</label>
                                        <Combobox
                                            options={specsOptions}
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
                                <button className={styles.saveBtn} onClick={handleEditEvaporatorSpecs}>{t("save")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
