const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
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
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        alert("Ligação ao servidor perdida. A redirecionar para o Login...");
        window.location.href = "/login";
      }
    }
    throw new Error("Não foi possível ligar ao servidor.");
  }

  if (!response.ok) {
    let errorMessage = "Erro na chamada à API";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Falha a fazer parse do JSON de erro
    }
    
    // Se receber 401 Unauthorized, a sessão expirou
    if (response.status === 401 && typeof window !== "undefined") {
      // Prevenir loop infinito se já estivermos na página de login
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }

    throw new Error(errorMessage);
  }

  // Alguns endpoints podem não devolver JSON
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
