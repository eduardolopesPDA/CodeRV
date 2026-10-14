import { Spinner } from "@/components/ui/Spinner";

export function FullScreenLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface">
        <Spinner className="text-papaya-500" />
      </div>
      <p className="text-[13px] text-subtle">{label ?? "Carregando..."}</p>
    </div>
  );
}
