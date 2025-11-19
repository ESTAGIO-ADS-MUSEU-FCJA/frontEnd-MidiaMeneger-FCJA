// src/listeners.js

import { handleLogin, handleRegister, handleLogout, checkAuthentication } from './auth.js';
import { navigateTo, openMediaModal, closeMediaModal } from './ui.js';
import { handleCreateOrEditMedia } from './media.js'; 

// --- Captura de Elementos ---
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterButton = document.getElementById('show-register-button');
const showLoginButton = document.getElementById('show-login-button');
const homeLogoutButton = document.getElementById('home-logout-button');
const createNewMediaButton = document.getElementById('create-new-media-button'); 
const closeModalButton = document.querySelector('#media-modal .close-button');
const createEditForm = document.getElementById('create-edit-form'); 
const modalCancelButton = document.getElementById('modal-cancel-button');


export function setupAuthListeners() {
    // 1. Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão
            
            // 1.1 Captura as credenciais
            const email = loginForm.querySelector('#email').value;
            const senha = loginForm.querySelector('#senha').value;
            const credentials = { email, senha };
            
            // 1.2 Captura os elementos de UI (assumindo IDs)
            const loginButton = document.getElementById('login-button'); 
            const messageElement = document.getElementById('message');

            handleLogin(credentials, loginButton, messageElement);
        });
    }

    // 2. Cadastro
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o envio padrão
            
            // 2.1 Captura as credenciais (usando os IDs do formulário de registro)
            const email = registerForm.querySelector('#register-email').value;
            const senha = registerForm.querySelector('#register-senha').value;
            const credentials = { email, senha };
            
            // 2.2 Captura os elementos de UI (assumindo IDs)
            const registerButton = document.getElementById('register-button');
            const messageElement = document.getElementById('register-message');
            
            handleRegister(credentials, registerButton, messageElement);
        });
    }

    // 3. Navegação Login <-> Cadastro
    if (showRegisterButton) {
        showRegisterButton.addEventListener('click', () => navigateTo('register-screen'));
    }
    if (showLoginButton) {
        showLoginButton.addEventListener('click', () => navigateTo('login-screen'));
    }

    // 4. Logout
    if (homeLogoutButton) {
        homeLogoutButton.addEventListener('click', handleLogout);
    }

    // 5. Ação: Criar Nova Mídia (Abre o Modal em modo Criação)
    if (createNewMediaButton) {
        createNewMediaButton.addEventListener('click', () => {
            openMediaModal(false); // isEditing = false, isViewing = false (padrão)
        });
    }
    
    // 6. Fechar Modal (Botão X)
    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeMediaModal);
    }
    
    // Fechar modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        const mediaModal = document.getElementById('media-modal');
        if (event.target === mediaModal) {
            closeMediaModal();
        }
    });

    // 7. Listener de Submissão do Formulário de Criação/Edição (POST/PUT)
    if (createEditForm) {
        createEditForm.addEventListener('submit', handleCreateOrEditMedia);
    }

    // 8. Listener de Cancelamento do Modal
    if (modalCancelButton) {
        modalCancelButton.addEventListener('click', closeMediaModal);
    }
}


// Função de Inicialização (Chamada no seu main.js)
export function initializeApp() {
    setupAuthListeners();
    // Verifica a autenticação ao carregar a página
    checkAuthentication(); 
}