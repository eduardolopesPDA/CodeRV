import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage, getFieldError } from "@/lib/api/errors";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "./AuthContext";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

export function RegisterPage() {
  const { register } = useAuth();
  useDocumentTitle("Criar conta");
  const navigate = useNavigate();

  const [name, setName] = useState("");
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
      await register({ name: name.trim(), email: email.trim(), password });
      navigate("/projects", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível criar a conta."));
      setFieldErrors({
        name: getFieldError(err, "name") ?? "",
        email: getFieldError(err, "email") ?? "",
        password: getFieldError(err, "password") ?? "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Você já sai daqui com um time pessoal pronto para usar."
      footer={
        <>
          Já tem conta?{" "}
          <Link
            to="/login"
            className="font-semibold text-papaya-400 transition-colors hover:text-papaya-300"
          >
            Entrar
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

        <Field label="Nome" error={fieldErrors.name || null} required>
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              autoComplete="name"
              required
              placeholder="Como devemos te chamar"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
        </Field>

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

        <Field
          label="Senha"
          error={fieldErrors.password || null}
          hint="Mínimo de 8 caracteres."
          required
        >
          {({ id, describedBy }) => (
            <Input
              id={id}
              aria-describedby={describedBy}
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
