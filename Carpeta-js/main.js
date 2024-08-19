let carrito = [];
let menu = [];

// Función para cargar datos desde el JSON
function cargarDatos() {
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            menu = data.menu;
            mostrarMenu();
        })
        .catch(error => console.error('Error al cargar los datos:', error));
}

// Función para guardar el carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para cargar el carrito desde localStorage
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }
}

// Función para agregar un producto al carrito
function agregarAlCarrito(id) {
    const itemIndex = carrito.findIndex(p => p.id === parseInt(id));
    if (itemIndex > -1) {
        carrito[itemIndex].cantidad += 1;
    } else {
        const item = menu.find(p => p.id === parseInt(id));
        item.cantidad = 1;
        carrito.push(item);
    }
    actualizarCarrito();
}

// Función para actualizar el carrito
function actualizarCarrito() {
    const carritoCompra = document.getElementById('lista-menu');
    carritoCompra.innerHTML = ''; 
    let precioTotal = 0;

    carrito.forEach((item) => {
        const carritoItem = document.createElement('li');
        carritoItem.className = 'producto';
        carritoItem.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" width="50">
            <span>${item.nombre} x ${item.cantidad}</span>
            <button data-id="${item.id}">Eliminar</button>
        `;
        carritoCompra.appendChild(carritoItem);

        precioTotal += item.valor * item.cantidad;
    });

    document.getElementById('precio-total').innerText = precioTotal.toFixed(2);
    guardarCarrito();
    agregarEventosEliminar();
    document.getElementById('contador-items').innerText = carrito.length;
}

// Función para agregar eventos de eliminación al carrito
function agregarEventosEliminar() {
    const botonesEliminar = document.querySelectorAll('#lista-menu button');
    botonesEliminar.forEach((boton) => {
        boton.addEventListener('click', (event) => {
            const id = event.target.getAttribute('data-id');
            eliminarDelCarrito(id);
        });
    });
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(id) {
    const itemIndex = carrito.findIndex(p => p.id === parseInt(id));
    if (itemIndex > -1) {
        if (carrito[itemIndex].cantidad > 1) {
            carrito[itemIndex].cantidad -= 1;
        } else {
            carrito.splice(itemIndex, 1);
        }
    }
    actualizarCarrito();
}

// Función para mostrar los productos
function mostrarProductos(productos) {
    const menuCompleto = document.getElementById('menu-completo');
    menuCompleto.innerHTML = '';
    productos.forEach((item) => {
        const menuDiv = document.createElement('div');
        menuDiv.className = 'producto';
        menuDiv.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}">
            <h3>${item.nombre}</h3>
            <p class="precio">$${item.valor}</p>
            <button data-id="${item.id}">Agregar al carrito</button>
        `;
        menuCompleto.appendChild(menuDiv);
    });

    agregarEventosAgregar();
}

// Función para agregar eventos de agregar al carrito
function agregarEventosAgregar() {
    const botonesAgregar = document.querySelectorAll('.producto button');
    botonesAgregar.forEach((boton) => {
        boton.addEventListener('click', () => {
            const id = boton.getAttribute('data-id');
            agregarAlCarrito(id);
        });
    });
}

// Manejador del botón para eliminar el historial de compras
document.getElementById('eliminar-historial').addEventListener('click', () => {
    localStorage.removeItem('historialCompras');
    cargarHistorial();
    alert('Historial de compras eliminado.');
});

// Ajustar el comportamiento del menú para mostrar opciones debajo del botón
document.getElementById('menu-button').addEventListener('click', () => {
    const menuOptions = document.getElementById('menu-options');
    menuOptions.style.display = menuOptions.style.display === 'none' ? 'block' : 'none';
});

// Manejadores de las opciones del menú
document.getElementById('comida-option').addEventListener('click', () => {
    const productosComida = menu.filter(item => item.categoria === 'comidas');
    mostrarProductos(productosComida);
});

document.getElementById('bebida-option').addEventListener('click', () => {
    const productosBebida = menu.filter(item => item.categoria === 'bebidas');
    mostrarProductos(productosBebida);
});

// Manejador del botón para finalizar la compra
document.getElementById('finalizar-compra-button').addEventListener('click', () => {
    document.getElementById('form-datos').style.display = 'block';
});

// Manejador del cambio en el método de pago
document.getElementById('forma-pago').addEventListener('change', () => {
    const formaPago = document.getElementById('forma-pago').value;
    const infoTarjeta = document.getElementById('info-tarjeta');
    infoTarjeta.style.display = (formaPago === 'credito' || formaPago === 'debito') ? 'flex' : 'none';
});

// Manejador del formulario de datos del usuario
document.getElementById('form-datos').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const formaPago = document.getElementById('forma-pago').value;

    if ((formaPago === 'credito' || formaPago === 'debito') &&
        (!validarTarjeta() || !validarCodigoSeguridad())) {
        alert('Por favor ingrese un número de tarjeta y un código de seguridad válidos.');
        return;
    }

    const resumenCompra = carrito.map(item => `${item.nombre} x ${item.cantidad}`).join('\n');
    const montoPagado = document.getElementById('precio-total').innerText;
    const resumen = `Resumen de la compra:
${resumenCompra}
Monto pagado: $${montoPagado}
Nombre: ${nombre}
Correo: ${correo}`;

    alert(resumen);
    guardarCompraEnHistorial(resumen);
    limpiarCarrito();
});

// Funciones para validar los datos de la tarjeta
function validarTarjeta() {
    const numeroTarjeta = document.getElementById('numero-tarjeta').value;
    return numeroTarjeta.length === 16;
}

function validarCodigoSeguridad() {
    const codigoSeguridad = document.getElementById('codigo-seguridad').value;
    return codigoSeguridad.length === 3;
}

// Función para limpiar el carrito después de la compra
function limpiarCarrito() {
    carrito = [];
    actualizarCarrito();
    document.getElementById('form-datos').style.display = 'none';
}

// Función para guardar la compra en el historial
function guardarCompraEnHistorial(compra) {
    let historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
    historial.push(compra);
    localStorage.setItem('historialCompras', JSON.stringify(historial));
}

// Función para cargar el historial de compras
function cargarHistorial() {
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
    const historialCompra = document.getElementById('historial-compra');
    historialCompra.innerHTML = '';

    historial.forEach((compra, index) => {
        const compraDiv = document.createElement('div');
        compraDiv.innerText = `Compra ${index + 1}:\n${compra}\n\n`;
        historialCompra.appendChild(compraDiv);
    });
}

// Cargar los datos del JSON al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    cargarCarrito();
    cargarHistorial();
});
