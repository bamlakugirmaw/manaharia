import { useCallback, useState } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const DEFAULT_CONFIG = {
    title: 'Are you sure?',
    description: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'destructive',
};

/**
 * Promise-based confirm helper.
 *
 * Usage:
 *   const { confirm, ConfirmDialogHost } = useConfirmDialog();
 *   const ok = await confirm({ title: 'Remove bus?', description: '...' });
 *   if (!ok) return;
 *   ...
 *   return <><ConfirmDialogHost />...</>;
 */
export function useConfirmDialog() {
    const [state, setState] = useState(null);

    const confirm = useCallback((config = {}) => {
        return new Promise((resolve) => {
            setState({
                ...DEFAULT_CONFIG,
                ...config,
                open: true,
                resolve,
            });
        });
    }, []);

    const close = useCallback((result) => {
        setState((prev) => {
            prev?.resolve?.(result);
            return null;
        });
    }, []);

    const ConfirmDialogHost = useCallback(() => (
        <ConfirmDialog
            open={!!state?.open}
            title={state?.title}
            description={state?.description}
            confirmLabel={state?.confirmLabel}
            cancelLabel={state?.cancelLabel}
            variant={state?.variant}
            loading={state?.loading}
            onCancel={() => !state?.loading && close(false)}
            onConfirm={() => !state?.loading && close(true)}
        />
    ), [state, close]);

    return { confirm, ConfirmDialogHost, closeConfirm: close };
}
