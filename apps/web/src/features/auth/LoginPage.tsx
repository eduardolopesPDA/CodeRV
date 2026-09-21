import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import { getAuthErrorMessage } from "../../lib/api-client/auth";
import { useAuth } from "./AuthContext";

const inputClass =
  "w-full border border-carbon-200 rounded-xl px-3 py-2.5 text-sm text-carbon-900 focus:outline-none focus:ring-2 focus:ring-papaya-400 focus:border-papaya-400";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/projects");
    } catch (err) {
      setError(getAuthErrorMessage(err, "login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-carbon-900 relative overflow-hidden px-4">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-papaya-500 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-racingblue-500 rounded-full blur-3xl opacity-20" />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-carbon-900">Bem-vindo de volta!</h1>
          <p className="text-sm text-carbon-500 mt-1">
            Entre para continuar revisando seus projetos.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm text-carbon-600 mb-1">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-carbon-600 mb-1">Senha</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
        <p className="text-sm text-carbon-500 text-center">
          Não tem conta?{" "}
          <Link to="/register" className="text-papaya-600 font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
