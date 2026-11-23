import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const useDialogFocus = (open, dialogRef, onClose) => {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const getFocusableElements = () =>
      Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (element) => element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0
      );

    const focusables = getFocusableElements();
    const initialFocus = dialog.querySelector('[data-dialog-autofocus]') || focusables[0] || dialog;
    initialFocus.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const currentFocusables = getFocusableElements();
      if (currentFocusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = currentFocusables[0];
      const last = currentFocusables[currentFocusables.length - 1];
      const focusIsOutside = !dialog.contains(document.activeElement);

      if (event.shiftKey && (document.activeElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [open, dialogRef]);
};

export default useDialogFocus;
