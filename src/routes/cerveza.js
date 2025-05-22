import express from 'express';
const router = express.Router();

/**
 * @swagger
 * /api/cervezas:
 *   get:
 *     summary: Obtiene todas las cervezas
 *     description: Retorna una lista de todas las cervezas disponibles en la comunidad.
 *     responses:
 *       200:
 *         description: Lista de cervezas obtenida correctamente.
 */
router.get('/', (req, res) => {
    res.json([
        { id: 1, nombre: "Cerveza Negra", tipo: "Stout", alcohol: "6%" },
        { id: 2, nombre: "Cerveza Dorada", tipo: "Blonde Ale", alcohol: "5%" }
    ]);
});

/**
 * @swagger
 * /api/cervezas/{id}:
 *   get:
 *     summary: Obtiene una cerveza por ID
 *     description: Retorna una cerveza específica según su ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cerveza
 *     responses:
 *       200:
 *         description: Cerveza encontrada correctamente.
 *       404:
 *         description: Cerveza no encontrada.
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const cerveza = { id, nombre: "Cerveza Artesanal", tipo: "IPA", alcohol: "5.5%" };
    res.json(cerveza);
});

export default router;
