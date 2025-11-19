// src/ui.js

// Variáveis de escopo local (inicializadas em initializeUI)
let loginScreen, profileScreen, registerScreen, homeScreen, mediaModal; 

// Variáveis exportadas para que outros módulos possam usá-las como alvo
export let messageElement, registerMessageElement, userEmailElement, userIdElement;
export let homeMessageElement; 
// Elementos do Dashboard e Modal
export let mediaCardsGrid, modalTitle, createEditForm, modalMediaIdInput, modalMediaTitleInput, modalMediaDescriptionInput, modalSubmitButton, modalCancelButton, modalMessageElement; 
export let mediaIframe; // NOVO: Para exibir o conteúdo da URL


/**
 * Captura todos os elementos DOM necessários.
 */
export function initializeUI() {
    // Telas Principais
    loginScreen = document.getElementById('login-screen');
    profileScreen = document.getElementById('profile-screen');
    registerScreen = document.getElementById('register-screen');
    homeScreen = document.getElementById('home-screen'); 

    // Modal
    mediaModal = document.getElementById('media-modal');

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
    
    // CORRIGIDO: Agora captura o ID do campo 'descricao'
    modalMediaDescriptionInput = document.getElementById('modal-media-description-input'); 
    
    modalSubmitButton = document.getElementById('modal-submit-button');
    modalCancelButton = document.getElementById('modal-cancel-button');
    modalMessageElement = document.getElementById('modal-message'); 

    // NOVO: Elemento Iframe
    mediaIframe = document.getElementById('media-iframe');
}

/**
 * Navega entre as telas da aplicação.
 */
export function navigateTo(screenId) {
    const allScreens = [
        loginScreen, profileScreen, registerScreen, homeScreen,
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
 * Abre o Modal de Mídia, configurando-o para Criar, Editar ou Visualizar.
 * @param {boolean} isEditing - true se for modo edição.
 * @param {object} nota - O objeto de nota, se for edição ou visualização.
 * @param {boolean} isViewing - true se for modo visualização de conteúdo externo.
 */
export function openMediaModal(isEditing = false, nota = null, isViewing = false) {
    if (!mediaModal || !createEditForm || !modalMediaTitleInput || !modalMediaDescriptionInput) return;

    displayMessage('', false, modalMessageElement);
    
    // --- Lógica de Preenchimento e Estado ---
    
    const isReadOnly = isViewing;
    
    // Define o estado de leitura dos campos
    modalMediaTitleInput.readOnly = isReadOnly;
    modalMediaDescriptionInput.readOnly = isReadOnly;
    
    // Garante que o formulário está visível/escondido e limpo
    createEditForm.classList.toggle('hidden', isViewing && !isEditing);
    modalSubmitButton.classList.remove('hidden'); // Começa mostrando o botão
    
    // Gerencia a visibilidade do Iframe (visualização externa)
    if (mediaIframe) {
        mediaIframe.classList.toggle('hidden', !isViewing);
    }
    
    // Preenche os campos (se for Edição ou Visualização)
    if (nota) {
        modalMediaIdInput.value = nota.id || '';
        modalMediaTitleInput.value = nota.titulo || ''; 
        modalMediaDescriptionInput.value = nota.descricao || ''; 
    } else {
        createEditForm.reset(); 
        modalMediaIdInput.value = ''; 
    }

    // --- Configuração do Modo ---
    
    if (isViewing) {
        modalTitle.textContent = 'Visualizando Mídia ID: ' + nota.id;
        modalSubmitButton.classList.add('hidden'); // Esconde submissão na visualização
        modalCancelButton.textContent = 'Fechar';
    } else if (isEditing) {
        modalTitle.textContent = 'Editar Mídia ID: ' + nota.id;
        modalSubmitButton.textContent = 'Salvar Alterações';
        modalSubmitButton.className = 'action-button orange-bg';
        modalCancelButton.textContent = 'Cancelar';
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