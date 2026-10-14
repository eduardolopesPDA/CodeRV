import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/States";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function NotFoundPage() {
  useDocumentTitle("Página não encontrada");
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Erro 404"
        title="Página não encontrada"
        description="O endereço que você abriu não existe mais — ou nunca existiu."
      />
      <EmptyState
        icon={<SearchX className="h-5 w-5" />}
        title="Nada por aqui"
        description="Volte para a lista de projetos e tente de novo."
        action={
          <Link
            to="/projects"
            className="inline-flex h-10 items-center rounded-full bg-papaya-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-papaya-400"
          >
            Ir para projetos
          </Link>
        }
      />
    </div>
  );
}
