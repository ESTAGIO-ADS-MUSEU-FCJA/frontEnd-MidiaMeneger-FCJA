// src/media.js

import { getToken, removeToken, checkAuthentication } from './auth.js';
// CORREÇÃO 1: Adicionando apiEditMedia para a funcionalidade PUT (Edição)
import { apiGetMedia, apiCreateMedia, apiDeleteMedia, apiEditMedia } from './services/api.js'; 
import { 
    mediaCardsGrid, 
    displayMessage, 
    homeMessageElement, 
    openMediaModal, 
    closeMediaModal, 
    modalTitle, 
    modalMessageElement, 
    modalMediaIdInput, 
    modalMediaTitleInput, 
    modalMediaDescriptionInput, 
    modalSubmitButton, 
    createEditForm, 
    setButtonState,
    mediaIframe
} from './ui.js'; 


// --- Funções Auxiliares de Tratamento de URL ---

/**
 * Converte URLs padrão do YouTube para o formato embed.
 */
function convertToEmbedUrl(url) {
    if (!url || typeof url !== 'string') {
        return '';
    }
    
    // 1. Já está no formato embed?
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
        return url;
    }
    
    let videoId = null;
    
    // 2. Tenta extrair o ID de URLs watch?v=ID
    const watchMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|\w\/\w\/|v=|watch\?v=))([^&?%#]+)/);
    if (watchMatch && watchMatch[1]) {
        videoId = watchMatch[1];
    } 
    
    // 3. Tenta extrair o ID de URLs curtas youtu.be/ID
    else {
        const shortMatch = url.match(/youtu\.be\/([^&?%#]+)/);
        if (shortMatch && shortMatch[1]) {
            videoId = shortMatch[1];
        }
    }

    if (videoId) {
        // Constrói a URL Embedded
        return `https://www.youtube.com/embed/${videoId}`;
    }

    return url; 
}


// --- Funções de Renderização ---

/**
 * Renderiza um único card de mídia no grid.
 */
function createMediaCardHTML(nota) {
    
    const id = nota.id || 'N/A';
    const titulo = nota.titulo || 'URL não fornecida'; // O campo 'titulo' é a URL
    const descricao = nota.descricao || 'Descrição não fornecida'; // O campo 'descricao' é a descrição
    
    const shortUrl = titulo.length > 30 ? titulo.substring(0, 30) + '...' : titulo;
    const shortDescription = descricao.length > 50 ? descricao.substring(0, 50) + '...' : descricao;
    
    return `
        <div class="media-card" data-media-id="${id}">
            <div class="media-card-info">
                <strong>ID:</strong> <span>${id}</span>
                <strong>URL:</strong> <span>${shortUrl}</span>
                <strong>Descrição:</strong> <span>${shortDescription}</span>
            </div>
            <div class="media-card-actions">
                <button class="card-action-button delete-icon" data-action="delete" data-id="${id}">
                    &#x1F5D1; 
                </button>
                <button class="card-action-button edit-icon" data-action="edit" data-id="${id}">
                    &#x270E; 
                </button>
                <button class="card-action-button view-icon" data-action="view" data-id="${id}">
                    &#x1F441;
                </button>
            </div>
        </div>
    `;
}

/**
 * Responsável por renderizar a lista completa de mídias no Dashboard.
 */
function renderMediaList(notasList) {
    if (!mediaCardsGrid) return;

    if (!notasList || notasList.length === 0) {
        mediaCardsGrid.innerHTML = '<p id="no-media-message">Nenhuma mídia foi encontrada. Crie a primeira!</p>';
        return;
    }

    const cardsHTML = notasList.map(createMediaCardHTML).join('');
    mediaCardsGrid.innerHTML = cardsHTML;
    
    // Configura os event listeners para os botões dos cards
    setupMediaCardListeners(notasList);
}

/**
 * Função principal para buscar e exibir todas as mídias (GET).
 * * ATENÇÃO: Mudança feita aqui para remover o 'export' e evitar o erro de exportação duplicada.
 */
async function loadMediaList() {
    const token = getToken();
    if (!token) {
        displayMessage('Erro: Token não encontrado. Faça o login novamente.', true, homeMessageElement);
        checkAuthentication(); 
        return;
    }

    displayMessage('Carregando mídias...', false, homeMessageElement);
    
    try {
        const response = await apiGetMedia(token);

        if (response.status === 401 || response.status === 403) {
            removeToken();
            checkAuthentication();
            displayMessage('Sessão expirada. Faça o login novamente.', true, homeMessageElement);
            return;
        }

        if (!response.ok) {
            // ... (Lógica de erro)
        }

        let notasList = await response.json();
        
        // Ajusta para o formato esperado (garante que notasList é um array)
        if (typeof notasList === 'object' && !Array.isArray(notasList)) {
             notasList = notasList.items && Array.isArray(notasList.items) ? notasList.items : [];
        }
        
        renderMediaList(notasList);
        displayMessage(`Total de mídias carregadas: ${notasList.length || 0}.`, false, homeMessageElement);

    } catch (error) {
        console.error('Erro ao carregar lista de mídias:', error);
        mediaCardsGrid.innerHTML = '<p class="error">Falha ao carregar dados. Verifique a API.</p>';
        displayMessage(error.message, true, homeMessageElement);
    }
}


// --- Funções de Ação dos Cards (Modal) e CRUD ---

/**
 * Lida com a submissão do formulário de criação/edição (POST/PUT).
 */
async function handleCreateOrEditMedia(e) {
    e.preventDefault();
    
    const token = getToken();
    const isEditing = !!modalMediaIdInput.value; 
    const defaultButtonText = isEditing ? 'Salvar Alterações' : 'Criar Mídia';
    
    setButtonState(modalSubmitButton, true, defaultButtonText, 'Enviando...');

    // Usa 'titulo' (URL) e 'descricao' (descrição/transcrição)
    const data = {
        titulo: modalMediaTitleInput.value,
        descricao: modalMediaDescriptionInput.value, 
    };
    
    try {
        let response;
        if (isEditing) {
            // AÇÃO DE EDIÇÃO (PUT) - Implementado
            const mediaId = modalMediaIdInput.value;
            response = await apiEditMedia(mediaId, data, token);
        } else {
            // AÇÃO DE CRIAÇÃO (POST)
            response = await apiCreateMedia(data, token);
        }

        if (response.status === 401 || response.status === 403) {
             throw new Error('Sessão expirada. Faça o login novamente.');
        }

        if (!response.ok) {
             // Tenta ler o erro, se houver
             const errorText = await response.text();
             let errorMessage = `Falha ao salvar: Status ${response.status}`;
             try {
                 const errorData = JSON.parse(errorText);
                 errorMessage = errorData.detail || errorData.message || errorMessage;
             } catch {
                 if (errorText) errorMessage = errorText;
             }
             throw new Error(errorMessage);
        }

        const result = await response.json();

        displayMessage(`Mídia salva com sucesso! ID: ${result.id || 'N/A'}`, false, homeMessageElement);
        closeMediaModal();
        
        await loadMediaList(); 

    } catch (error) {
        console.error('Erro ao salvar mídia:', error);
        displayMessage(error.message, true, modalMessageElement);
    } finally {
        setButtonState(modalSubmitButton, false, defaultButtonText);
    }
}

/**
 * Lida com a visualização do conteúdo (Iframe Embed).
 */
function handleViewMedia(nota) {
    // 1. Prepara o modal para visualização
    modalTitle.textContent = 'Visualizando Conteúdo';
    modalMediaTitleInput.value = nota.titulo;
    modalMediaDescriptionInput.value = nota.descricao;
    
    // 2. Converte a URL para o formato embed do YouTube e carrega no iframe
    const embedUrl = convertToEmbedUrl(nota.titulo);
    if (mediaIframe) {
        mediaIframe.src = embedUrl;
    }
    
    // 3. Abre o modal no modo visualização (isEditing=false, isViewing=true)
    openMediaModal(false, nota, true); 

    displayMessage(`Visualizando: ${nota.titulo.substring(0, 50)}...`, false, homeMessageElement);
}

/**
 * Lida com a abertura do modal em modo edição (PUT).
 */
function handleEditMedia(nota) {
    // 1. Garante que o iframe está invisível
    if (mediaIframe) {
        mediaIframe.src = '';
    }
    // 2. Pré-preenche os campos
    modalMediaIdInput.value = nota.id;
    modalMediaTitleInput.value = nota.titulo;
    modalMediaDescriptionInput.value = nota.descricao;

    // 3. Abre o modal no modo edição (isEditing=true, isViewing=false)
    openMediaModal(true, nota, false); 
}


/**
 * Lida com a deleção de uma nota (DELETE /notas/deletar{id}).
 */
async function handleDeleteMedia(nota) {
    if (!confirm(`Tem certeza que deseja DELETAR a Mídia ID ${nota.id}?`)) {
        return;
    }

    const token = getToken();
    if (!token) {
        displayMessage('Erro de autenticação.', true, homeMessageElement);
        checkAuthentication();
        return;
    }

    displayMessage(`Deletando Mídia ID ${nota.id}...`, false, homeMessageElement);

    try {
        const response = await apiDeleteMedia(nota.id, token);

        if (response.status === 401 || response.status === 403) {
            removeToken();
            checkAuthentication();
            displayMessage('Sessão expirada. Faça o login novamente.', true, homeMessageElement);
            return;
        }

        if (!response.ok) {
            // Tenta ler o erro, se houver
            const errorText = await response.text();
            let errorMessage = `Falha ao deletar: Status ${response.status}`;
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.detail || errorData.message || errorMessage;
            } catch {
                if (errorText) errorMessage = errorText;
            }
            throw new Error(errorMessage);
        }
        
        displayMessage(`Mídia ID ${nota.id} deletada com sucesso.`, false, homeMessageElement);
        
        await loadMediaList(); 

    } catch (error) {
        console.error('Erro ao deletar mídia:', error);
        displayMessage(error.message, true, homeMessageElement);
    }
}

/**
 * Função para configurar listeners de clique em todos os botões de ação dos cards.
 */
function setupMediaCardListeners(notasList) {
    if (!mediaCardsGrid) return;

    // Adiciona listener diretamente no grid para capturar todos os cliques nos botões
    // O listener é removido e re-adicionado a cada renderização para evitar duplicação.
    // É uma prática mais simples para este cenário.

    // Remove o listener existente (se houver, para evitar duplicação)
    const oldListener = mediaCardsGrid.mediaListener;
    if (oldListener) {
        mediaCardsGrid.removeEventListener('click', oldListener);
    }

    const newListener = (e) => {
        const button = e.target.closest('.card-action-button');
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;
        const nota = notasList.find(m => String(m.id) === id); 

        if (!nota) {
            displayMessage(`Nota ID ${id} não encontrada.`, true, homeMessageElement);
            return;
        }

        switch (action) {
            case 'view':
                handleViewMedia(nota);
                break;
            case 'edit':
                handleEditMedia(nota);
                break;
            case 'delete':
                handleDeleteMedia(nota);
                break;
            default:
                break;
        }
    };

    mediaCardsGrid.addEventListener('click', newListener);
    mediaCardsGrid.mediaListener = newListener; // Armazena a referência para poder remover depois
}

// CORREÇÃO 2: Exportação única no final do módulo.
export { loadMediaList, handleCreateOrEditMedia };