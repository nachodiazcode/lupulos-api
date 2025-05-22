import express from 'express';
const router = express.Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios
 *     description: Retorna una lista de todos los usuarios registrados en la aplicación.
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 */
router.get('/', (req, res) => {
    res.json([
        { id: 1, nombre: "Ignacio Díaz", email: "ignacio@example.com" },
        { id: 2, nombre: "Juan Pérez", email: "juan@example.com" }
    ]);
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID
 *     description: Retorna los detalles de un usuario específico.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado correctamente.
 *       404:
 *         description: Usuario no encontrado.
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const usuario = { id, nombre: "Usuario de prueba", email: `usuario${id}@example.com` };
    res.json(usuario);
});

export default router;
