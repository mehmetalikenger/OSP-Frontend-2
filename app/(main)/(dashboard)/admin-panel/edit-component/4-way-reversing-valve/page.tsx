"use client";

import { useState, useEffect } from "react";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";
import { useTranslations } from "next-intl";

type FourWayReversingValve = {
    id: number;
    model: string;
}

type FourWayReversingValveSpecs = {
    id: number;
    model: string;
    capacity: number;
}

export default function EditFourWayReversingValvePage() {
    const t = useTranslations("AdminComp");
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select 4-Way Reversing Valve");
    const [model, setModel] = useState("");

    // Specs states
    const [fourWayReversingValve, setFourWayReversingValve] = useState("Select 4-Way Reversing Valve");
    const [capacity, setCapacity] = useState("");

    const [valvesList, setValvesList] = useState<FourWayReversingValve[]>([]);
    const [valveSpecsList, setValveSpecsList] = useState<FourWayReversingValveSpecs[]>([]);
    
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

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

    const fetchValveSpecs = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/allFourWayReversingValveSpecs`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setValveSpecsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch 4-way reversing valve specs", e);
        }
    };

    useEffect(() => {
        fetchValves();
        fetchValveSpecs();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select 4-Way Reversing Valve") {
            const valve = valvesList.find(v => v.model === selectedItemToEdit);
            if (valve) {
                setModel(valve.model);
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, valvesList]);

    useEffect(() => {
        if (fourWayReversingValve !== "Select 4-Way Reversing Valve") {
            const spec = valveSpecsList.find(s => `${s.model} / C: ${s.capacity}` === fourWayReversingValve);
            if (spec) {
                setCapacity(spec.capacity.toString());
            }
        } else {
            setCapacity("");
        }
    }, [fourWayReversingValve, valveSpecsList]);

    const handleEditValve = async () => {
        if (selectedItemToEdit === "Select 4-Way Reversing Valve") {
            showToast(t("selectToEdit", { name: t("names.fourWayValve.low") }), "error");
            return;
        }
        if (!model) {
            showToast(t("pleaseEnterModel"), "error");
            return;
        }

        const valve = valvesList.find(v => v.model === selectedItemToEdit);
        if (!valve) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editFourWayReversingValve/${valve.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("updatedSuccess", { name: t("names.fourWayValve.cap") }), "success");
                setSelectedItemToEdit("Select 4-Way Reversing Valve");
                fetchValves();
                fetchValveSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEdit", { name: t("names.fourWayValve.low") }), "error");
                } catch {
                    showToast(t("failedEdit", { name: t("names.fourWayValve.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const handleEditValveSpecs = async () => {
        if (fourWayReversingValve === "Select 4-Way Reversing Valve") {
            showToast(t("selectSpecs", { name: t("names.fourWayValve.cap") }), "error");
            return;
        }
        if (!capacity) {
            showToast(t("fillAllFields"), "error");
            return;
        }

        const selectedSpec = valveSpecsList.find(s => `${s.model} / C: ${s.capacity}` === fourWayReversingValve);
        if (!selectedSpec) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editFourWayReversingValveSpecs/${selectedSpec.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fourWayReversingValveId: 0, capacity: parseFloat(capacity) }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("specsUpdatedSuccess", { name: t("names.fourWayValve.cap") }), "success");
                setFourWayReversingValve("Select 4-Way Reversing Valve");
                fetchValveSpecs();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEditSpecs", { name: t("names.fourWayValve.low") }), "error");
                } catch {
                    showToast(t("failedEditSpecs", { name: t("names.fourWayValve.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const valveOptions = ["Select 4-Way Reversing Valve", ...valvesList.map(v => v.model)];
    const specsOptions = ["Select 4-Way Reversing Valve", ...valveSpecsList.map(s => `${s.model} / C: ${s.capacity}`)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select 4-Way Reversing Valve") { showToast(t("selectToDelete", { name: t("names.fourWayValve.low") }), "error"); return; }
        const item = valvesList.find(v => v.model === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: t("deleteTitle", { name: t("names.fourWayValve.cap") }), message: t("deleteMessage", { item: selectedItemToEdit }), confirmText: t("delete") });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/fourWayReversingValve/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast(t("deleted", { name: t("names.fourWayValve.cap") }), "success");
                setSelectedItemToEdit("Select 4-Way Reversing Valve");
                fetchValves();
                fetchValveSpecs();
            } else {
                showToast(t("failedDelete", { name: t("names.fourWayValve.low") }), "error");
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
                        {t("names.fourWayValve.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.fourWayValve.cap")}</label>
                                        <Combobox
                                            options={valveOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            getLabel={(v) => v === "Select 4-Way Reversing Valve" ? t("selectName", { name: t("names.fourWayValve.cap") }) : v}
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
                                <button className={styles.saveBtn} onClick={handleEditValve}>{t("save")}</button>
                            </div>

                            <div className={styles.horizontalSeperator} style={{ margin: '30px 0' }}></div>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("specsSuffix", { name: t("names.fourWayValve.cap") })}</label>
                                        <Combobox
                                            options={specsOptions}
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
                                <button className={styles.saveBtn} onClick={handleEditValveSpecs}>{t("save")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
