"use client";

import { useEffect, useRef } from "react";

type InfoDialogProps = { title: string; children: React.ReactNode; onClose: () => void };
const focusableSelector = "button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function InfoDialog({ title, children, onClose }: InfoDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("keydown", onKeyDown); trigger?.focus(); };
  }, [onClose]);
  return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}><div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button ref={closeRef} type="button" onClick={onClose} aria-label="대화상자 닫기">닫기</button></div><div className="dialog-content">{children}</div></section></div>;
}
