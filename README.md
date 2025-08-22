# FaceNote

FaceNote es una aplicación web desarrollada con Node.js y conectada a MongoDB (local o en Mongo Atlas).

**IMPORTANTE**: Este proyecto no funcionará sin una base de datos configurada.
Debes crear una base de datos en MongoDB Local o en Mongo Atlas y actualizar la cadena de conexión en el código antes de iniciar la aplicación.

Este proyecto forma parte del portafolio como programador de TwentyAngel.

# Requisitos:
- Node.js instalado
- MongoDB (local o en Mongo Atlas)

# Instalación y ejecución:

1. Clonar este repositorio:
   git clone https://github.com/TwentyAngel/FaceNote.git

2. Entrar en la carpeta del proyecto:
   cd "C:/Users/TuUsuario/Downloads/facenote"
   (Cambia la ruta por la ubicación real en tu PC)

3. Instalar dependencias:
   npm install

4. Configurar la base de datos:
   - Si usas MongoDB Local: asegúrate de que el servicio esté corriendo y usa una cadena como:
     mongodb://127.0.0.1:27017/facenote

   - Si usas Mongo Atlas: copia tu cadena de conexión desde el panel de Mongo Atlas, por ejemplo:
     mongodb+srv://<usuario>:<password>@cluster0.mongodb.net/facenote
     (Reemplaza <usuario> y <password> con tus credenciales)

5. Ejecutar el servidor:
   node server.js

6. Abrir el navegador en:
   http://localhost:3000
   (o el puerto que defina tu server.js)

**Nota**:
Este proyecto es de carácter demostrativo y forma parte de mi portafolio profesional.
