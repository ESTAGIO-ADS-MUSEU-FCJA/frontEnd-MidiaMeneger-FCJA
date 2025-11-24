import { getToken, removeToken, checkAuthentication } from './auth.js';
// ⚠️ CORREÇÃO DE IMPORTAÇÃO: Garante API_BASE_URL está disponível.
import { apiGetMedia, apiCreateMedia, apiDeleteMedia, apiEditMedia, API_BASE_URL, apiGetPublicMediaById } from './services/api.js'; 
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
    mediaIframe,
    mediaViewContainer,
    navigateTo

} from './ui.js'; 

// Variável para armazenar a lista de mídias carregadas (CRUCIAL para a Edição!)
let mediaList = [];

// Variável para armazenar o manipulador de eventos e poder removê-lo
let mediaCardActionHandler = null;

/**
 * Converte URLs padrão, URLs curtas e URLs de Shorts do YouTube
 * para o formato embed.
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
    
    // --- 🔑 Trata URLs do tipo /shorts/ ---
    const shortsMatch = url.match(/youtube\.com\/shorts\/([^&?%#]+)/);
    if (shortsMatch && shortsMatch[1]) {
        videoId = shortsMatch[1];
    } 
    // ---------------------------------------------
    
    // 2. Tenta extrair o ID de URLs watch?v=ID (URLs normais)
    else {
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
    }

    if (videoId) {
        // Constrói a URL Embedded (funciona para Shorts e vídeos normais)
        return `https://www.youtube.com/embed/${videoId}`;
    }

    // Se não for YouTube, retorna a URL original
    return url; 
}


/**
 * Constrói o HTML completo da página de visualização (Vídeo Vertical + Descrição),
 * utilizando um arquivo CSS externo para maior estabilidade em mobile.
 * ⚠️ ATENÇÃO: Esta função não está sendo usada no fluxo atual (renderMediaContent) 
 * mas é mantida aqui para referência, caso você opte por renderizar a página completa
 * em vez de apenas o HTML interno.
 */
function buildViewPageHTML(embedUrl, descricao) {
    // Escapa a descrição para garantir que quebras de linha sejam respeitadas
    const safeDescription = (descricao || 'Nenhuma descrição fornecida.').replace(/\n/g, '<br>');
    
    const cssPath = "./src/view-media.css"; 
    
    return `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
            <title>Visualizar Mídia Vertical</title>
            
            <link rel="stylesheet" href="${cssPath}"> 
            
        </head>
        <body>
            <div class="main-content-wrapper">
                <div class="video-container">
                    <iframe 
                        src="${embedUrl}" 
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <div class="description-area">
                    <h2>Transcrição:</h2>
                    <p>${safeDescription}</p>
                </div>
            </div>
        </body>
        </html>
    `;
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
        <div class="media-card" data-id="${id}">
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
 */
export async function loadMediaList() {
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
            const errorText = await response.text();
            throw new Error(`Falha ao carregar mídias: ${errorText || response.statusText}`);
        }

        let notasList = await response.json();
        
        // Armazena a lista na variável de escopo para uso posterior (Edição, Deleção)
        if (typeof notasList === 'object' && !Array.isArray(notasList)) {
            notasList = notasList.items && Array.isArray(notasList.items) ? notasList.items : [];
        }

        // 🔑 ESSENCIAL PARA A EDIÇÃO: Armazenar a lista atualizada
        mediaList = notasList;
        
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
export async function handleCreateOrEditMedia(e) { 
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
            // AÇÃO DE EDIÇÃO (PUT)
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
             const errorText = await response.text();
             let errorMessage = `Falha ao salvar: Status ${response.status}`;
             try {
                 const errorData = JSON.parse(errorText);
                 errorMessage = errorData.detail || errorMessage;
             } catch {}
             throw new Error(errorMessage);
        }

        displayMessage(isEditing ? 'Mídia editada com sucesso!' : 'Mídia criada com sucesso!', false, modalMessageElement);
        
        closeMediaModal();
        await loadMediaList(); // Atualiza a lista após o sucesso

    } catch (error) {
        console.error('Erro ao salvar mídia:', error);
        displayMessage(error.message, true, modalMessageElement);
    } finally {
        setButtonState(modalSubmitButton, false, defaultButtonText);
    }
}

/**
 * Lida com as ações de clique nos botões de cada card (Editar, Deletar, Visualizar).
 */
export function handleMediaCardAction(e, notasList) {
    const target = e.target.closest('.card-action-button');
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;
    
    // Usa a lista passada como argumento (que é a mediaList atualizada)
    const nota = notasList.find(n => n.id === id); 

    if (!nota) {
        displayMessage('Mídia não encontrada.', true, homeMessageElement);
        return;
    }

    switch (action) {
        case 'delete':
            // Lógica de confirmação e exclusão (DELETE)
            if (confirm(`Tem certeza que deseja deletar a mídia ID: ${id}?`)) {
                handleDeleteMedia(id);
            }
            break;
        
        case 'edit':
            // 🔑 CORREÇÃO PRINCIPAL: Usa a variável 'nota' (a mídia encontrada) 
            // no lugar da variável indefinida 'mediaItem'.
            openMediaModal(true, nota); // isEditing = true, nota = objeto completo
            break;


        case 'view':
            if (id) {
                // 1. A URL base é o próprio domínio do seu aplicativo em produção
                const DEPLOY_BASE_URL = window.location.origin; 
                
                // 2. Constrói a URL Estável que será usada no QR Code:
                const publicViewUrl = `${DEPLOY_BASE_URL}?mediaId=${id}`;

                // 3. Abre a nova janela, que será roteada pelo main.js
                const newWindow = window.open(publicViewUrl, '_blank');
                
                if (!newWindow) {
                    alert('Seu navegador bloqueou o pop-up.');
                }
                
                // O valor de 'publicViewUrl' é o link final para o seu QR Code.
            } else {
                displayMessage('ID da mídia não encontrado.', true, homeMessageElement);
            }
            break;
    }
}

/**
 * Lida com a exclusão de uma nota (DELETE).
 */
async function handleDeleteMedia(id) {
    const token = getToken();
    if (!token) {
        removeToken();
        checkAuthentication();
        return;
    }

    displayMessage('Deletando mídia...', false, homeMessageElement);

    try {
        const response = await apiDeleteMedia(id, token);

        if (response.status === 401 || response.status === 403) {
            throw new Error('Sessão expirada. Faça o login novamente.');
        }

        if (!response.ok) {
             const errorText = await response.text();
             let errorMessage = `Falha ao deletar: Status ${response.status}`;
             try {
                 const errorData = JSON.parse(errorText);
                 errorMessage = errorData.detail || errorMessage;
             } catch {}
             throw new Error(errorMessage);
        }

        displayMessage(`Mídia ID ${id} deletada com sucesso!`, false, homeMessageElement);
        await loadMediaList(); // Recarrega a lista
        
    } catch (error) {
        console.error('Erro ao deletar mídia:', error);
        displayMessage(error.message, true, homeMessageElement);
    }
}

/**
 * Adiciona listeners de clique ao grid de cards, delegando as ações.
 */
function setupMediaCardListeners(notasList) {

    // Cria um novo handler com a lista atualizada
    // O argumento 'notasList' garante que o handler usa o array de mídias mais recente.
    mediaCardActionHandler = (e) => handleMediaCardAction(e, notasList); 
    mediaCardsGrid.addEventListener('click', mediaCardActionHandler);
}

/**
 * Busca a mídia por ID e renderiza o conteúdo diretamente na tela (Para QR Code).
 */
export async function renderMediaContent(id) {
    if (!mediaViewContainer) return;
    
    // Navega para a tela de visualização (se o main.js não o fez)
    navigateTo('media-view-screen'); 
    
    mediaViewContainer.innerHTML = '<p class="info" style="text-align: center; color: white;">Carregando mídia...</p>';

    try {
        // Chamada ao endpoint público /notasnotauth/{id}
        const response = await apiGetPublicMediaById(id);
        
        if (!response.ok) {
            let errorText = await response.text();
            throw new Error(`Falha ao carregar mídia: ${response.status} - ${errorText || response.statusText}.`);
        }
        
        const nota = await response.json();
        const embedUrl = convertToEmbedUrl(nota.titulo);
        
        // Renderiza o HTML no container
        const safeDescription = (nota.descricao || 'Nenhuma descrição fornecida.').replace(/\n/g, '<br>');
        
        mediaViewContainer.innerHTML = `
            <div class="main-content-wrapper">
                <div class="video-container">
                    <iframe 
                        src="${embedUrl}" 
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
                <div class="description-area">
                    <h2>Descrição/Transcrição da Mídia</h2>
                    <p>${safeDescription}</p>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error("Erro ao carregar mídia pública:", error);
        mediaViewContainer.innerHTML = `<p class="error" style="text-align: center;">Erro: ${error.message}</p>`;
    }
}