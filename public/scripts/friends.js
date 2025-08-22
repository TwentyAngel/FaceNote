const BACKEND_URL = "http://localhost:3000";
const TOKEN = localStorage.getItem("token") || "";

function verificarSesion() {
    const mensajeError = document.getElementById("mensaje-error");
    const seccionAmigos = document.getElementById("seccion-amigos");
    const enlaceSesion = document.querySelector('.navbar ul li a[href="log.html"]');

    if (!TOKEN) {
        mensajeError.style.display = "block";
        seccionAmigos.style.display = "none";
        enlaceSesion.innerText = "Iniciar sesión";
        enlaceSesion.href = "log.html";
    } else {
        mensajeError.style.display = "none";
        seccionAmigos.style.display = "block";
        enlaceSesion.innerText = "Cerrar sesión";
        enlaceSesion.href = "#";
        enlaceSesion.onclick = function (event) {
            event.preventDefault();
            cerrarSesion();
        };

        cargarSugerencias();
        cargarAmigos();
    }
}

// 🔹 Cerrar sesión correctamente
function cerrarSesion() {
    localStorage.removeItem("token");
    window.location.href = "log.html";
}

// 🔹 Agregar amigo y actualizar la interfaz
async function agregarAmigo(id) {
    try {
        console.log(`agregarAmigo: Agregando amigo con ID ${id}`); // Log
        const response = await fetch(`${BACKEND_URL}/amigo/${id}/agregar`, {
            method: "POST",
            headers: {
                "Authorization": TOKEN,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const data = await response.json();
            const mensaje = data.mensaje || data.error || "Error desconocido al agregar amigo";
            console.error(`agregarAmigo: Error al agregar amigo: ${mensaje}`);  // Log
            alert(mensaje);
            return;
        }

        console.log(`agregarAmigo: Amigo con ID ${id} agregado exitosamente`); // Log
        cargarSugerencias();
        cargarAmigos();
    } catch (error) {
        console.error("agregarAmigo: Error al agregar amigo:", error);
        alert("Error al agregar amigo. Por favor, inténtalo de nuevo.");
    }
}

// 🔹 Eliminar amigo y actualizar la interfaz
async function eliminarAmigo(id) {
    try {
        console.log(`eliminarAmigo: Eliminando amigo con ID ${id}`); // Log
        const response = await fetch(`${BACKEND_URL}/amigo/${id}/eliminar`, {
            method: "DELETE",
            headers: {
                "Authorization": TOKEN,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const data = await response.json();
            const mensaje = data.mensaje || data.error || "Error desconocido al eliminar amigo";
            console.error(`eliminarAmigo: Error al eliminar amigo: ${mensaje}`);  // Log
            alert(mensaje);
            return;
        }

        console.log(`eliminarAmigo: Amigo con ID ${id} eliminado exitosamente`); // Log
        cargarAmigos();
    } catch (error) {
        console.error("eliminarAmigo: Error al eliminar amigo:", error);
        alert("Error al eliminar amigo. Por favor, inténtalo de nuevo.");
    }
}

// 🔹 Cargar sugerencias de amigos
async function cargarSugerencias() {
    const contenedorSugerencias = document.getElementById("contenedor-sugerencias");
    contenedorSugerencias.innerHTML = "<p class='loading'>Cargando sugerencias...</p>";
    try {
        console.log("cargarSugerencias: Cargando sugerencias de amigos"); // Log
        const response = await fetch(`${BACKEND_URL}/usuarios`, {
            method: "GET",
            headers: {
                "Authorization": TOKEN,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`cargarSugerencias: Error al cargar sugerencias: ${response.status} - ${errorText}`);
            throw new Error(`Error al cargar sugerencias: ${response.status} - ${errorText}`);
        }

        const sugerencias = await response.json();
        console.log("cargarSugerencias: Sugerencias recibidas:", sugerencias); // Log
        contenedorSugerencias.innerHTML = "";
        if (sugerencias.length === 0) {
            contenedorSugerencias.innerHTML = "<p>No hay sugerencias de amigos disponibles en este momento.</p>";
            return;
        }

        sugerencias.forEach(sugerencia => {
            const divSugerencia = document.createElement("div");
            divSugerencia.className = "tarjeta-amigo";
            divSugerencia.innerHTML = `
                <img src="${sugerencia.avatarUrl}" alt="Avatar de ${sugerencia.nombre}">
                <p>${sugerencia.nombre}</p>
                <button onclick="agregarAmigo('${sugerencia._id}')">Agregar</button>
            `;
            contenedorSugerencias.appendChild(divSugerencia);
        });
    } catch (error) {
        console.error("cargarSugerencias: Error al cargar sugerencias:", error);
        contenedorSugerencias.innerHTML = `<p class='error'>Error al cargar sugerencias de amigos: ${error.message}</p>`;
    }
}

// 🔹 Cargar amigos
async function cargarAmigos() {
    const contenedorAmigos = document.getElementById("contenedor-amigos");
    contenedorAmigos.innerHTML = "<p class='loading'>Cargando amigos...</p>";
    try {
        console.log("cargarAmigos: Cargando lista de amigos");  // Log
        const response = await fetch(`${BACKEND_URL}/amigos`, {
            method: "GET",
            headers: {
                "Authorization": TOKEN,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`cargarAmigos: Error al cargar amigos: ${response.status} - ${errorText}`);
            throw new Error(`Error al cargar amigos: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const amigos = data.amigos; // Accedemos a la propiedad 'amigos' de la respuesta
        console.log("cargarAmigos: Amigos recibidos:", amigos);  // Log
        contenedorAmigos.innerHTML = "";

        if (!amigos || amigos.length === 0) { // Verificamos si amigos es null o está vacío
            contenedorAmigos.innerHTML = "<p>No tienes amigos todavía.</p>";
            return;
        }

        amigos.forEach(amigo => {
            const divAmigo = document.createElement("div");
            divAmigo.className = "tarjeta-amigo";
            divAmigo.innerHTML = `
                <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gODIK/9sAQwAGBAQFBAQGBQUFBgYGBwkOCQkICAkSDQ0KDhUSFhYVEhQUFxohHBcYHxkUFB0nHR8iIyUlJRYcKSwoJCshJCUk/9sAQwEGBgYJCAkRCQkRJBgUGCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQk/8AAEQgDAAMAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+h6WikpiFopKKAFoopKAFpKWkoAWkoooAKWkooAWikpaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopKAFoopKAFopKWgAopKKAFoopKAFoopKAFopKWgAooooAKSlooAKKKKACiiigApKKWgAoopKAFoopKAFopKWgAopKKAFoopKAFoopKAFopKWgAooooAKSlooAKKKKACkpaSgAooooAKKKKACiiloASiiloASiiigApaSloAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopKAFoopKAFopKKAFopKKAFopKKACloooAKKKKAEpaSigBaKKSgBaKSloAKKSigBaKKKACiikoAWiikoAWikooAWikooAWikooAKWiigAooooASlpKKAFoopKAFpKWkoAWkoooAKKKKAClpKKACiiigBaSiigBaSiigBaSlooAKSlpKACiiigBaSlpKAClpKKAClpKWgAoopKAFooooAKKSigBaKKKACiiigAooooAKKKKACikooAWiiigAooooAKKSigBaKSloAKKKSgBaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBKKWigBKKWkoAKWiigBKWiigApKWigBKKWkoAKKKKAFpKKKACiiigAooooAWikooAWkoooAWikpaACikpaACikpaACiiigAooooAKKKKACikpaACiikoAWiiigAopKWgAooooAKKKKACiiigAooooAKKKKACiiigAooooASloooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBKWiigAooooAKKKKACiiigAooooAKKKKACkpaSgAopaKACikooAWiiigAooooAKKKKACkpaKAEopaSgAopaKACkoooAKKWigBKKKWgBKKWkoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACkpaKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApKWigApKKWgApKKKAFooooAKKKKACiiigApKWkoAKKKKACiiigAooooAKKKKACiiigAopaKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiikoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKSlooAKSiloAKKSigBaKSloAKKSigBaSiloAKSlooAKKKKACkpaSgBaKKKAEpaKKACkpaKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiikoAWikooAWkoooAKKKKACiiigApaSloASlopKAClpKWgBKWkooAWiiigApKWigAooooASloooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKSigBaSiigBaSiigBaKSigBaKSigBaKSloAKKKSgBaSlooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKSgAooooAKKKKACiiigAooooAKWkooAWiiigAopKWgAoopKAFooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACikoJwMngUALRVSbVrG34kuY8+gOT+lUpfFFghwizSf7q/40xGxSVz7+Lk/gs2P+8+P6VEfFsvazj/FzRYLnTUlcyPFs3e0i/76NPXxcw+9Zj8JP/rUWC50lFYSeLLY/ft5k+mDVuHxDp0v/LcofRwRRYLmlRUcVxFOMxSJIP8AZOafmkMWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooASloooAKSiigBaKSigBaKSigBaKSloAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopKAFopKz9Q1u10/KlvMl/uLz+Z7UwNCqN5rdlZZV5d7/wBxOTXM32uXl9lS/lRn+BOPzPWs+nYm5t3Xiq4kJFvEsQ7FuTWXPe3N0SZ55JM9i3H5VBilp2FcKSlooAKKKKACiiigAooooAFJRtysVPqpwa0LbXr+2wPOMqjtJz+vWs+igDp7TxVbyYW5jaJv7w5X/GtmG4iuE3wyLIp7qc15/T4Lia1cSQStGw7g0rDueg0Vzmn+KeiXqcf89EH8xW/FPHOgkikWRD0KnikMkooopDCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooASilpKACiiigBaSlooASlopKACloooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiikzQAtRz3EVtEZZpFRB1JNV9R1OHTYt8hy5+6g6muQv9RuNRl8yZuB91B0WnYTZoan4jmuCYrXMUfQt/E3+FYx5JJ6nrRRVEhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFT2d/cWEm+3kK+qnkH6ioKKAOx0zXbe/wAIxEU/9wng/Q1p152CQcgkEdCK6HSPERyIL5vZZf8AH/GpsNM6OikByMjp1paRQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFJRS0AFJS0lABS0UUAJRRS0AJS0UUAJS0UlAC0UUUAFFFFABRRRQAUUUUAJS0UUAFFFFABRRRQAUUUUAFFFFACZxVDVtWj0yLs8zfcT+pp2q6nHpkG8/NK3CJ6n1+lcZPPJcytNKxZ2OSaaQmxbi4lupmmmbe7dSajooqiQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKSlooA2NE1xrIrb3BLQdAx6x//AFq6pWVlDKQQeQRXntbOg60bRha3DEwsflY/wH/Ck0NM6uikz3zwemKWpKCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACkpaKACkpaKACiiigBKKWigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKgvLyKxt2nmOFUcDux9KmJwM5wB3rjdb1M6hc7UP7iMkJ7+9NCZUvbyW+uGmlPzE8Dso9KhooqiQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACkpaKAEpaKKAEpaKKACkpaKAEpaKKAOj8O6xvxZXDcj/VMe/tXQ152rFSGUkEcgjtXZ6LqY1G2y+BMmA49fepaKTNGkpaKQwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACkpaKACiiigAooooAKKKKACkpaKACiiigAooooAKSlooASilooASilooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKiuJ0toJJpDhUXcaAMjxLqX2eAWkR/eSjLEdl/+vXL1LdXL3lzJPIclzn6DsKiq0QFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUlLSUALSUUtABRRRQAVZ02+fTrtZl+70ceq1WpKAPQo3WVFkQ7lYZB9qfXP+FtQ3I1k5yU+aP6dxXQVJQUUUUhhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACUtFFABRSUtABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSUtFABSUUtABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVzviq+wqWaHk/O/wBOw/rXQO6xqXY4VRkn2rg725N5dy3Dfxtkew7U0JkNFFFUSFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFJS0AFFJRQAtFFFAEtrcvZ3MU6feQ5+o713kMyzxJKhyrjcDXn1dP4WvPMtntWOWiOV/3T/wDX/nSY0btFJS1JQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFJQBleJLr7PpzIvDzNsH071yNbHim58y+WEdIl5+p5/wrHqkSwooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACikpaACiiigAooooAKvaLdfZNShYnCufLb6GqNHOcjt0oA9EoqvYXH2uyhm7ugz9asVBYUUUlAC0UUUAFFJS0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFJQAtFFFABRRRQAUUUlAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAlLRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRx36UVW1Cb7PYzyf3UOKAOLvp/tV7NN/fckfTt+lQUlLVkBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUlLRQAlFLRQAlLRRQAlFFLQAlFLSUALRRRQAlFLRQB1PhWfzLGSEnmJ/wBD/k1t1yvhWXbeSxZ4dM/iP/111VSykFFFFIYUUUUAJS0UUAFFFFABRRRQAUlLRQAUUUUAFFFFABRRSUALRRRQAlLRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABWV4lk8vSnH99lWtWsLxa+LOBP70hP5CmJnMUUUVRIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAlFFLQAlLRRQAUlLRQAUUUlABRS0UAX9Cl8vVYPRiV/MV2tcDYv5V7bv6SL/Ou+xUsaCkpaKRQUUUUAJS0UlAC0lLRQAUUUUAFFFFABRRRQAUlLRQAlFLRQAUlLRQAUlLRQAUUUUAFJS0UAFFFFACUtFFABRRRQAUUUUAFFJS0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABXOeL24tF92P8AKuj71zfi7/WWo/2W/mKaEzn6KKKokKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAEpaKKACiiigAooooAKKKKAFQlXU+jA16GetedGvRaTGgoooqSgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopKAFoopKAFopKWgAopKWgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAErnfFw5tT/ALw/lXR1geLl/wBHtn9HI/T/AOtTQmc1RRRVEhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACUtFFACUtFFABSUtFABSUtFACUtFFAAOor0TvXn9snmXMKerqP1FegZpMaCkpaKkoKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApKWigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooASloooAKKKKACiiigAooooAKKKKACsfxSm7TA39yRT/MVsVR1qLztLuVxzs3D8OaYjiaKKKokKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiikoAWikpaACikpaACikpaACikooAWiikoAWikooAuaQnmapbLjjeCfwrua5DwzF5mp7/+eaE/0rr6llIKKSikMWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKSigBaKKKACiiigAooooAKKKKACiiigAopKWgAooooAKKKKACiiigAooooAKKSloAKKKKACiiigAooooAKKKKACmugkRkPRhg06igDz2SMxSPGeqMVP4HFNrR8Q2/2fVZSBhZcSD8ev61nVaICiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopDQB0nhKHEdxOR1YIP5muhrP0K3+z6ZCpGCw3n8a0KllIKKKKQwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApKWigAooooAKKKSgBaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAMDxXa74IrkDlG2t9D0/WuarvL62F3aywEffUgfXtXBsrIxRhhlOCKpEsKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApKWigAooooASilooASilooASloooASilooAKls7c3d3DAP43AP071FW74VtN80l03RBsX6nr+lDA6ZQFUKvQDAopaKgsSloooAKKKKACiiigAooooAKKKKACiiigAooooAKSlooASilooAKKKKACiiigApKWigBKWiigAooooAKKKKACiiigAooooAKSlooASloooAKSlooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK5HxLZfZ77z1GEn5+jDrXXVS1ex/tCxeIAeYPmT6j/GmhM4iiggg4PBHUUVRIUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFJS0UAFFFJQAtFJRQAtFJS0AFFJS0AABYgAZJOBXc6XZixsY4f4gMsfUnrXOeG7D7Teee4zHDz9W7V11SxoSloopFBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAHKeJNO+z3AuY1xHKeQOzVjV3t3ax3lu8Egyrj8j61w91ayWdw8EowyHH1HrVJksiooopiCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApKWigApKWigBKWiigBKdHG0rrHGNzscAeppK6LwxpmP8ATpl5IxED/OgDX02xXT7RIF5I5Y+p71booqCwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAopKKAFooooAKKKKACiiigApKWigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACsvXdK/tCDzIx+/jHH+0PStSk7imI885BweCKK6LxDoxbde2y8/wDLRAP/AB4VzlMkWiiimAUUUUAFFFFABRRRQAUUUUAFFFJQAtFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFWLCxl1C4EMY92Y9FHrQBPo2ltqVz8wxCnLt6+1doqhFCqAFAwAO1Q2dpFZQLBEMKvfuT6mp6llJBRRRSGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRSUALRRRQAUUlLQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFJS0AFFFFABRRRQAmPbNc1ruhGItd2qZQ8ug/hPqK6WimhWPO6Wui1nw9uLXNkvPVoh/MVzpGDgjHsaokKKKKACiiigBKKWkoAWiiigApKWigAooooASilooASloooAKKKKACiiigBKWirWnabPqU2yJcKD8znotADLOymv51hhXJPU9lHqa7LT9Pi063EUQyTyz92NLYafDp8AihX/eY9WNWqlspIKKKKQwooooASloooAKSlooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAEpaKKACkpaKACiiigBKKWigAooooAKKKKACiiigAooooASloooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBKWiigAooooAKKKKACikpaACsrVtBhv8yRYinx97s31rVopgef3NrPZymKdCjD8j9PWo6766tILyLy54w6/qK5rUPDU9vl7UmaP+6fvD/GncmxjUUEFSQQQR1B7UlMQtJS0lAC0UUlAC0UUlAC0lFLQAUUUUAFFFFABRRRQAUmas2WnXN++2CMkZwWPCj8a6bTvD1vZYklInl9SOF+gpXHYyNK8PTXmJbgGKHqB/E3+FdTBbxW0SxQoERRgAVJRSuOwlLRRSGFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUlLQAUUlLQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAB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FGDKSpHQg4IoooA2dP8AE09viO6HnR9N38Q/xro7S+t75N8Egcdx3H1FcHTopZIJBJE5Rx0YdaVh3PQqK57TvE6tiK9XaeglXp+IrfR1kUOjBlI4IPBpDuOooopDCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBKWiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBCcVDd3kFlCZZ3CqOnqfYVT1bW4dOBjXEk56IP4frXKXd3PezGWeQsx6DsPYCnYTZe1PX577McWYYemAfmb6msqloqiQooooAKKKKACkpaKACiiigAooooASlpKKAFooooAKKKKACkpaKACiikoAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKuadqtzpzfu23Rk8xt0P09Kp0lAHcadqtvqSZiO2QfejPUf41czXn0cjwuskbsjqchgeRXS6T4iW4KwXhCSngP0DfX0pWKubtFJS1IwooooAKKKKACiiigAooooASloooAKKKKACiiigAooooAKKKKACiiigBKWikoAWiiigAooooAKKKKACiiigAooooAKKKKACiikJABJOMdaAFrA1nxCId1vZsGfo0nZfYe9V9b18zFra0bEfR5B/F7D2rBqkiWxSxZizEknkk9TRRRTEFFFFABRRRQAUUUUAJS0UUAFFFFABRRRQAlFLRQAlFLRQAUlLRQAlLRRQAUlFLQAUUUUAJRS0UAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBs6P4ge1KwXRLw9n7p/wDWrqUdZFDowZTyCDwa88rS0jWpdNfY+57cnle6+4pNDTOzoqOCaO4iWWJwyMMgipKkoKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBKWiigAopKWgAooooAKKKKACiiigAooooAKKKKACiiigBCQBknAFcvruuG4LWtsxEI4dwfv8At9Kfr+tGQtZ2z4QcSOO59PpWDVJEthRRRTEFFFFABRRRQAUUUUAJS0UUAJRS0UAFJS0UAFFFFACUUtFACUtFJQAUtFFACUtFFABSUtFABRRRQAUlLRQAUlLRQAlLRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAX9J1aTTJectAx+ZPT3HvXYwzR3ESyxMHRhkEV59Wlo2rtp0ux8tbufmX+77ik0NM7Oimo6yIrowZWGQR0Ip1SUFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUlLRQAUlLRQAUUlLQAUUUUAFFFFABRRRQAVh+IdYNsptIG/esPnYfwj/Gr2ramumWpccytxGp9fWuKeRpXaR2LMxySe5ppCbEoooqiQooooAKKKKACiiigAooooASloooAKSlpKAFooooAKKKKACikpaACiiigAooooASilooAKSlooAKKKKAEpaKKAEopaKAEpaKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA2fD+sG1cWk7fuWOEJ/gP+FdV3rzyup8O6t9pj+yzN+9QfK394f40mhpm1S0UVJQUUUUAFFFFACUtFFACUUtFABRRRQAlLRRQAUUlFAC0UUUAFFFFABRRRQAUUUUAFFFFABTJZVhjaRzhVGSfQU+ub8T6jyLGI/7Up/kKYmZOp376jdtM2Qo4Rf7oqrRRVEhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACUtJS0AFFFFABSUtFACUtFJQAtFFFABRRRQAUUUUAFFFFABRRRQAUUUlAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFOhme3lWWNtrocg02igDutOvk1C1WdOCeGX0PerVcboGpfYLza5/cy8N7Hsa7EVLKQtFFFIYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUlAC0UUUAFFJS0AFFFFABRRSGgCC/u1sbWS4foo4Hqe1cLJI80jySHLuck+9bXii98y4W0VsrGNzf7x/+tWHVIlhRRRTEFFFFABRRRQAUUUUAFFFFABRRRQAUlFLQAUUlLQAUlLRQAUUUUAJS0lLQAUUUUAFFFFABRRRQAlFLSUALRRRQAUlLRQAUUUUAJRS0UAJS0UUAFFFFABRRRQAlLRRQAUUUUAFFFFACUUtFACUUtFABRRRQAUlLRQAUlLRQAUUUUAJS0UUAFFFFABRRRQAldj4f1D7bZBHOZYfkbPcdjXH1e0W9+w36OT+7f5H+h70mNHa0tH60VJQUUUUAFFFFACUtFFABSUtFABRRRQAlFLRQAUUUUAFFFFABRRRQAUUUUAJUdzOttBJO33Y1LGpKw/FV35dqlsp5lOW/3RTEzmppWnleVzlnJY02iiqJCiiigAooooAKKKKACiiigAooooAKKKKACiiigAopKWgAopKWgAooooAKKKKACiiigAooooAKKKSgBaSlpKAFoopKAFoopKAFpKKWgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKQilooA7PQrw3unRljl0+Rvw6fpWjXKeF7vyrxrc/dlBwPcV1dSykFFFFIYUUUUAFFFFABRRRQAUUUUAFFJS0AFFJS0AFFFFABRRRQAUUUUAJXG+Ibn7RqcgH3YsIPw6/rXYSyCKJ5GOAgLGvP3cyOznqxJP1NUiWJRRRTEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFJRQAUUtFABSUtFABSUtFACUUtFABRRRQAUUUUAJS0UUAFJS0UAFFJRQAUUtFABSUtFACUtFJQAtFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAEltMba5imU8xuGrvkcOoZeQRkV55jNdroU/n6ZAc5KjYfqKTGjQoooqSgooooAKKKKACiiigAooooAKKKSgBaSiloAKKKKACiiigAoopDQBQ16bydKnIPLAKPxNcXXUeLJNtjDGP45cn6AH/GuWFUiWLRRRTEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFJS0UAJS0UUAFFFFABRRRQAlFLRQAUUUUAFFFFABRRRQAUlLRQAlLRRQAlFLRQAUlLRQAlFLRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFdL4Smzb3EOfuuGH4j/61c1W14Vl230kfZ4/5Gkxo6qkpaKkoKKKKACiiigBKWiigAooooAKSlooASloooAKKKKACiiigApKWigDm/Fz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" alt="Avatar de ${amigo.nombre}">
                <p>${amigo.nombre}</p>
                <button onclick="eliminarAmigo('${amigo._id}')">Eliminar</button>
            `;
            contenedorAmigos.appendChild(divAmigo);
        });
        cargarPublicacionesDeAmigos();
    } catch (error) {
        console.error("cargarAmigos: Error al cargar amigos:", error);
        contenedorAmigos.innerHTML = `<p class='error'>Error al cargar la lista de amigos: ${error.message}</p>`;
    }
}

// 🔹 Cargar publicaciones de amigos
async function cargarPublicacionesDeAmigos() {
    const contenedorPublicacionesAmigos = document.getElementById("contenedor-publicaciones-amigos");
    contenedorPublicacionesAmigos.innerHTML = "<p class='loading'>Cargando publicaciones...</p>";
    try {
        console.log("cargarPublicacionesDeAmigos: Cargando publicaciones de amigos"); // Log
        const response = await fetch(`${BACKEND_URL}/publicaciones-amigos`, {
            method: "GET",
            headers: {
                "Authorization": TOKEN,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`cargarPublicacionesDeAmigos: Error al cargar publicaciones: ${response.status} - ${errorText}`);
            throw new Error(`Error al cargar publicaciones: ${response.status} - ${errorText}`);
        }

        const publicacionesAmigos = await response.json();
        console.log("cargarPublicacionesDeAmigos: Publicaciones recibidas:", publicacionesAmigos); // Log
        contenedorPublicacionesAmigos.innerHTML = "";
        if (publicacionesAmigos.length === 0) {
            contenedorPublicacionesAmigos.innerHTML = "<p>No hay publicaciones de tus amigos.</p>";
            return;
        }

        publicacionesAmigos.forEach(publicacion => {
            const fecha = new Date(publicacion.fecha).toLocaleString();
            const usuarioNombre = publicacion.usuario ? publicacion.usuario.nombre : "Usuario Desconocido";

            const divMensaje = document.createElement("div");
            divMensaje.className = "mensaje";
            divMensaje.innerHTML = `
                <strong>${usuarioNombre}</strong>
                <span>Publicado el ${fecha}</span>
                <br/><br/><p>${publicacion.contenido}</p>
            `;
            contenedorPublicacionesAmigos.appendChild(divMensaje);
        });

    } catch (error) {
        console.error("cargarPublicacionesDeAmigos: Error al cargar publicaciones de amigos:", error);
        contenedorPublicacionesAmigos.innerHTML = `<p class='error'>Error al cargar las publicaciones de tus amigos: ${error.message}</p>`;
    }
}

// 🔹 Dar "Me gusta"
async function darMeGusta(id) {
    try {
        console.log(`darMeGusta: Dando me gusta al mensaje con ID ${id}`); // Log
        const response = await fetch(`${BACKEND_URL}/mensaje/${id}/like`, {
            method: "POST",
            headers: {
                "Authorization": TOKEN,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const data = await response.json();
            const mensaje = data.error || "Error desconocido al dar me gusta";
            console.error(`darMeGusta: Error al dar me gusta: ${mensaje}`);  // Log
            alert(mensaje);
        }
        console.log(`darMeGusta: Me gusta agregado al mensaje con ID ${id}`); // Log
        cargarPublicacionesDeAmigos();
    } catch (error) {
        console.error("darMeGusta: Error al dar me gusta:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
});