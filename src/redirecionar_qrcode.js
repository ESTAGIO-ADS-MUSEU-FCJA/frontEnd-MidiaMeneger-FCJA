// 1. Defina a URL para onde você deseja redirecionar
const urlDeDestino = "https://qrcodecreator.com/pt?gclid=Cj0KCQiAoZDJBhC0ARIsAERP-F9tq1a3Juvu_-qjuqMD2YhroJHo5JkgLD7yGvFEcBVVGLQE91sd0wIaAgYsEALw_wcB&AdId=722224834698&keyword=gerador%20qr&matchtype=e&device=c&devicemodel=&loc=9101452&network=g&place=&campaignid=21933808051&gad_source=1&gad_campaignid=21933808051&gbraid=0AAAAAqLtWn0zRe_2Fk_D3SkCBszOvaP5S&gclid=Cj0KCQiAoZDJBhC0ARIsAERP-F9tq1a3Juvu_-qjuqMD2YhroJHo5JkgLD7yGvFEcBVVGLQE91sd0wIaAgYsEALw_wcB"; 

// 2. Encontra o botão usando seu ID
// O código é executado somente quando o HTML está carregado
const botaoRedirecionar = document.getElementById('redirect-qrcode-button');

// 3. Adiciona um "ouvinte de evento" para o clique
// O '?' (optional chaining) garante que o código não dará erro se o botão não for encontrado
botaoRedirecionar?.addEventListener('click', function() {
    // 4. Redireciona o navegador para a URL de destino
    window.location.href = urlDeDestino;
});