"use client";

import styles from "./confirmModal.module.css";

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    open,
    title = "Confirm",
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;
    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <h3 className={styles.title}>{title}</h3>
                {message && <p className={styles.message}>{message}</p>}
                <div className={styles.buttons}>
                    <button className={styles.cancelBtn} onClick={onCancel}>{cancelText}</button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}
