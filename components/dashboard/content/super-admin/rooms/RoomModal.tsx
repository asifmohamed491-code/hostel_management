"use client";

// RoomModal.tsx
// The one shared modal shell for the View Rooms page (Add Room, Edit Room,
// View Students). Glassmorphism panel on a blurred lavender backdrop.
//
// Accessibility: role="dialog" + aria-modal, labelled by its title, focus
// moves inside on open and returns to the trigger on close, Tab/Shift+Tab
// are trapped, Escape and a backdrop click close it. It portals to <body>
// because the dashboard content column creates its own stacking context
// (z-10) that would otherwise keep the modal beneath the fixed Sidebar.
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const subscribe = () => () => {};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface RoomModalProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

export function RoomModal(props: RoomModalProps) {
  // false on the server / during hydration, true on the client.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  if (!mounted) return null;
  return createPortal(<ModalShell {...props} />, document.body);
}

function ModalShell({ title, description, icon, onClose, children }: RoomModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => setEntered(true));

    const initialTarget =
      panel?.querySelector<HTMLElement>("[data-autofocus]") ??
      panel?.querySelector("[data-modal-body]")?.querySelector<HTMLElement>(FOCUSABLE) ??
      panel;
    initialTarget?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="presentation"
    >
      <div
        aria-hidden
        onMouseDown={onClose}
        className={cn(
          "absolute inset-0 bg-heading/35 backdrop-blur-sm transition-opacity duration-200",
          entered ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(243,238,254,0.94))",
        }}
        className={cn(
          "relative flex max-h-[90dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-[24px] border border-white/70",
          "shadow-[0_24px_60px_rgba(76,29,149,0.28)] backdrop-blur-[30px] transition-all duration-200 ease-out focus:outline-none",
          entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-3 scale-[0.97] opacity-0"
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="truncate text-[17px] font-semibold text-heading">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-0.5 text-[12.5px] font-medium text-heading/55">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-heading/50 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div data-modal-body className="oasys-scrollbar overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
