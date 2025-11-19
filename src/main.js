// src/main.js

import { setupAuthListeners } from './listeners.js';
import { initializeUI } from './ui.js'; 
import { loadMediaList } from './media.js'; 
import { checkAuthentication } from './auth.js'; 


/**
 * Função chamada após o login para carregar o dashboard e os dados.
 */
async function initializeDashboard() {
    // 1. Verifica autenticação. Se OK, navega para 'home-screen'.
    await checkAuthentication(); 
    
    // 2. Se a navegação foi para a home-screen (sucesso), carrega as mídias.
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen && !homeScreen.classList.contains('hidden')) {
        await loadMediaList(); 
    }
}

// Inicializa a aplicação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa todos os elementos DOM
    initializeUI();
    
    // 2. Configura todos os ouvintes de eventos
    setupAuthListeners();
    
    // 3. Verifica o estado de autenticação e carrega a lista de mídias
    initializeDashboard();
});