import { BookMarked, Bot, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  CLASSIFICATION_LABELS,
  SEVERITY_CLASSES,
  SEVERITY_LABELS,
} from "@/lib/labels";
import type {
  FindingClassification,
  FindingSource,
  Severity,
} from "@/lib/api/types";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const classes = SEVERITY_CLASSES[severity];
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold " +
        classes.bg +
        " " +
        classes.border +
        " " +
        classes.text
      }
    >
      <span
        className={"h-1.5 w-1.5 rounded-full " + classes.bar}
        aria-hidden
      />
      {SEVERITY_LABELS[severity]}
    </span>
  );
}

export function SourceBadge({ source }: { source: FindingSource }) {
  if (source === "AI") {
    return (
      <Badge tone="ai">
        <Bot className="h-3 w-3" />
        IA
      </Badge>
    );
  }
  return (
    <Badge tone="static">
      <Terminal className="h-3 w-3" />
      Lint
    </Badge>
  );
}

export function ClassificationBadge({
  classification,
}: {
  classification: FindingClassification;
}) {
  if (classification === "regra_negocio") {
    return (
      <Badge tone="accent">
        <BookMarked className="h-3 w-3" />
        {CLASSIFICATION_LABELS[classification]}
      </Badge>
    );
  }
  return <Badge>{CLASSIFICATION_LABELS[classification]}</Badge>;
}
