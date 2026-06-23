"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "../../add-unit/addUnit.module.css";
import toastStyles from "../../toast.module.css";
import Combobox from "../../../../profile/saved-units/Combobox";
import { fetchWithAuth } from "../../../../../../lib/api";
import { useConfirm } from "../../useConfirm";

type Refrigerant = {
    id: number;
    name: string;
    code: string;
}

export default function EditRefrigerantPage() {
    const t = useTranslations("AdminComp");
    const [selectedItemToEdit, setSelectedItemToEdit] = useState("Select Refrigerant");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const [refrigerantsList, setRefrigerantsList] = useState<Refrigerant[]>([]);
    const [toastInfo, setToastInfo] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToastInfo({ message: msg, type });
        setTimeout(() => setToastInfo(null), 3000);
    };

    const { confirm, confirmElement } = useConfirm();

    const fetchRefrigerants = async () => {
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/refrigerants`, { credentials: 'include', cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setRefrigerantsList(data);
            }
        } catch (e) {
            console.error("Failed to fetch refrigerants", e);
        }
    };

    useEffect(() => {
        fetchRefrigerants();
    }, []);

    useEffect(() => {
        if (selectedItemToEdit !== "Select Refrigerant") {
            const ref = refrigerantsList.find(r => r.code === selectedItemToEdit);
            if (ref) {
                setName(ref.name);
                setCode(ref.code);
            }
        } else {
            setName("");
            setCode("");
        }
    }, [selectedItemToEdit, refrigerantsList]);

    const handleEditRefrigerant = async () => {
        if (selectedItemToEdit === "Select Refrigerant") {
            showToast(t("selectToEdit", { name: t("names.refrigerant.low") }), "error");
            return;
        }
        if (!name || !code) {
            showToast(t("pleaseEnterNameCode"), "error");
            return;
        }

        const ref = refrigerantsList.find(r => r.code === selectedItemToEdit);
        if (!ref) return;

        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/editRefrigerant/${ref.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, code }),
                credentials: 'include'
            });

            if (res.ok) {
                showToast(t("updatedSuccess", { name: t("names.refrigerant.cap") }), "success");
                setSelectedItemToEdit("Select Refrigerant");
                fetchRefrigerants();
            } else {
                try {
                    const data = await res.json();
                    showToast(data.message || t("failedEdit", { name: t("names.refrigerant.low") }), "error");
                } catch {
                    showToast(t("failedEdit", { name: t("names.refrigerant.low") }), "error");
                }
            }
        } catch (error) {
            console.error(error);
            showToast(t("networkError"), "error");
        }
    };

    const refrigerantOptions = ["Select Refrigerant", ...refrigerantsList.map(r => r.code)];

    const handleDelete = async () => {
        if (selectedItemToEdit === "Select Refrigerant") { showToast(t("selectToDelete", { name: t("names.refrigerant.low") }), "error"); return; }
        const item = refrigerantsList.find(r => r.code === selectedItemToEdit);
        if (!item) return;
        const ok = await confirm({ title: t("deleteTitle", { name: t("names.refrigerant.cap") }), message: t("deleteMessage", { item: selectedItemToEdit }), confirmText: t("delete") });
        if (!ok) return;
        try {
            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/admin/component/refrigerant/${item.id}`, { method: "DELETE", credentials: 'include' });
            if (res.ok) {
                showToast(t("deleted", { name: t("names.refrigerant.cap") }), "success");
                setSelectedItemToEdit("Select Refrigerant");
                fetchRefrigerants();
            } else {
                showToast(t("failedDelete", { name: t("names.refrigerant.low") }), "error");
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
                        {t("names.refrigerant.cap")}
                    </span>
                </div>

                <div className={styles.horizontalSeperator}></div>

                <div className={styles.splitContent}>
                    <div className={styles.leftContent}>
                        <div className={styles.formSection}>
                            <div className={styles.formGrid}>
                                    <div className={styles.formField}>
                                        <label>{t("names.refrigerant.cap")}</label>
                                        <Combobox
                                            options={refrigerantOptions}
                                            value={selectedItemToEdit}
                                            onChange={setSelectedItemToEdit}
                                            getLabel={(v) => v === "Select Refrigerant" ? t("selectName", { name: t("names.refrigerant.cap") }) : v}
                                            className={`${styles.comboBox} ${selectedItemToEdit.startsWith('Select') ? styles.placeholderText : ''}`}
                                            containerClassName={styles.comboboxContainerOverride}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("fieldName")}</label>
                                        <input
                                            type="text"
                                            className={styles.inputElement}
                                            placeholder={t("enterName")}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className={styles.formField}>
                                        <label>{t("code")}</label>
                                        <input
                                            type="text"
                                            className={styles.inputElement}
                                            placeholder={t("enterCode")}
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                        />
                                    </div>
                            </div>
                            <div className={styles.stepNavContainer} style={{ borderTop: 'none', marginTop: '15px', padding: '0', justifyContent: 'flex-end' }}>
                                <button className={styles.cancelBtn} style={{ color: '#d7292e', borderColor: '#d7292e', marginRight: '12px' }} onClick={handleDelete}>{t("delete")}</button>
                                <button className={styles.saveBtn} onClick={handleEditRefrigerant}>{t("save")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
