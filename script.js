
// Mudar tema
function toggle() {
    document.body.classList.toggle("dark");
}

// abrir e fechar menu


// abrir menu automaticamente em telas grandes e fechar automaticamente em telas pequenas

const btn = document.getElementById('verBtn')
const cardsEscondidos = document.querySelectorAll('.cards:nth-child(n+3)')
let expandido = false

btn.addEventListener('click', () => {
    expandido = !expandido;

    cardsEscondidos.forEach(card => {
        card.classList.toggle('mostrar', expandido)
    })

    btn.textContent = expandido ? 'Ver menos' : 'Ver mais';
})