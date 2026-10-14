import { ApiError } from "./client";

const CODE_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Sua sessão expirou. Entre novamente.",
  INVALID_CREDENTIALS: "E-mail ou senha incorretos.",
  EMAIL_IN_USE: "Este e-mail já está cadastrado.",
  FORBIDDEN: "Você não tem permissão para fazer isso.",
  NOT_FOUND: "Não encontramos o que você procura.",
  USER_NOT_FOUND: "Não existe usuário com este e-mail.",
  ALREADY_MEMBER: "Esta pessoa já é membro do time.",
  FINDING_NOT_IN_PROJECT: "Este achado não pertence à análise.",
  NO_PENDING_CLARIFICATION: "Não há dúvida em aberto neste achado.",
  UNSUPPORTED_LANGUAGE:
    "Este projeto não tem essa linguagem entre as suportadas.",
  AI_TIMEOUT: "A IA demorou mais que o esperado. Tente novamente.",
  AI_PROVIDER_RATE_LIMITED: "O provedor de IA está sobrecarregado agora.",
  AI_NOT_CONFIGURED: "A IA não está configurada neste ambiente.",
  TOO_MANY_AI_REQUESTS:
    "Você atingiu o limite de análises com IA neste período.",
  INTERNAL_SERVER_ERROR: "Algo deu errado do nosso lado. Tente novamente.",
};

const FALLBACK = "Algo deu errado. Tente novamente.";

export function getApiErrorMessage(
  error: unknown,
  fallback: string = FALLBACK,
): string {
  if (error instanceof ApiError) {
    if (error.code && CODE_MESSAGES[error.code]) {
      return CODE_MESSAGES[error.code];
    }
    const fieldError = Object.values(error.fieldErrors)[0]?.[0];
    if (fieldError) return fieldError;
    if (error.status >= 500) return CODE_MESSAGES.INTERNAL_SERVER_ERROR;
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return "A requisição demorou demais e foi cancelada.";
  }
  if (error instanceof TypeError) {
    return "Não conseguiu falar com o servidor. Verifique sua conexão.";
  }
  return fallback;
}

export function getFieldError(
  error: unknown,
  field: string,
): string | undefined {
  if (error instanceof ApiError) {
    return error.fieldErrors[field]?.[0];
  }
  return undefined;
}

export function isAiError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    ["AI_TIMEOUT", "AI_PROVIDER_RATE_LIMITED", "AI_NOT_CONFIGURED"].includes(
      error.code ?? "",
    )
  );
}
