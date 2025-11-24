// src/listeners.js

import { handleLogin, handleRegister, handleLogout } from './auth.js'; 
import { navigateTo, openMediaModal, closeMediaModal, mediaCardsGrid } from './ui.js';
import { handleCreateOrEditMedia, handleMediaCardAction } from './media.js'; 

export function setupAuthListeners() {
    // 🔑 CORREÇÃO: Captura de elementos DO DASHBOARD garantida DENTRO DA FUNÇÃO
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterButton = document.getElementById('show-register-button');
    const showLoginButton = document.getElementById('show-login-button');
    
    // Captura dos botões do Dashboard
    const homeLogoutButton = document.getElementById('home-logout-button');
    const createNewMediaButton = document.getElementById('create-new-media-button'); 
    
    // Captura dos elementos do Modal
    const closeModalButton = document.querySelector('#media-modal .close-button');
    const createEditForm = document.getElementById('create-edit-form'); 
    const modalCancelButton = document.getElementById('modal-cancel-button');
    
    // NOTA: mediaCardsGrid agora é importado do ui.js

    // 1. Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const email = loginForm.querySelector('#email').value;
            const senha = loginForm.querySelector('#senha').value;
            const credentials = { email, senha };
            const loginButton = document.getElementById('login-button'); 
            const messageElement = document.getElementById('message');

            handleLogin(credentials, loginButton, messageElement);
        });
    }

    // 2. Cadastro
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const email = registerForm.querySelector('#register-email').value;
            const senha = registerForm.querySelector('#register-senha').value;
            const credentials = { email, senha };
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

    // 4. Deslogar (Logout)
    if (homeLogoutButton) {
        homeLogoutButton.addEventListener('click', handleLogout); // 🎉 Deve funcionar agora!
    }

    // 5. Ação: Criar Nova Mídia (Abre o Modal em modo Criação)
    if (createNewMediaButton) {
        createNewMediaButton.addEventListener('click', () => {
            openMediaModal(false); // 🎉 Deve funcionar agora!
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