const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links'); 

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active'); 
});

document.querySelectorAll('.nav-links a').forEach(link => { 
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active'); 
    });
});

function toggleGaleria(elementoClicado) {
    // 1. Gira a setinha alterando a classe do cabeçalho
    elementoClicado.classList.toggle('active');
    
    // 2. Encontra o container de fotos que está logo abaixo deste cabeçalho
    const galeriaFotos = elementoClicado.nextElementSibling;
    
    // 3. Abre ou fecha adicionando a classe correspondente
    if (galeriaFotos) {
        galeriaFotos.classList.toggle('show');
    }
}