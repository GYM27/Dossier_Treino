import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Prepara os cabeçalhos padrão
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Prepara o pedido com credentials para o cookie ser enviado
  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // CRÍTICO: Permite receber e enviar o cookie HttpOnly!
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  } catch (error) {
    // Se o fetch falhar completamente (ex: servidor em baixo ou sem internet)
    if (typeof window !== "undefined") {
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        toast.error("Ligação ao servidor perdida. A redirecionar para o Login...");
        window.location.href = "/login";
      }
    }
    throw new Error("Não foi possível ligar ao servidor.");
  }

  if (!response.ok) {
    let errorMessage = "Erro na chamada à API";
    try {
      const errorData = await response.json();
      console.error("API Error Response:", response.status, errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      console.error(
        "API Error (Non-JSON):",
        response.status,
        response.statusText,
      );
    }

    // Se receber 401 Unauthorized ou 403 Forbidden, a sessão expirou ou é inválida
    if (
      (response.status === 401 || response.status === 403) &&
      typeof window !== "undefined"
    ) {
      // Prevenir loop infinito se já estivermos na página de login
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    throw new Error(errorMessage + ` (status: ${response.status})`);
  }

  // Alguns endpoints podem não devolver JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}
