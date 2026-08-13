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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = "Erro na chamada à API";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Falha a fazer parse do JSON de erro
    }
    
    // Se receber 401 Unauthorized, pode significar token inválido/expirado
    if (response.status === 401 && typeof window !== "undefined") {
      // Se estivermos no browser, podemos forçar o redirecionamento para o login
      // Apenas comentar por agora para o middleware tratar disto, ou ativar mais tarde
      // window.location.href = "/login";
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

// Interfaces de Tipo para o Domínio de Treino
export interface Exercicio {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'AQUECIMENTO' | 'TECNICO' | 'TATICO' | 'FISICO' | 'GUARDA_REDES' | 'LUDICO';
  nivelDificuldade: number;
}

export interface SessaoTreinoExercicio {
  id?: string;
  exercicioId: string;
  exercicioNome: string;
  ordem: number;
  duracaoMinutos: number;
  observacoesDoTreinador?: string;
}

export interface SessaoTreino {
  id: string;
  data: string;
  objetivo: string;
  intensidadeGeral: number;
  duracaoTotalMinutos: number;
  equipaId: string;
  exercicios: SessaoTreinoExercicio[];
}
