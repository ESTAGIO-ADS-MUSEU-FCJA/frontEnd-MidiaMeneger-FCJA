// src/services/api.js

export const API_BASE_URL = 'https://fcja-view-qrcode.onrender.com';
export const TOKEN_KEY = 'auth_token'; 

// --- Funções Genéricas ---

/**
 * Função genérica para realizar requisições POST autenticadas ou não.
 */
export async function apiPost(endpoint, data, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
    });
    return response;
}

/**
 * Função genérica para realizar requisições GET autenticadas.
 */
export async function apiGet(endpoint, token) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
        },
    });
    return response;
}

// --- Funções de Autenticação ---

export async function apiRegister(data) {
    // ✅ CORRIGIDO: Rota alterada para /usuarios/criar
    return apiPost('/usuarios/criar', data);
}

export async function apiLogin(data) {
    // ✅ CORRIGIDO: Rota alterada para /login
    return apiPost('/login', data);
}

// --- Funções de Gerenciamento de Mídia (CRUD) ---

/**
 * Busca a lista completa de notas (GET /notas/).
 */
export async function apiGetMedia(token) {
    return apiGet('/notas/', token); 
}

/**
 * Cria uma nova nota (POST /notas/).
 * @param {object} data - Objeto contendo {titulo, descricao}.
 * @param {string} token - O token de autenticação.
 */
export async function apiCreateMedia(data, token) {
    // POST /notas/
    return apiPost('/notas/', data, token);
}

/**
 * Edita uma nota existente (PUT /notas/editar/{id}).
 * @param {string} id - O ID da nota a ser editada.
 * @param {object} data - Objeto contendo {titulo, descricao}.
 * @param {string} token - O token de autenticação.
 */
export async function apiEditMedia(id, data, token) {
    // PUT /notas/editar/{id}
    const response = await fetch(`${API_BASE_URL}/notas/${id}`, { // mexi aqui
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return response;
}

/**
 * Deleta uma nota (DELETE /notas/deletar{id}).
 * @param {string} id - O ID da nota a ser deletada.
 * @param {string} token - O token de autenticação.
 */
export async function apiDeleteMedia(id, token) {
    // DELETE /notas/deletar{id}
    const response = await fetch(`${API_BASE_URL}/notas/deletar${id}`, { 
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json',
        },
    });
    return response;
}