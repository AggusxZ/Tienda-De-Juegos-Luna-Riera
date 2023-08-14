// Lista de juegos en venta
const juegos = [
    {
        titulo: "Broforce",
        descripcion: "Únete a la acción explosiva en este juego de plataformas.",
        precio: 1050,
        imagen: "img/broforce.jpg"
    },  
];

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
const carrito = [];
let vaciarDespuesDeVaciar = true;
let ultimoBotonPresionado = '';

// Crear elementos de Juegos
juegos.forEach(juego => {
    const juegoDiv = document.createElement('div');
    juegoDiv.classList.add('juego');

    // Crear elementos para mostrar información del juego
    const imagen = document.createElement('img');
    imagen.src = juego.imagen;
    juegoDiv.appendChild(imagen);

    const titulo = document.createElement('h2');
    titulo.textContent = juego.titulo;
    juegoDiv.appendChild(titulo);

    const descripcion = document.createElement('p');
    descripcion.textContent = juego.descripcion;
    juegoDiv.appendChild(descripcion);

    const precio = document.createElement('p');
    precio.textContent = `Precio: $${juego.precio.toFixed(2)}`;
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

// Función para agregar un juego al carrito
function agregarAlCarrito(juego) {
    const juegoEnCarrito = carrito.find(item => item.juego.titulo === juego.titulo);

    juegoEnCarrito ? juegoEnCarrito.cantidad++ : carrito.push({ juego: juego, cantidad: 1 });

    guardarCarritoEnLocalStorage();
    mostrarCarrito();
    actualizarCarrito();

    // Función para mostrar feedback en el DOM
    const feedback = document.createElement('p');
    feedback.textContent = `${juego.titulo} se agregó al carrito`;
    feedback.classList.add('feedback');
    mainElement.appendChild(feedback);

    setTimeout(() => {
        feedback.style.opacity = '1';
        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => {
                mainElement.removeChild(feedback);
            }, 300);
        }, 2000);
    }, 10); 
}

// Función para mostrar el carrito
function mostrarCarrito() {
    carritoContainer.style.transform = 'translateX(0)';
    carritoContainer.style.opacity = '1';

    vaciarDespuesDeCompra = true;
}

// Función para mostrar el mensaje de carrito vacío
function mostrarCarritoVacio() {
    const carritoVacio = document.querySelector('.carrito-vacio');
    carritoVacio.style.display = 'block';
    setTimeout(() => {
        carritoVacio.style.display = 'none';
    }, 3000); 
}

// Función para actualizar el contenido del carrito
function actualizarCarrito() {
    carritoLista.innerHTML = '';
    let subtotal = 0;
    let totalImpuestos = 0;

    carrito.forEach(item => {
        const carritoItem = document.createElement('li');
        const precioUnitario = item.juego.precio;
        const subtotalItem = precioUnitario * item.cantidad;
        subtotal += subtotalItem;

        const carritoItemDiv = document.createElement('div');
        carritoItemDiv.classList.add('carrito-item');

        const cantidadInput = document.createElement('input');
        cantidadInput.type = 'number';
        cantidadInput.value = item.cantidad;
        cantidadInput.min = 1;
        cantidadInput.addEventListener('input', () => {
            ajustarCantidad(item, cantidadInput.value);
            actualizarCarrito();
        });

        const productoInfo = document.createElement('p');
        productoInfo.textContent = `${item.juego.titulo} - $${subtotalItem.toFixed(2)}`;

        carritoItemDiv.appendChild(productoInfo);
        carritoItemDiv.appendChild(cantidadInput);

        const eliminarButton = document.createElement('button');
        eliminarButton.textContent = 'Eliminar';
        eliminarButton.classList.add('eliminar-btn');
        eliminarButton.addEventListener('click', () => {
            eliminarDelCarrito(item);
            actualizarCarrito();
        });

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
    const mensajeCompra = document.querySelector('.mensaje-compra');
    mensajeCompra.style.opacity = '1';
    setTimeout(() => {
        mensajeCompra.style.opacity = '0';
    }, 3000); 
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
        const carritoVaciadoExitoso = document.querySelector('.carrito-vaciado-exitoso');
        carritoVaciadoExitoso.style.display = 'block';
        setTimeout(() => {
            carritoVaciadoExitoso.style.display = 'none';
        }, 3000);
    }
}

// Función para mostrar el mensaje de carrito ya vacío
function mostrarCarritoYaVacio() {
    const carritoYaVacio = document.querySelector('.carrito-ya-vacio');
    carritoYaVacio.style.display = 'block';
    setTimeout(() => {
        carritoYaVacio.style.display = 'none';
    }, 3000); 
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
function cargarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito.push(...JSON.parse(carritoGuardado));
        mostrarCarrito();
        actualizarCarrito();
    }
}

// Event listeners
cerrarCarritoButton.addEventListener('click', ocultarCarrito);
comprarCarritoButton.addEventListener('click', realizarCompra);
vaciarCarritoButton.addEventListener('click', () => {vaciarCarrito(false);});

// Cargar el carrito desde el almacenamiento local al cargar la página
cargarCarritoDesdeLocalStorage();