// 1. Defina a URL para onde você deseja redirecionar
const urlDeDestino = "https://seu-qrcode.vercel.app/"
// 2. Encontra o botão usando seu ID
// O código é executado somente quando o HTML está carregado
const botaoRedirecionar = document.getElementById('redirect-qrcode-button');

// 3. Adiciona um "ouvinte de evento" para o clique
// O '?' (optional chaining) garante que o código não dará erro se o botão não for encontrado
botaoRedirecionar?.addEventListener('click', function() {
    // 4. Redireciona o navegador para a URL de destino
    window.location.href = urlDeDestino;
});