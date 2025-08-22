document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No estás autenticado. Redirigiendo al inicio de sesión...");
        window.location.href = "log.html";
        return;
    }

    const profilePic = document.getElementById("profile-pic");
    const uploadPic = document.getElementById("upload-pic");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const saveButton = document.getElementById("save-profile");

    let avatarActual = "";

    // Cargar datos actuales del perfil desde el servidor
    try {
        const response = await fetch("http://localhost:3000/perfil", {
            method: "GET",
            headers: { "Authorization": token }
        });

        if (!response.ok) {
            throw new Error("Error al obtener perfil.");
        }

        const usuario = await response.json();
        console.log("🔍 Datos del perfil obtenidos:", usuario);

        usernameInput.value = usuario.nombre || "";
        emailInput.value = usuario.email || "";
        avatarActual = usuario.avatarUrl || "images/default-avatar.png";
        profilePic.src = avatarActual;

    } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
    }

    // Evento para subir imagen
    uploadPic.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("avatar", file);

            try {
                const response = await fetch("http://localhost:3000/subir-imagen", {
                    method: "POST",
                    headers: {
                        "Authorization": token // Asegúrate de enviar el token
                    },
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Error al subir la imagen.");
                }

                console.log("✅ Imagen subida correctamente:", data.avatarUrl); // Depuración
                profilePic.src = data.avatarUrl;
                localStorage.setItem("profileImage", data.avatarUrl); // Guarda la URL de la imagen subida

            } catch (error) {
                console.error("❌ Error al subir la imagen:", error);
                alert("Hubo un error al subir la imagen.");
            }
        }
    });

    // Guardar cambios
    saveButton.addEventListener("click", async () => {
        const nuevoNombre = usernameInput.value.trim();
        const nuevoEmail = emailInput.value.trim();
        const imagenGuardada = localStorage.getItem("profileImage");

        const avatarUrl = imagenGuardada || avatarActual;

        if (!nuevoNombre || !nuevoEmail) {
            alert("Por favor, completa todos los campos antes de guardar.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/editar-perfil", {
                method: "PUT",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre: nuevoNombre,
                    email: nuevoEmail,
                    avatarUrl: avatarUrl
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje || "Error al actualizar el perfil.");
            }

            // Limpiar imagen temporal
            localStorage.removeItem("profileImage");

            alert("Perfil actualizado correctamente, si modificaste el correo tendras que iniciar sesion nuevamente.");
            window.location.href = "profile.html";

        } catch (error) {
            console.error("❌ Error al actualizar el perfil:", error);
            alert("Hubo un error al actualizar el perfil.");
        }
    });
});