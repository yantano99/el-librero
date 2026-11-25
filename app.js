let todosLosLibros = [];
let librosFiltrados = [];
let paginaActual = 1;
const librosPorPagina = 30;

document.addEventListener("DOMContentLoaded", () => {
    const buscador = document.getElementById("search");
    const filtroCategoria = document.getElementById("filtro-categoria");
    const btnTema = document.getElementById("btn-tema");

    /*  1. Configurar Modo Oscuro/Claro
    if (localStorage.getItem("tema") === "dark") {
        document.body.classList.add("dark-mode");
        btnTema.textContent = "☀️ Modo Claro";
    }

    btnTema.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("tema", "dark");
            btnTema.textContent = "☀️ Modo Claro";
        } else {
            localStorage.setItem("tema", "light");
            btnTema.textContent = "🌙 Modo Oscuro";
        }
    }); */

    // 1. Configurar Modo Oscuro/Claro
    if (localStorage.getItem("tema") === "dark") {
        document.body.classList.add("dark-mode");
        btnTema.textContent = "☀️";
    }

    btnTema.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("tema", "dark");
            btnTema.textContent = "☀️";
        } else {
            localStorage.setItem("tema", "light");
            btnTema.textContent = "🌙";
        }
    });

    // 2. Escuchar filtros de búsqueda y categoría en tiempo real
    buscador.addEventListener("input", filtrarLibros);
    filtroCategoria.addEventListener("change", filtrarLibros);

    obtenerLibros();
});

/* async function obtenerLibros() {
    try {
        const respuesta = await fetch("libros.json");
        todosLosLibros = await respuesta.json();
        
        configurarCategorias(todosLosLibros);
        mostrarLibros(todosLosLibros);
    } catch (error) {
        console.error("Error:", error);
    }
}  */

async function obtenerLibros() {
    try {
        const respuesta = await fetch("libros.json");
        todosLosLibros = await respuesta.json();
        librosFiltrados = [...todosLosLibros];
        
        configurarCategorias(todosLosLibros);
        actualizarVista();
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
/* function filtrarLibros() {
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
} */

function filtrarLibros() {
    const texto = document.getElementById("search").value.toLowerCase();
    const categoriaSeleccionada = document.getElementById("filtro-categoria").value;

    librosFiltrados = todosLosLibros.filter(libro => {
        const coincideTexto = libro.title.toLowerCase().includes(texto) || 
                              libro.author.toLowerCase().includes(texto);

        const coincideCategoria = categoriaSeleccionada === "todos" || 
                                  libro.category === categoriaSeleccionada;

        return coincideTexto && coincideCategoria;
    });

    // Reiniciar siempre a la página 1 al filtrar
    paginaActual = 1;
    actualizarVista();
}

function actualizarVista() {
    const inicio = (paginaActual - 1) * librosPorPagina;
    const fin = inicio + librosPorPagina;
    const librosDeEstaPagina = librosFiltrados.slice(inicio, fin);

    mostrarLibros(librosDeEstaPagina);
    renderizarPaginacion();
}

function mostrarLibros(listaDeLibros) {
    const contenedor = document.getElementById("books");
    contenedor.innerHTML = "";

    if (listaDeLibros.length === 0) {
        contenedor.innerHTML = `
            <h2 style="grid-column:1/-1;text-align:center">
                No se encontraron resultados.
            </h2>
        `;
        return;
    }

    document.getElementById("booksCount").textContent =
        todosLosLibros.length;
    /* document.getElementById("resultsText").textContent =
        `${listaDeLibros.length} libros`; */
    document.getElementById("resultsText").textContent =
        `${librosFiltrados.length} libros`;    
    document.getElementById("categoriesCount").textContent =
        new Set(todosLosLibros.map(l => l.category)).size;

    listaDeLibros.forEach(libro => {
        const tarjeta = document.createElement("div");
        // tarjeta.className = "book-card";
        tarjeta.classList.add("book-card");

        // 1. Validación robusta: verifica que exista, que no sea "null" en texto y que no esté vacío
        const tieneEnlace = libro.link_drive && libro.link_drive.trim() !== "" && libro.link_drive.trim() !== "null";

        // 2. Generamos dinámicamente solo la sección de la imagen/enlace
        const estructuraImagen = tieneEnlace 
            ? `<a href="${libro.link_drive}" target="_blank" rel="noopener noreferrer">
                    <img src="https://drive.google.com/thumbnail?id=${obtenerIdDrive(libro.link_drive)}&sz=w500" 
                        class="book-image" alt="${libro.title}" onerror="this.src='img/driveImg.png'">
            </a>`
            : `<img src="https://previews.123rf.com/images/blankstock/blankstock1402/blankstock140200180/25706852-no-pdf-file-document-icon-download-pdf-button-pdf-file-symbol-red-prohibition-sign-stop-symbol.jpg" 
                    class="book-image" alt="No disponible">`;
        
        // 3. Renderizamos una sola plantilla limpia sin duplicar la información del libro
        tarjeta.innerHTML = `
        
            <div class="book-image-wrapper">
                ${estructuraImagen}
            </div>

            <div class="book-info">
                <!--<div class="book-name" title="${libro.title}">
                    ${libro.title}
                </div>-->

                <h3 class="book-name" title="${libro.title}"><strong>${libro.title}</strong></h3>

                <!--<div class="book-author">
                    ${libro.author}
                </div>-->

                <p class="book-author">${libro.author}</p>

                <!--<div class="book-category" title="${libro.category}">
                    ${libro.category}
                </div>-->

                <p class="book-category" title="${libro.category}">${libro.category}</p>

                <!--<div class="book-category" title="${libro.theme}">
                    ${libro.theme}
                </div>-->

                <p class="book-category" title="${libro.theme}">${libro.theme}</p>

                <!-- aqui iba el div class buttons-->
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function obtenerIdDrive(url){
    const match = url.match(/\/d\/([^/]+)/);
    return match ? match[1] : "";
}

function renderizarPaginacion() {
    const contenedorPaginacion = document.getElementById("paginacion");
    contenedorPaginacion.innerHTML = "";

    const totalPaginas = Math.ceil(librosFiltrados.length / librosPorPagina);
    if (totalPaginas <= 1) return;

    // Botón Anterior
    const btnAnterior = document.createElement("button");
    // btnAnterior.textContent = "« Anterior";
    btnAnterior.textContent = "<";
    btnAnterior.disabled = paginaActual === 1;
    btnAnterior.onclick = () => cambiarPagina(paginaActual - 1);
    contenedorPaginacion.appendChild(btnAnterior);

    // Indicador de página actual
    const info = document.createElement("span");
    // info.textContent = ` Página ${paginaActual} de ${totalPaginas} (${librosFiltrados.length} libros) `;
    info.textContent = ` Página ${paginaActual} de ${totalPaginas} `;
    contenedorPaginacion.appendChild(info);

    // Botón Siguiente
    const btnSiguiente = document.createElement("button");
    // btnSiguiente.textContent = "Siguiente »";
    btnSiguiente.textContent = ">";
    btnSiguiente.disabled = paginaActual === totalPaginas;
    btnSiguiente.onclick = () => cambiarPagina(paginaActual + 1);
    contenedorPaginacion.appendChild(btnSiguiente);
}

function cambiarPagina(nuevaPagina) {
    paginaActual = nuevaPagina;
    actualizarVista();
    window.scrollTo({ top: 0, behavior: "smooth" }); // Sube suavemente al cambiar de página
}


