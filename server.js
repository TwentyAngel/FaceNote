const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// **SERVIR ARCHIVOS ESTÁTICOS**
app.use(express.static(path.join(__dirname, 'public')));

// Conexión con MongoDB Atlas
mongoose.connect('mongodb+srv://Angel:admin2332@facenote.ikezyuw.mongodb.net/?retryWrites=true&appName=facenote', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Conexión exitosa a MongoDB Atlas'))
    .catch(err => console.log('Error conectando a MongoDB:', err));

// Esquema de usuarios con amigos
const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    avatarUrl: { type: String, default: 'public/images/perfil.jpg' }, // ✅ Corregido: Ruta relativa
    amigos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    estado: { type: String, default: "Disponible" },
    publicaciones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mensaje' }]
});

const User = mongoose.model('User', UserSchema);

// Esquema de mensajes con likes y referencia a usuario
const MensajeSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contenido: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    usuariosQueDieronLike: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const Mensaje = mongoose.model('Mensaje', MensajeSchema);


// Middleware para verificar el token de sesión
function autenticarToken(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ mensaje: "Token requerido" });

    try {
        const decoded = jwt.verify(token, "SECRET_KEY");
        req.userEmail = decoded.email; // ✅ Usamos el email que sí está en el token
        next();
    } catch (err) {
        return res.status(403).json({ mensaje: "Token inválido" });
    }
}



// 🔹 Ruta para registrar un nuevo usuario
app.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password, fechaNacimiento } = req.body;

        // Verificar si el email ya está en uso
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El email ya está registrado.' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear un nuevo usuario
        const nuevoUsuario = new User({
            nombre,
            email,
            password: hashedPassword,
            fechaNacimiento
        });

        // Guardar el usuario en la base de datos
        await nuevoUsuario.save();

        // Crear un token JWT para la sesión
        const token = jwt.sign({ email: nuevoUsuario.email }, 'SECRET_KEY', { expiresIn: '1h' });

        // Devolver el token al cliente
        res.status(201).json({ mensaje: 'Usuario registrado con éxito.', token });

    } catch (error) {
        console.error("Error en /registro:", error);
        res.status(500).json({ mensaje: 'Error al registrar usuario: ' + error.message });
    }
});


// 🔹 Ruta para iniciar sesión
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar al usuario por email
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Email incorrecto.' });
        }

        // Verificar la contraseña
        const passwordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecto) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
        }

        // Crear un token JWT para la sesión
        const token = jwt.sign({
            userId: usuario._id,  // Incluir el ID del usuario en el token
            email: usuario.email
        }, 'SECRET_KEY', { expiresIn: '1h' });

        // Devolver el token al cliente
        res.status(200).json({ mensaje: 'Inicio de sesión exitoso.', token });

    } catch (error) {
        console.error("Error en /login:", error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión: ' + error.message });
    }
});


// 🔹 Ruta para obtener el perfil del usuario
app.get('/perfil', autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findOne({ email: req.userEmail }); // Usar req.userEmail

        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

        res.status(200).json(usuario);
    } catch (error) {
        console.error("Error en /perfil:", error);
        res.status(500).json({ mensaje: 'Error al obtener perfil: ' + error.message });
    }
});

app.get('/perfil-pantalla', autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findOne({ email: req.userEmail }); // Usar req.userEmail

        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });

        res.status(200).json({ nombre: usuario.nombre });
    } catch (error) {
        console.error("Error en /perfil-pantalla:", error);
        res.status(500).json({ mensaje: "Error al obtener perfil." });
    }
});

// 🔹 Ruta para actualizar perfil con la imagen subida
app.put('/editar-perfil', autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findOne({ email: req.userEmail }); // Usar req.userEmail

        if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });

        usuario.nombre = req.body.nombre || usuario.nombre;
        usuario.email = req.body.email || usuario.email;
        usuario.avatarUrl = req.body.avatarUrl || usuario.avatarUrl;

        await usuario.save();
         // 🔑 Generar un nuevo token (solo con userId y email)
        const nuevoToken = jwt.sign(
            {
                userId: usuario._id,
                email: usuario.email,
            },
            'SECRET_KEY',
            { expiresIn: '1h' }
        );
        res.status(200).json({ mensaje: "Perfil actualizado correctamente.", token: nuevoToken });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ mensaje: "Error al actualizar el perfil." });
    }
});


// Configuración de Multer para la subida de imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Directorio donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext); // Nombre único para el archivo
    }
});

const upload = multer({ storage });

app.post('/subir-imagen', autenticarToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ mensaje: 'No se ha seleccionado ningún archivo.' });
        }
        // La URL de la imagen subida estará en req.file.path
        const imageUrl = `/images/${req.file.filename}`;  // Corrección de la ruta para que sea accesible desde el navegador
        res.status(200).json({ mensaje: 'Imagen subida correctamente.', imageUrl });
    } catch (error) {
        console.error("Error al subir imagen:", error);
        res.status(500).json({ mensaje: "Error al subir la imagen." });
    }
});


// 🔹 Ruta para obtener todos los usuarios (menos el usuario logeado) para sugerencias de amistad
app.get('/usuarios', autenticarToken, async (req, res) => {
    try {
        const usuarioLogeado = await User.findOne({ email: req.userEmail });
        if (!usuarioLogeado) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Obtener usuarios que no son amigos del usuario logeado y no es el usuario logeado
        const usuariosSugeridos = await User.find({
            _id: { $ne: usuarioLogeado._id, $nin: usuarioLogeado.amigos },
        }).select('nombre avatarUrl');

        res.json(usuariosSugeridos);
    } catch (error) {
        console.error("Error en /usuarios:", error);
        res.status(500).json({ mensaje: "Error al obtener sugerencias de amigos" });
    }
});

// 🔹 Ruta para agregar un amigo
app.post('/amigo/:id/agregar', autenticarToken, async (req, res) => {
    try {
        const usuarioLogeado = await User.findOne({ email: req.userEmail });
        const amigoAAgregar = await User.findById(req.params.id);

        if (!usuarioLogeado) {
            return res.status(404).json({ mensaje: "Usuario logeado no encontrado" });
        }
        if (!amigoAAgregar) {
            return res.status(404).json({ mensaje: "Amigo a agregar no encontrado" });
        }

        // Verificar si ya son amigos
        if (usuarioLogeado.amigos.includes(amigoAAgregar._id)) {
            return res.status(400).json({ mensaje: "Ya son amigos" });
        }

        // Agregar amigo a la lista de amigos del usuario logeado
        usuarioLogeado.amigos.push(amigoAAgregar._id);
        await usuarioLogeado.save();

        // Agregar usuario logeado a la lista de amigos del amigo a agregar (mutual)
        amigoAAgregar.amigos.push(usuarioLogeado._id);
        await amigoAAgregar.save();

        res.json({ mensaje: "Amigo agregado correctamente" });
    } catch (error) {
        console.error("Error en /amigo/:id/agregar:", error);
        res.status(500).json({ mensaje: "Error al agregar amigo" });
    }
});

// 🔹 Ruta para eliminar un amigo
app.delete('/amigo/:id/eliminar', autenticarToken, async (req, res) => {
    try {
        const usuarioLogeado = await User.findOne({ email: req.userEmail });
        const amigoAEliminar = await User.findById(req.params.id);

        if (!usuarioLogeado) {
            return res.status(404).json({ mensaje: "Usuario logeado no encontrado" });
        }
        if (!amigoAEliminar) {
            return res.status(404).json({ mensaje: "Amigo a eliminar no encontrado" });
        }

        // Verificar si son amigos
        if (!usuarioLogeado.amigos.includes(amigoAEliminar._id)) {
            return res.status(400).json({ mensaje: "No son amigos" });
        }

        // Eliminar amigo de la lista de amigos del usuario logeado
        usuarioLogeado.amigos.pull(amigoAEliminar._id);
        await usuarioLogeado.save();

        // Eliminar usuario logeado de la lista de amigos del amigo a eliminar (mutual)
        amigoAEliminar.amigos.pull(usuarioLogeado._id);
        await amigoAEliminar.save();

        res.json({ mensaje: "Amigo eliminado correctamente" });
    } catch (error) {
        console.error("Error en /amigo/:id/eliminar:", error);
        res.status(500).json({ mensaje: "Error al eliminar amigo" });
    }
});


// 🔹 Ruta para obtener la lista de amigos de un usuario
app.get('/amigos', autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findOne({ email: req.userEmail }).populate('amigos', 'nombre'); // Solo necesitamos el nombre
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        res.json({amigos: usuario.amigos, cantidad: usuario.amigos.length});
    } catch (error) {
        console.error("Error en /amigos:", error);
        res.status(500).json({ mensaje: "Error al obtener la lista de amigos" });
    }
});

// 🔹 Ruta para obtener las publicaciones de los amigos
app.get('/publicaciones-amigos', autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findOne({ email: req.userEmail }).populate({
            path: 'amigos',
            select: '_id' // Solo necesitamos los IDs de los amigos para luego buscar sus publicaciones
        });

        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Obtener las publicaciones de los amigos
        const publicacionesAmigos = await Mensaje.find({
            usuario: { $in: usuario.amigos } // Buscar mensajes donde el autor esté en la lista de amigos
        }).populate({
            path: 'usuario',
            select: 'nombre' // Incluir el nombre del usuario que publicó
        }).sort({ fecha: -1 });

        res.json(publicacionesAmigos);
    } catch (error) {
        console.error("Error en /publicaciones-amigos:", error);
        res.status(500).json({ mensaje: "Error al cargar las publicaciones de los amigos" });
    }
});


// 🔹 Ruta para crear un nuevo mensaje
app.post('/mensaje', autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findOne({ email: req.userEmail });
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        const nuevoMensaje = new Mensaje({
            usuario: usuario._id,
            contenido: req.body.mensaje
        });

        await nuevoMensaje.save();

        // Agregar el mensaje a la lista de publicaciones del usuario
        usuario.publicaciones.push(nuevoMensaje._id);
        await usuario.save();

        res.status(201).json({ mensaje: "Mensaje publicado correctamente" });
    } catch (error) {
        console.error("Error en /mensaje:", error);
        res.status(500).json({ mensaje: "Error al publicar el mensaje" });
    }
});

// Ruta para obtener todos los mensajes
app.get('/mensajes', async (req, res) => {
    try {
        // Populate 'usuario' and select 'nombre' and 'avatarUrl'
        const mensajes = await Mensaje.find().populate({
            path: 'usuario',
            select: 'nombre avatarUrl'
        }).sort({ fecha: -1 });

         // Map the results to ensure usuario is always an object with nombre
        const mensajesConUsuario = mensajes.map(mensaje => {
            return {
                ...mensaje.toObject(),
                usuario: mensaje.usuario || { nombre: "Anónimo", avatarUrl: "public/images/perfil.jpg" }
            };
        });
        res.json(mensajesConUsuario);
    } catch (error) {
        console.error("Error en /mensajes:", error);
        res.status(500).json({ mensaje: 'Error al obtener los mensajes.' });
    }
});


// 🔹 Ruta para dar "Me gusta" a un mensaje
app.post('/mensaje/:id/like', autenticarToken, async (req, res) => {
    try {
        const mensaje = await Mensaje.findById(req.params.id);
        if (!mensaje) {
            return res.status(404).json({ mensaje: "Mensaje no encontrado" });
        }

        const usuario = await User.findOne({ email: req.userEmail });
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Verificar si el usuario ya dio "me gusta" al mensaje
        const yaDioLike = mensaje.usuariosQueDieronLike.some(user_id => user_id.toString() === usuario._id.toString());

        if (!yaDioLike) {
            mensaje.usuariosQueDieronLike.push(usuario._id);
            mensaje.likes = (mensaje.likes || 0) + 1;
            await mensaje.save();
            res.status(200).json({ mensaje: "Me gusta agregado", likes: mensaje.likes }); // Corrección aquí
        } else {
            res.status(200).json({ mensaje: "Ya diste like a este mensaje", likes: mensaje.likes });
        }
    } catch (error) {
        console.error("Error en /mensaje/:id/like:", error);
        res.status(500).json({ mensaje: "Error al dar Me Gusta: " + error.message });
    }
});



// 🔹 Ruta para eliminar un mensaje
app.delete('/mensaje/:id', autenticarToken, async (req, res) => {
    try {
        const mensaje = await Mensaje.findById(req.params.id);
        if (!mensaje) {
            return res.status(404).json({ mensaje: "Mensaje no encontrado" });
        }

        const usuario = await User.findOne({ email: req.userEmail });
        if (!usuario) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        // Verificar si el usuario es el autor del mensaje
        if (!mensaje.usuario.equals(usuario._id)) {
            return res.status(403).json({ mensaje: "No tienes permiso para eliminar este mensaje" });
        }

        await Mensaje.deleteOne({ _id: req.params.id }); // Eliminar el mensaje
        res.json({ mensaje: "Mensaje eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar mensaje:", error);
        res.status(500).json({ mensaje: "Error al eliminar el mensaje" });
    }
});

app.get('/mensajes/usuario', autenticarToken, async (req, res) => {
    try {
        const usuario = await User.findOne({ email: req.userEmail }).populate('mensajes');
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Filtra los mensajes para obtener solo los del usuario logueado
        const mensajesDelUsuario = usuario.mensajes.filter(m => {
            // Verifica si m.usuario es un objeto y tiene la propiedad nombre, o si es solo una cadena
            const usuarioNombre = m.usuario ? (typeof m.usuario === 'string' ? m.usuario : m.usuario.nombre) : '';
            return usuarioNombre.trim() === nombreUsuario.trim();
        });

        if (mensajesDelUsuario.length === 0) {
            return res.status(404).json({ mensaje: 'No has publicado ningún mensaje' });
        }

        res.json(mensajesDelUsuario);
    } catch (error) {
        console.error("Error al cargar mensajes del usuario:", error);
        res.status(500).json({ mensaje: "Error al cargar tus mensajes." });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});