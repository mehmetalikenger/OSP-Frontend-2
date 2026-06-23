"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";

type Chassis = {
    id: number;
    model: string;
}

export default function EditChassisPage() {
    const t = useTranslations("AdminComp");
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Chassis");
    const [model, setModel] = useState("");

    const [chassisList, setChassisList] = useState<Chassis[]>([]);
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

    const fetchChassis = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/chassis`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setChassisList(data);
            }
        } catch (e) {
            console.error("Failed to fetch chassis", e);
        }
    };

    useEffect(() => {
        fetchChassis();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Chassis") {
            const ch = chassisList.find(c => c.model === selectedItemToEdit);
            if (ch) {
                setModel(ch.model);
            }
        } else {
            setModel("");
        }
    }, [selectedItemToEdit, chassisList]);

    const handleEditChassis = async () => {
        if (selectedItemToEdit === "Select Chassis") {
            showToast(t("selectToEdit", { name: t("names.chassis.low") }), "error");
            return;
        }
        if (!model) {
            showToast(t("pleaseEnterModel"), "error");
            return;
        }

        const ch = chassisList.find(c => c.model === selectedItemToEdit);
        if (!ch) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editChassis/${ch.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("updatedSuccess", { name: t("names.chassis.cap") }), "success");
                setSelectedItemToEdit("Select Chassis");
                fetchChassis();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEdit", { name: t("names.chassis.low") }), "error");
                } catch {
                    showToast(t("failedEdit", { name: t("names.chassis.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const chassisOptions = ["Select Chassis", ...chassisList.map(c => c.model)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Chassis") { showToast(t("selectToDelete", { name: t("names.chassis.low") }), "error"); return; }
        const item = chassisList.find(c => c.model === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: t("deleteTitle", { name: t("names.chassis.cap") }), message: t("deleteMessage", { item: selectedItemToEdit }), confirmText: t("delete") });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/chassis/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast(t("deleted", { name: t("names.chassis.cap") }), "success");
                setSelectedItemToEdit("Select Chassis");
                fetchChassis();
            } else {
                showToast(t("failedDelete", { name: t("names.chassis.low") }), "error");
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
                        {t("names.chassis.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.chassis.cap")}</label>
                                        <Combobox
                                            options={chassisOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            getLabel={(v) => v === "Select Chassis" ? t("selectName", { name: t("names.chassis.cap") }) : v}
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
                                <button className={styles.saveBtn} onClick={handleEditChassis}>{t("save")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
