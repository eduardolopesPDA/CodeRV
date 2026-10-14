import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage, getFieldError } from "@/lib/api/errors";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "./AuthContext";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function LoginPage() {
  const { login } = useAuth();
  useDocumentTitle("Entrar");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/projects";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível entrar."));
      setFieldErrors({
        email: getFieldError(err, "email") ?? "",
        password: getFieldError(err, "password") ?? "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre para continuar a revisar código com o seu time."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link
            to="/register"
            className="font-semibold text-papaya-400 transition-colors hover:text-papaya-300"
          >
            Cadastre-se grátis
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-field border border-sev-alta-line bg-sev-alta-soft px-3 py-2.5 text-[13px] leading-relaxed text-sev-alta"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <Field label="E-mail" error={fieldErrors.email || null} required>
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              type="email"
              autoComplete="email"
              required
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Field>

        <Field label="Senha" error={fieldErrors.password || null} required>
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>

        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}
