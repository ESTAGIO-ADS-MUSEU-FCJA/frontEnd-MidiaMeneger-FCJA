// src/auth.js

// Importações
import { apiPost, apiGet, apiLogin, apiRegister } from './services/api.js'; 
import { displayMessage, setButtonState, navigateTo, renderProfile, messageElement } from './ui.js';
// 🔑 CORREÇÃO 1: Importa loadMediaList para carregar as mídias após a autenticação
import { loadMediaList } from './media.js'; 

// --- Gerenciamento Local do Token ---

export const TOKEN_KEY = 'auth_token'; 

export function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// --- Funções de API ---

/**
 * Busca dados do usuário logado (GET /me).
 */
export async function getMe() {
    const token = getToken();
    if (!token) return null; 

    try {
        // Usa a rota confirmada /me
        const response = await apiGet('/me', token); 
        
        // Se a autenticação falhar (401/403), limpa o token local
        if (response.status === 403 || response.status === 401) {
            removeToken();
            return null;
        }

        if (!response.ok) {
            throw new Error('Erro ao buscar dados do usuário.');
        }
        
        const userData = await response.json();
        return userData.info || userData; 
        
    } catch (error) {
        // O erro 'Failed to fetch' que você viu aparece aqui.
        console.error('Erro ao buscar perfil:', error);
        return null; 
    }
}


/**
 * Lida com a submissão do formulário de Login (POST /login).
 */
export async function handleLogin(credentials, button, messageEl) {
    setButtonState(button, true, 'Entrar', 'Verificando...');
    displayMessage('Tentando login...', false, messageEl);

    try {
        const response = await apiLogin(credentials);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
            throw new Error(error.detail || 'Credenciais inválidas.');
        }

        const data = await response.json();
        
        if (data.access) { 
            saveToken(data.access);
        } else {
            if (data.access_token) {
                saveToken(data.access_token);
            } else {
                throw new Error('Login OK, mas o backend não retornou o token na chave "access" ou "access_token".');
            }
        }
        
        displayMessage('Login realizado com sucesso!', false, messageEl);
        
        // 🔑 CORREÇÃO 2: Chama a verificação que, por sua vez, carrega as mídias.
        await checkAuthentication(); 
        
    } catch (error) {
        console.error('Erro no login:', error);
        displayMessage(error.message || 'Erro ao comunicar com o servidor.', true, messageEl);
    } finally {
        setButtonState(button, false, 'Entrar');
    }
}


/**
 * Lida com a submissão do formulário de Cadastro (POST /usuarios/criar).
 */
export async function handleRegister(credentials, button, messageEl) {
    setButtonState(button, true, 'Criar Conta', 'Enviando...');
    displayMessage('Criando usuário...', false, messageEl);

    try {
        const response = await apiRegister(credentials);

        const data = await response.json();

        if (!response.ok) {
            const detail = data.detail || 'Erro desconhecido ao cadastrar.';
            throw new Error(detail);
        }

        displayMessage('Usuário criado com sucesso! Logando automaticamente...', false, messageEl);
        
        // Preenche campos para login automático
        document.getElementById('email').value = credentials.email;
        document.getElementById('senha').value = credentials.senha;
        navigateTo('login-screen');
        
        // Loga automaticamente
        const loginButton = document.getElementById('login-button'); 
        const messageElement = document.getElementById('message');
        await handleLogin(credentials, loginButton, messageElement);

    } catch (error) {
        console.error('Erro no cadastro:', error);
        displayMessage(error.message || 'Erro ao comunicar com o servidor.', true, messageEl);
    } finally {
        setButtonState(button, false, 'Criar Conta');
    }
}

// --- Funções de Inicialização e Logout ---

/**
 * Verifica se o usuário tem um token válido e navega para a tela correta.
 */
export async function checkAuthentication() {
    const DESTINATION_SCREEN = 'home-screen'; 
    const user = await getMe();
    
    // Se há um usuário, renderiza o perfil e vai para a home.
    if (user) {
        renderProfile(user, DESTINATION_SCREEN); 
        
        // 🔑 CORREÇÃO 3: CHAMA O CARREGAMENTO DA LISTA DE MÍDIAS
        loadMediaList(); 
    } else {
        // Caso contrário, vai para o login.
        navigateTo('login-screen');
    }
}

/**
 * Lida com o processo de Logout.
 * **Exportada** para ser usada no listeners.js.
 */
export function handleLogout() {
    removeToken(); 
    navigateTo('login-screen'); 
    displayMessage('', false, messageElement);
}