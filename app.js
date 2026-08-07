
let todosLosLibros = [];

document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("search");
    const filtroCategoria = document.getElementById("filtro-categoria");
    // const btnTema = document.getElementById("btn-tema");

    // 1. Configurar Modo Oscuro persistente con LocalStorage
    // if(localStorage.getItem("tema") === "light"){
    // document.body.classList.add("light-mode");
    // btnTema.textContent="🌙 Modo";
    // }

    // btnTema.addEventListener("click",()=>{
    //     document.body.classList.toggle("light-mode");
    //     if(document.body.classList.contains("light-mode")){
    //         localStorage.setItem("tema","light");
    //         btnTema.textContent="🌙 Modo"
    //     }else{
    //         localStorage.setItem("tema","dark");
    //         btnTema.textContent="☀️ Modo";
    //     }
    // });

    // 2. Escuchar filtros de búsqueda y categoría en tiempo real
    buscador.addEventListener("input", filtrarLibros);
    filtroCategoria.addEventListener("change", filtrarLibros);

    obtenerLibros();
});

async function obtenerLibros() {
    try {
        const respuesta = await fetch("libros.json");
        todosLosLibros = await respuesta.json();
        
        configurarCategorias(todosLosLibros);
        mostrarLibros(todosLosLibros);
    } catch (error) {
        console.error("Error:", error);
    }
}

// Genera las opciones del menú desplegable dinámicamente sin repetir nombres
function configurarCategorias(libros) {
    const filtroCategoria = document.getElementById("filtro-categoria");
    const categorias = ["todos", ...new Set(libros.map(l => l.category))];
    
    filtroCategoria.innerHTML = ""; // Limpia por si acaso
    
    categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat === "todos" ? "General" : cat;
        filtroCategoria.appendChild(option);
    });
}

// Combina el buscador de texto con la categoría seleccionada
function filtrarLibros() {
    const texto = document.getElementById("search").value.toLowerCase();
    const categoriaSeleccionada = document.getElementById("filtro-categoria").value;

    const filtrados = todosLosLibros.filter(libro => {
        const coincideTexto = libro.title.toLowerCase().includes(texto) || 
                              libro.author.toLowerCase().includes(texto);
        
        const coincideCategoria = categoriaSeleccionada === "todos" || 
                                  libro.category === categoriaSeleccionada;

        return coincideTexto && coincideCategoria;
    });

    mostrarLibros(filtrados);
}

function mostrarLibros(listaDeLibros) {

    const contenedor = document.getElementById("books");

    contenedor.innerHTML = "";

    document.getElementById("booksCount").textContent =
        todosLosLibros.length;

    document.getElementById("resultsText").textContent =
        `${listaDeLibros.length} libros`;

    document.getElementById("categoriesCount").textContent =
        new Set(todosLosLibros.map(l => l.category)).size;

    if (listaDeLibros.length === 0) {

        contenedor.innerHTML = `
            <h2 style="grid-column:1/-1;text-align:center">
                No se encontraron resultados.
            </h2>
        `;

        return;

    }

    listaDeLibros.forEach(libro => {

        const tarjeta = document.createElement("div");

        tarjeta.className = "channel-card";

        tarjeta.innerHTML = `

            <div class="channel-image-wrapper">
                <a  href="${libro.link_drive}" target="_blank" rel="noopener noreferrer">
                    <img
                        src="https://drive.google.com/thumbnail?id=${obtenerIdDrive(libro.link_drive)}&sz=w500"
                        class="channel-image"
                        alt="${libro.title}"
                        onerror="this.src='/img/driveImg.png'"
                    >
                </a>
            </div>

            <div class="channel-info">

                <div class="channel-name" title="${libro.title}">
                    ${libro.title}
                </div>

                <div class="book-author">
                    ${libro.author}
                </div>

                <div class="channel-category" title="${libro.category}">
                    ${libro.category}
                </div>

                <div class="buttons">

                    <a
                        href="${libro.link_drive}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src="/img/drive.svg" alt="Drive" class="icon">

                    </a>
                    <a
                        href="${libro.link_telegram}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img src="/img/tg.webp" alt="Telegram" class="icon">
                    </a>

                </div>

            </div>

        `;

        contenedor.appendChild(tarjeta);

    });

}

function obtenerIdDrive(url){

    const match = url.match(/\/d\/([^/]+)/);

    return match ? match[1] : "";

}


