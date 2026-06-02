
// Mudar tema
function toggle() {
    document.body.classList.toggle("dark");
}

// abrir menu automaticamente em telas grandes e fechar automaticamente em telas pequenas

// Botao ver mais e menos
const btn = document.getElementById('verBtn')
const cardsEscondidos = document.querySelectorAll('.cards:nth-child(n+4)')
let expandido = false

btn.addEventListener('click', () => {
    expandido = !expandido;

    cardsEscondidos.forEach(card => {
        card.classList.toggle('mostrar', expandido)
    })

    btn.textContent = expandido ? 'Ver menos' : 'Ver mais';
})