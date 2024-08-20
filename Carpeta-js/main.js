let carrito = [];
let menu = [];

// Función para cargar datos desde el JSON
function cargarDatos() {
    fetch('../data.json')
        .then(response => response.json())
        .then(data => {
            menu = data.menu;
            mostrarMenu();
        })
        .catch(error => console.error('Error al cargar los datos:', error));
}

// Función para mostrar el menú completo
function mostrarMenu() {
    mostrarProductos(menu);
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

    const precioTotalElement = document.getElementById('precio-total');
    if (precioTotalElement) {
        precioTotalElement.innerText = precioTotal.toFixed(2);
    }

    guardarCarrito();
    agregarEventosEliminar();

    const contadorItems = document.getElementById('contador-items');
    if (contadorItems) {
        contadorItems.innerText = carrito.length;
    }
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

            // SweetAlert al agregar al carrito
            Swal.fire({
                icon: 'success',
                title: 'Producto añadido al carrito',
                showConfirmButton: false,
                timer: 1500
            });
        });
    });
}

// Manejo del botón para eliminar el historial de compras
document.getElementById('eliminar-historial').addEventListener('click', () => {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará todo el historial de compras.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('historialCompras');
            cargarHistorial();
            Swal.fire(
                'Eliminado',
                'El historial de compras ha sido eliminado.',
                'success'
            );
        }
    });
});

// Manejo del botón de "Menú" para mostrar las opciones debajo del botón
document.getElementById('menu-button').addEventListener('click', () => {
    const menuOptions = document.getElementById('menu-options');
    menuOptions.style.display = menuOptions.style.display === 'none' ? 'block' : 'none';
});

// Manejo de las opciones del menú
document.getElementById('comida-option').addEventListener('click', () => {
    const productosComida = menu.filter(item => item.categoria === 'comidas');
    mostrarProductos(productosComida);
});

document.getElementById('bebida-option').addEventListener('click', () => {
    const productosBebida = menu.filter(item => item.categoria === 'bebidas');
    mostrarProductos(productosBebida);
});

// Manejo del botón para finalizar la compra
document.getElementById('finalizar-compra-button').addEventListener('click', () => {
    document.getElementById('form-datos').style.display = 'block';
});

// Manejo del cambio en el método de pago
document.getElementById('forma-pago').addEventListener('change', (event) => {
    const infoTarjeta = document.getElementById('info-tarjeta');
    if (event.target.value === 'efectivo') {
        infoTarjeta.style.display = 'none';
    } else {
        infoTarjeta.style.display = 'block';
    }
});

// Manejo del formulario de confirmación de compra
document.querySelector('#form-datos form').addEventListener('submit', (event) => {
    event.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const formaPago = document.getElementById('forma-pago').value;

    let detallesCompra = `Nombre: ${nombre}\nCorreo: ${correo}\nForma de Pago: ${formaPago}\n\nProductos:\n`;

    carrito.forEach(item => {
        detallesCompra += `${item.nombre} x ${item.cantidad} - $${(item.valor * item.cantidad).toFixed(2)}\n`;
    });

    detallesCompra += `\nTotal: $${document.getElementById('precio-total').innerText}`;

    Swal.fire({
        title: 'Compra realizada',
        text: detallesCompra,
        icon: 'success',
        confirmButtonText: 'OK'
    });

    // Guardar historial de compras
    guardarHistorial(nombre, correo, carrito, document.getElementById('precio-total').innerText);
    
    // Reiniciar carrito
    carrito = [];
    actualizarCarrito();
    document.getElementById('form-datos').reset();
    document.getElementById('form-datos').style.display = 'none';
});

// Función para guardar historial de compras
function guardarHistorial(nombre, correo, carrito, total) {
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
    const compra = {
        nombre,
        correo,
        carrito,
        total,
        fecha: new Date().toLocaleString()
    };
    historial.push(compra);
    localStorage.setItem('historialCompras', JSON.stringify(historial));
    cargarHistorial();
}

// Función para cargar historial de compras
function cargarHistorial() {
    const historialDiv = document.getElementById('historial-compra');
    historialDiv.innerHTML = '';
    const historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
    if (historial.length > 0) {
        historial.forEach(compra => {
            const compraDiv = document.createElement('div');
            compraDiv.className = 'compra';
            compraDiv.innerHTML = `
                <h4>Compra realizada el ${compra.fecha}</h4>
                <p>Nombre: ${compra.nombre}</p>
                <p>Correo: ${compra.correo}</p>
                <p>Total: $${compra.total}</p>
                <h5>Productos:</h5>
                <ul>
                    ${compra.carrito.map(item => `<li>${item.nombre} x ${item.cantidad} - $${(item.valor * item.cantidad).toFixed(2)}</li>`).join('')}
                </ul>
            `;
            historialDiv.appendChild(compraDiv);
        });
    } else {
        historialDiv.innerHTML = '<p>No hay historial de compras.</p>';
    }
}

// Función para eliminar una compra específica del historial
function eliminarCompraHistorial(index) {
    let historial = JSON.parse(localStorage.getItem('historialCompras')) || [];
    historial.splice(index, 1);
    localStorage.setItem('historialCompras', JSON.stringify(historial));
    cargarHistorial();

    Swal.fire({
        title: 'Compra eliminada',
        text: 'La compra ha sido eliminada del historial.',
        icon: 'success',
        confirmButtonText: 'OK'
    });
}

// Manejo del botón de modo oscuro
document.getElementById('modo-oscuro').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    cargarCarrito();
    cargarHistorial();
});
