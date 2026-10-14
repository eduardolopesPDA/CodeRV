import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONES: Record<
  ToastTone,
  { icon: typeof Info; iconClass: string; border: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-positive",
    border: "border-positive-line",
  },
  error: {
    icon: XCircle,
    iconClass: "text-sev-alta",
    border: "border-sev-alta-line",
  },
  info: {
    icon: Info,
    iconClass: "text-ai",
    border: "border-ai-line",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((tone: ToastTone, title: string, description?: string) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev.slice(-3), { id, tone, title, description }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 5000);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => push("success", title, description),
      error: (title, description) => push("error", title, description),
      info: (title, description) => push("info", title, description),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
          role="status"
          aria-live="polite"
        >
          {items.map((item) => {
            const tone = TONES[item.tone];
            const Icon = tone.icon;
            return (
              <div
                key={item.id}
                className={cn(
                  "pointer-events-auto animate-fade-up rounded-card border bg-overlay p-3.5 shadow-pop",
                  tone.border,
                )}
              >
                <div className="flex gap-3">
                  <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone.iconClass)} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink">
                      {item.title}
                    </p>
                    {item.description ? (
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
