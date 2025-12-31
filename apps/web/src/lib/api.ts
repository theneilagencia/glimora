const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Custom error classes for better error handling
export class NetworkError extends Error {
  constructor(message: string = 'Sem conexão com a internet') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Sessão expirada ou inválida') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message?: string) {
    super(message || `Erro do servidor: ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Check if browser is online
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Helper to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
  }
  if (error instanceof AuthError) {
    return 'Sessão expirada. Por favor, faça login novamente.';
  }
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Não autorizado. Por favor, faça login novamente.';
    }
    if (error.status === 403) {
      return 'Você não tem permissão para realizar esta ação.';
    }
    if (error.status === 500) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    return `Erro do servidor (${error.status}). Tente novamente.`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if online before making request
  if (!isOnline()) {
    throw new NetworkError();
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new AuthError();
      }
      throw new ApiError(response.status);
    }

    return response.json();
  } catch (error) {
    // Handle network errors (fetch throws TypeError for network issues)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError();
    }
    // Re-throw our custom errors
    if (error instanceof NetworkError || error instanceof AuthError || error instanceof ApiError) {
      throw error;
    }
    // Handle other network-related errors
    if (error instanceof Error && (
      error.message.includes('network') ||
      error.message.includes('internet') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('ERR_CONNECTION_CLOSED') ||
      error.message.includes('Failed to fetch')
    )) {
      throw new NetworkError();
    }
    throw error;
  }
}

export async function fetchWithAuth<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  // Check if token is available
  if (!token) {
    throw new AuthError('Token de autenticação não disponível');
  }

  return fetchApi<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// Safe token getter that handles Clerk session failures
export async function safeGetToken(
  getToken: () => Promise<string | null>
): Promise<string | null> {
  if (!isOnline()) {
    throw new NetworkError();
  }

  try {
    const token = await getToken();
    return token;
  } catch (error) {
    // Handle Clerk session errors gracefully
    if (error instanceof Error && (
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('ERR_CONNECTION_CLOSED') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    )) {
      throw new NetworkError();
    }
    throw new AuthError('Falha ao obter token de sessão');
  }
}
