"use client";

import { useCallback, useState } from "react";
import ConfirmModal from "./ConfirmModal";

interface ConfirmOptions {
    title?: string;
    message?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
}

// Promise-based confirmation: call `await confirm({...})` to get a boolean,
// and render `{confirmElement}` once in the component to show the modal.
export function useConfirm() {
    const [opts, setOpts] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        setOpts(options);
        return new Promise<boolean>((resolve) => setResolver(() => resolve));
    }, []);

    const close = (result: boolean) => {
        if (resolver) resolver(result);
        setResolver(null);
        setOpts(null);
    };

    const confirmElement = (
        <ConfirmModal
            open={opts !== null}
            title={opts?.title}
            message={opts?.message}
            confirmText={opts?.confirmText}
            cancelText={opts?.cancelText}
            onConfirm={() => close(true)}
            onCancel={() => close(false)}
        />
    );

    return { confirm, confirmElement };
}
