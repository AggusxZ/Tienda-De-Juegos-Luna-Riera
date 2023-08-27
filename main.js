// Elementos del DOM
const mainElement = document.querySelector('main');
const carritoLista = document.querySelector('.carrito-lista');
const carritoContainer = document.querySelector('.carrito');
const cerrarCarritoButton = document.querySelector('.cerrar-carrito-btn');
const comprarCarritoButton = document.querySelector('.comprar-carrito-btn');
const vaciarCarritoButton = document.querySelector('.vaciar-carrito-btn');
const carritoImpuestos = document.querySelector('.carrito-impuestos');
const carritoPrecioFinal = document.querySelector('.carrito-precio-final');

// Variables de estado
let juegos = [];
let carrito = [];
let vaciarDespuesDeVaciar = true;

// Función para cargar los juegos desde el archivo JSON
async function cargarJuegos() {
    try {
        const response = await fetch('juegos.json');
        juegos = await response.json();
        crearCartasDeJuegos();
    } catch (error) {
        console.error('Error al cargar los juegos desde el archivo JSON:', error);
    }
}

cargarJuegos();

// Función para crear las cartas de juegos
function crearCartasDeJuegos() {
    juegos.forEach(juego => {
        const juegoDiv = document.createElement('div');
        juegoDiv.classList.add('juego');

        const imagen = document.createElement('img');
        imagen.src = juego.imagen;
        juegoDiv.appendChild(imagen);

        const separador = document.createElement('hr');
        separador.classList.add('juego-imagen-titulo-separador');
        juegoDiv.appendChild(separador);

        const titulo = document.createElement('h2');
        titulo.textContent = juego.titulo;
        juegoDiv.appendChild(titulo);

        const descripcion = document.createElement('p');
        descripcion.textContent = juego.descripcion;
        juegoDiv.appendChild(descripcion);

        const precio = document.createElement('p');
        precio.textContent = `Precio: $${juego.precio.toFixed(2)}`;
        precio.classList.add('precio');
        juegoDiv.appendChild(precio);

        // Botón para agregar al carrito
        const comprarButton = document.createElement('button');
        comprarButton.textContent = 'Agregar al Carrito';
        comprarButton.classList.add('comprar-btn');
        comprarButton.addEventListener('click', () => {
            agregarAlCarrito(juego);
            mostrarCarrito();
            actualizarCarrito();
        });
        juegoDiv.appendChild(comprarButton);

        mainElement.appendChild(juegoDiv);
    });
}

// Función para agregar un juego al carrito
function agregarAlCarrito(juego) {
    const juegoEnCarrito = carrito.find(item => item.juego.titulo === juego.titulo);

    if (juegoEnCarrito) {
        juegoEnCarrito.cantidad++;
    } else {
        carrito.push({ juego: juego, cantidad: 1 });
    }

    guardarCarritoEnLocalStorage();
    mostrarCarrito();
    actualizarCarrito();
    mostrarFeedback(`${juego.titulo} se agregó al carrito`);
}

/* Función para mostrar feedback */
function mostrarFeedback(mensaje) {
    Swal.fire({
        text: mensaje,
        icon: 'success',
        timer: 1000,
        showConfirmButton: false
    });
}

// Función para mostrar el carrito
function mostrarCarrito() {
    if (carrito.length > 0) {
        carritoContainer.style.transform = 'translateX(0)';
        carritoContainer.style.opacity = '1';

        vaciarDespuesDeCompra = true;
    }
}

// Función para mostrar el mensaje de carrito vacío
function mostrarCarritoVacio() {
    Swal.fire({
        text: 'Por favor, agrega un producto al carrito',
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
    });
}

// Función para actualizar el contenido del carrito
function actualizarCarrito() {
    carritoLista.innerHTML = '';
    let subtotal = 0;
    let totalImpuestos = 0;

    carrito.forEach((item, index) => {
        const carritoItem = document.createElement('li');
        const precioUnitario = item.juego.precio;
        const subtotalItem = precioUnitario * item.cantidad;
        subtotal += subtotalItem;

        const carritoItemDiv = document.createElement('div');
        carritoItemDiv.classList.add('carrito-item');

        const productoInfo = document.createElement('p');
        productoInfo.classList.add('carrito-item-nombre-precio');
        productoInfo.textContent = `${item.juego.titulo} - $${subtotalItem.toFixed(2)}`;

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('carrito-item-info');

        const cantidadInput = document.createElement('input');
        cantidadInput.classList.add('carrito-item-cantidad');
        cantidadInput.type = 'number';
        cantidadInput.value = item.cantidad;
        cantidadInput.min = 1;
        cantidadInput.addEventListener('input', () => {
            ajustarCantidad(item, cantidadInput.value);
            actualizarCarrito();
        });

        const eliminarButton = document.createElement('button');
        eliminarButton.textContent = 'Eliminar';
        eliminarButton.classList.add('eliminar-btn');
        eliminarButton.addEventListener('click', () => {
            eliminarDelCarrito(item);
            actualizarCarrito();
        });

        infoDiv.appendChild(productoInfo);
        infoDiv.appendChild(cantidadInput);

        carritoItemDiv.appendChild(infoDiv);
        carritoItemDiv.appendChild(eliminarButton);

        carritoItem.appendChild(carritoItemDiv);

        carritoLista.appendChild(carritoItem);
    });

    const iva = subtotal * 0.21;
    const igbp = subtotal * 0.45;
    const ip = subtotal * 0.08;
    totalImpuestos = iva + igbp + ip;

    carritoImpuestos.innerHTML = `
        <li>IVA (21%): $${iva.toFixed(2)}</li>
        <li>IGBP (45%): $${igbp.toFixed(2)}</li>
        <li>IP (8%): $${ip.toFixed(2)}</li>
    `;

    const precioFinal = subtotal + totalImpuestos;

    carritoPrecioFinal.textContent = `$${precioFinal.toFixed(2)}`;
}

// Función para eliminar un juego del carrito
function eliminarDelCarrito(item) {
    const index = carrito.indexOf(item);
    if (index > -1) {
        carrito.splice(index, 1);
    }
}

// Función para ajustar la cantidad de un juego en el carrito
function ajustarCantidad(item, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    if (!isNaN(cantidad) && cantidad >= 1) {
        item.cantidad = cantidad;
    }
}

/* Función para calcular el costo total */
function calcularCostoTotal() {
    let subtotal = 0;
    let iva = 0;
    let igbp = 0;
    let ip = 0;

    carrito.forEach(item => {
        subtotal += item.juego.precio * item.cantidad;
    });

    iva = subtotal * 0.21;
    igbp = subtotal * 0.45;
    ip = subtotal * 0.08;

    const total = subtotal + iva + igbp + ip;

    return {
        subtotal: subtotal,
        iva: iva,
        igbp: igbp,
        ip: ip,
        total: total
    };
}

// Función para ocultar el carrito
function ocultarCarrito() {
    carritoContainer.style.transform = 'translateX(100%)';
    carritoContainer.style.opacity = '0';
}

// Función para realizar una compra
function realizarCompra() {
    if (carrito.length === 0) {
        mostrarCarritoVacio();
    } else {
        vaciarCarrito(true); 
        ocultarCarrito();
        mostrarMensajeCompra();
    }
}

// Función para mostrar el mensaje de compra exitosa
function mostrarMensajeCompra() {
    Swal.fire({
        text: 'Compra realizada con éxito',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
}

// Función para vaciar el carrito
function vaciarCarrito(desdeBotonCompra = false) {
    if (carrito.length > 0) {
        carrito.length = 0;
        actualizarCarrito();
        mostrarCarritoVaciadoExitoso(desdeBotonCompra); 
    } else {
        mostrarCarritoYaVacio();
    }
}

// Función para mostrar el mensaje de carrito vaciado exitosamente
function mostrarCarritoVaciadoExitoso(desdeBotonCompra) {
    if (!desdeBotonCompra) {
        Swal.fire({
            text: 'Carrito vaciado exitosamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
    }
}

// Función para mostrar el mensaje de carrito ya vacío
function mostrarCarritoYaVacio() {
    Swal.fire({
        text: 'El carrito ya está vacío',
        icon: 'info',
        timer: 2000,
        showConfirmButton: false
    });
}

// Función para guardar el carrito en el almacenamiento local
function guardarCarritoEnLocalStorage() {
    if (carrito.length > 0) {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        console.log('Carrito guardado en localStorage:', carrito);
    }else {
        console.log('No se guarda el carrito vacío en localStorage.');
    }
}

// Función para cargar el carrito desde el almacenamiento local
async function cargarCarritoDesdeLocalStorage() {
    try {
        const carritoGuardado = localStorage.getItem('carrito');

        if (carritoGuardado) {
            const carritoGuardadoArray = JSON.parse(carritoGuardado);
            if (carritoGuardadoArray.length > 0) {
                carrito.push(...carritoGuardadoArray);
            }
        }

        if (carrito.length > 0) {
            mostrarCarrito();
            await actualizarCarrito(); 
        }
    } catch (error) {
        console.error(error.message);
    }
}

// Event listeners
cerrarCarritoButton.addEventListener('click', ocultarCarrito);
comprarCarritoButton.addEventListener('click', realizarCompra);
vaciarCarritoButton.addEventListener('click', () => {vaciarCarrito(false);});

// Cargar el carrito desde el almacenamiento local al cargar la página
cargarCarritoDesdeLocalStorage();