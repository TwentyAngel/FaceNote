document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const profileNameElement = document.getElementById("profile-name");

    // 🔹 Obtener el enlace de inicio/cierre de sesión
    const enlaceSesion = document.querySelector('a[href="log.html"]'); // Selector más específico

    if (!token) {
        profileNameElement.textContent = "Primero tienes que iniciar sesión";
        document.getElementById("profile-friends").style.display = "none";
        document.getElementById("edit-profile").style.display = "none";
        document.getElementById("birth-date").textContent = "-";
        document.getElementById("email").textContent = "-";
        document.getElementById("status").textContent = "-";
        document.getElementById("contenedor-publicaciones").innerHTML = "<p class='load'>No disponible sin iniciar sesión.</p>";

        // 🔹 Si no hay token, asegúrate de que el enlace diga "Iniciar sesión" y apunte a la página de inicio de sesión
        if (enlaceSesion) {
            enlaceSesion.textContent = "Iniciar sesión";
            enlaceSesion.href = "log.html";
        }
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/perfil", {
            method: "GET",
            headers: { "Authorization": token }
        });

        if (!response.ok) throw new Error("Error al obtener perfil");

        const usuario = await response.json();
        const nombreUsuario = usuario.nombre;

        profileNameElement.textContent = nombreUsuario || "Desconocido";
        document.getElementById("email").textContent = usuario.email || "Desconocido";
        document.getElementById("status").textContent = usuario.estado?.trim() || "Disponible";

        const birthDate = new Date(usuario.fechaNacimiento);
        const formattedDate = isNaN(birthDate.getTime())
            ? "Desconocida"
            : birthDate.toLocaleDateString("es-ES", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        document.getElementById("birth-date").textContent = formattedDate;

        cargarAmigos();
        cargarMensajesDelUsuario(nombreUsuario);

        // 🔹 Si hay un token, modifica el enlace para cerrar sesión
        if (enlaceSesion) {
            enlaceSesion.textContent = "Cerrar sesión";
            enlaceSesion.href = "logout.html";
            enlaceSesion.addEventListener("click", () => {
                localStorage.removeItem("token");
                window.location.href = "log.html";
            });
        }


    } catch (error) {
        console.error("❌ Error:", error);
        profileNameElement.textContent = "Error al cargar el perfil";
        document.getElementById("contenedor-publicaciones").innerHTML = `<p class='error'>${error.message}</p>`;
    }
});


async function cargarMensajesDelUsuario(nombreUsuario) {
    const contenedorPublicaciones = document.getElementById("contenedor-publicaciones");
    try {
        const response = await fetch("http://localhost:3000/mensajes", {
            method: "GET",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            throw new Error("Error al cargar los mensajes");
        }
        const mensajes = await response.json();

        const mensajesDelUsuario = mensajes.filter(mensaje => {
            const usuarioNombre = mensaje.usuario ? (typeof mensaje.usuario === 'string' ? mensaje.usuario : mensaje.usuario.nombre) : '';
            return usuarioNombre.trim() === nombreUsuario.trim();
        });

        if (mensajesDelUsuario.length === 0) {
            contenedorPublicaciones.innerHTML = "<p class='load'>No has publicado ningún mensaje.</p>";
            return;
        }

        contenedorPublicaciones.innerHTML = mensajesDelUsuario.map(mensaje => {
            const fecha = new Date(mensaje.fecha).toLocaleString();
            return `<div class="mensaje">
                        <strong>${mensaje.usuario.nombre}</strong>
                        <span class="date">Publicado el ${fecha}</span>
                        <br/><br/><p>${mensaje.contenido}</p>
                        <button onclick="darMeGusta('${mensaje._id}')">
                            <img src="images/like.png" alt="Me gusta">
                        </button>
                        ${mensaje.usuario._id === obtenerIdUsuarioDelToken() ?
                            `<button onclick="eliminarMensaje('${mensaje._id}')">
                                 <img src="images/delete.png" alt="Eliminar">
                             </button>` : ''}
                             <p class="likes">${mensaje.likes} Likes</p>
                    </div>`;
        }).join("");

    } catch (error) {
        console.error("Error al cargar mensajes del usuario:", error);
        contenedorPublicaciones.innerHTML = `<p class='error'>${error.message}</p>`;
    }
}

async function darMeGusta(mensajeId) {
    const token = obtenerToken();
    if (!token) {
        alert("Debes iniciar sesión para dar like a un mensaje.");
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/mensaje/${mensajeId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.error || "Error al dar like");
        }

        // Actualiza la interfaz después de dar "Me gusta"
        cargarMensajes(); // Llama a la función para recargar los mensajes
    } catch (error) {
        console.error("Error al dar like:", error);
        alert(error.message || "Error al dar like. Por favor, inténtelo de nuevo más tarde.");
    }
}

async function eliminarMensaje(id) {
    try {
        const response = await fetch(`http://localhost:3000/mensaje/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error);
        }

        // Recargar los mensajes después de eliminar uno
        const nombreUsuario = document.getElementById("profile-name").textContent;
        cargarMensajesDelUsuario(nombreUsuario);

    } catch (error) {
        console.error("Error al eliminar mensaje:", error);
    }
}


async function cargarAmigos() {
    const profileFriendsElement = document.getElementById("profile-friends");
    try {
        const response = await fetch("http://localhost:3000/amigos", {
            method: "GET",
            headers: {
                "Authorization": localStorage.getItem("token"),
            },
        });
        if (!response.ok) {
            throw new Error("Error al cargar la lista de amigos");
        }
        const data = await response.json();
        const amigos = data.amigos;

        if (amigos && amigos.length === 0) {
            profileFriendsElement.textContent = "No tienes amigos.";
        } else if (amigos) {
            profileFriendsElement.textContent = `${amigos.length} amigos`;
        } else {
            profileFriendsElement.textContent = "Amigos: 0";
        }


    } catch (error) {
        console.error("Error al cargar amigos:", error);
        profileFriendsElement.textContent = "Error al cargar amigos.";
    }
}

function obtenerIdUsuarioDelToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            throw new Error("Token inválido");
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("Payload del token:", payload);
        return payload.userId;
    } catch (error) {
        console.error("Error al decodificar el payload del token:", error);
        return null;
    }
}



window.darMeGusta = darMeGusta;
window.eliminarMensaje = eliminarMensaje;