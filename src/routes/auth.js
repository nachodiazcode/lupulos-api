import express from 'express';
const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     description: Permite a un usuario iniciar sesión con email y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *       401:
 *         description: Credenciales incorrectas.
 */
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    res.json({ mensaje: "Inicio de sesión exitoso", email });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     description: Permite registrar un nuevo usuario con email y contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *       400:
 *         description: Error en la solicitud.
 */
router.post('/register', (req, res) => {
    const { nombre, email, password } = req.body;
    res.status(201).json({ mensaje: "Usuario registrado correctamente", nombre, email });
});

export default router;
