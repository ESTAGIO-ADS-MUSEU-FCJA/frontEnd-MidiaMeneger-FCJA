// src/main.js

import { checkAuthentication } from './auth.js';
import { initializeUI, navigateTo } from './ui.js';
import { renderMediaContent } from './media.js'; 
// 🔑 CORREÇÃO CRÍTICA 1: Importa a função de configuração de eventos
import { setupAuthListeners } from './listeners.js'; 

function initializeApp() {
    initializeUI();
    
    // 🔑 CORREÇÃO CRÍTICA 2: Configura todos os Listeners IMEDIATAMENTE.
    // Isso garante que os botões de login/cadastro/modal funcionem desde o início.
    setupAuthListeners(); 
    
    // 1. Verifica se há um ID de mídia na URL (Visualização Pública via QR Code)
    const urlParams = new URLSearchParams(window.location.search);
    const mediaIdFromUrl = urlParams.get('mediaId');

    if (mediaIdFromUrl) {
        // ROTA PÚBLICA:
        // Navega para a tela de visualização e inicia o carregamento do conteúdo
        navigateTo('media-view-screen'); 
        renderMediaContent(mediaIdFromUrl); 
        return; // Pára a execução, não vai para login/home
    }

    // 2. ROTA NORMAL (usuário abrindo a aplicação principal)
    // Isso iniciará o fluxo de login/dashboard e carregará as mídias.
    checkAuthentication(); 
}

// Garanta que initializeApp() é chamada
window.addEventListener('load', initializeApp);