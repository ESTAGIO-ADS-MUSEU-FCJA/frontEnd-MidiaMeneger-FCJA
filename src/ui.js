// src/ui.js

// Variáveis de escopo local (agora incluem a tela de visualização)
let loginScreen, profileScreen, registerScreen, homeScreen, mediaModal, mediaViewScreen; 

// Variáveis exportadas para que outros módulos possam usá-las como alvo
export let messageElement, registerMessageElement, userEmailElement, userIdElement;
export let homeMessageElement; 
// Elementos do Dashboard e Modal
export let mediaCardsGrid, modalTitle, createEditForm, modalMediaIdInput, modalMediaTitleInput, modalMediaDescriptionInput, modalSubmitButton, modalCancelButton, modalMessageElement; 
export let mediaIframe; 

// 🔑 CORREÇÃO: Variável de Container de Visualização deve ser exportada
export let mediaViewContainer; 


/**
 * Captura todos os elementos DOM necessários.
 */
export function initializeUI() {
    // Telas Principais
    loginScreen = document.getElementById('login-screen');
    profileScreen = document.getElementById('profile-screen');
    registerScreen = document.getElementById('register-screen');
    homeScreen = document.getElementById('home-screen'); 
    // 🔑 CORREÇÃO: Captura da tela de visualização
    mediaViewScreen = document.getElementById('media-view-screen'); 

    // Modal
    mediaModal = document.getElementById('media-modal');

    // 🔑 CORREÇÃO: Captura do container de visualização
    mediaViewContainer = document.getElementById('media-view-container');

    // Elementos de Feedback e Perfil
    messageElement = document.getElementById('message');
    registerMessageElement = document.getElementById('register-message');
    userEmailElement = document.getElementById('user-email');
    userIdElement = document.getElementById('user-id');
    homeMessageElement = document.getElementById('home-message');
    
    // Elementos do Dashboard/Modal
    mediaCardsGrid = document.getElementById('media-cards-grid');

    // Elementos do Formulário no Modal
    modalTitle = document.getElementById('modal-title');
    createEditForm = document.getElementById('create-edit-form');
    modalMediaIdInput = document.getElementById('modal-media-id-input');
    modalMediaTitleInput = document.getElementById('modal-media-title-input');
    
    // Captura o ID do campo 'descricao'
    modalMediaDescriptionInput = document.getElementById('modal-media-description-input'); 
    
    modalSubmitButton = document.getElementById('modal-submit-button');
    modalCancelButton = document.getElementById('modal-cancel-button');
    modalMessageElement = document.getElementById('modal-message'); 

    // Elemento Iframe
    mediaIframe = document.getElementById('media-iframe');
}

/**
 * Navega entre as telas da aplicação.
 * Adicionada a nova tela 'mediaViewScreen' à lista de telas.
 */
export function navigateTo(screenId) {
    const allScreens = [
        loginScreen, profileScreen, registerScreen, homeScreen,
        mediaViewScreen // 🔑 CORREÇÃO: Incluída a nova tela aqui
    ];
    allScreens.forEach(screen => {
        if (screen) {
            screen.classList.add('hidden');
        }
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

/**
 * Exibe uma mensagem de feedback.
 */
export function displayMessage(text, isError = false, element = messageElement) {
    if (element) {
        element.textContent = text;
        // Usa as classes de feedback definidas no CSS (error, info)
        element.className = isError ? 'error' : 'info'; 
    }
}

/**
 * Desabilita/habilita um botão.
 */
export function setButtonState(button, isDisabled, defaultText, loadingText = 'Carregando...') {
    if (button) {
        button.disabled = isDisabled;
        button.textContent = isDisabled ? loadingText : defaultText;
    }
}

/**
 * Abre o Modal de Mídia, configurando-o para Criar ou Editar.
 * A lógica de `isViewing` é mantida para compatibilidade, mas a visualização externa
 * (via botão de olho) não a utiliza mais.
 */
export function openMediaModal(isEditing = false, nota = null, isViewing = false) {
    if (!mediaModal || !createEditForm || !modalMediaTitleInput || !modalMediaDescriptionInput) return;

    // Limpa mensagens
    displayMessage('', false, modalMessageElement);
    
    const isReadOnly = isViewing && !isEditing;
    
    // Define o estado de leitura dos campos
    modalMediaTitleInput.readOnly = isReadOnly;
    modalMediaDescriptionInput.readOnly = isReadOnly;
    
    // Garante que o formulário está visível/escondido
    createEditForm.classList.toggle('hidden', isViewing && !isEditing);
    modalSubmitButton.classList.toggle('hidden', isViewing && !isEditing);
    
    // O iframe só deve ser visível se estivermos em modo de visualização interna
    if (mediaIframe) {
        mediaIframe.classList.toggle('hidden', !isViewing); 
        mediaIframe.src = isViewing && nota && nota.titulo ? nota.titulo : '';
    }
    
    // Preenche os campos (se for Edição)
    if (nota) {
        modalMediaIdInput.value = nota.id || '';
        modalMediaTitleInput.value = nota.titulo || ''; 
        modalMediaDescriptionInput.value = nota.descricao || ''; 
    } else {
        createEditForm.reset(); 
        modalMediaIdInput.value = ''; 
    }

    // --- Configuração do Modo ---
    
    if (isEditing) {
        modalTitle.textContent = 'Editar Mídia ID: ' + nota.id;
        modalSubmitButton.textContent = 'Salvar Alterações';
        modalSubmitButton.className = 'action-button orange-bg';
        modalCancelButton.textContent = 'Cancelar';
    } else if (isViewing) {
        modalTitle.textContent = 'Visualizar Mídia ID: ' + nota.id;
    } else { // Modo Criação
        modalTitle.textContent = 'Criar Nova Mídia';
        modalSubmitButton.textContent = 'Criar Mídia';
        modalSubmitButton.className = 'action-button green-bg';
        modalCancelButton.textContent = 'Cancelar';
    }

    mediaModal.classList.remove('hidden');
}

/**
 * Fecha o Modal de Mídia e limpa o formulário e iframe.
 */
export function closeMediaModal() {
    if (mediaModal) {
        mediaModal.classList.add('hidden');
        createEditForm.reset(); 
        if (mediaIframe) {
            mediaIframe.src = ''; // Limpa o iframe
        }
    }
}

/**
 * Renderiza informações do usuário na tela de perfil.
 */
export function renderProfile(user, screenId = 'profile-screen') {
    if (userEmailElement && userIdElement) {
        userEmailElement.textContent = user.email;
        userIdElement.textContent = user.id;
    }
    navigateTo(screenId);
}