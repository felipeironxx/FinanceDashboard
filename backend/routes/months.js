const express = require('express');
const router = express.Router();
const db = require('../db');

// 🔄 Função para recalcular saldo anterior e saldo final de forma encadeada
async function recalculateFrom(month, year) {
  const result = await db.query(
    `SELECT * FROM months
     WHERE (year > $1) OR (year = $1 AND month >= $2)
     ORDER BY year ASC, month ASC`,
    [year, month]
  );
  const months = result.rows;

  // Buscar saldo final do mês anterior
  const prevResult = await db.query(
    `SELECT saldo_final FROM months
     WHERE (year < $1) OR (year = $1 AND month < $2)
     ORDER BY year DESC, month DESC
     LIMIT 1`,
    [year, month]
  );

  let saldoAnterior = prevResult.rows.length > 0 ? Number(prevResult.rows[0].saldo_final) : 0;

  for (const m of months) {
    const totalReceitas = Number(m.salario) + Number(m.saldo_extra);
    const totalDespesas = Number(m.itau) + Number(m.nubank);
    const saldoFinal = saldoAnterior + totalReceitas - totalDespesas;

    await db.query(
      `UPDATE months SET saldo_anterior = $1, saldo_final = $2 WHERE id = $3`,
      [saldoAnterior, saldoFinal, m.id]
    );

    saldoAnterior = saldoFinal;
  }
}

// 🔍 Listar todos os meses (ordem do mais recente para o mais antigo)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM months
       ORDER BY year DESC, month DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 Obter mês por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM months WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mês não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Criar novo mês
router.post('/', async (req, res) => {
  try {
    const { month, year, itau = 0, nubank = 0, salario = 0, saldo_extra = 0 } = req.body;

    const insertResult = await db.query(
      `INSERT INTO months (month, year, itau, nubank, salario, saldo_extra, saldo_anterior, saldo_final)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 0) RETURNING *`,
      [month, year, itau, nubank, salario, saldo_extra]
    );

    const created = insertResult.rows[0];

    // Recalcula os saldos a partir do novo mês
    await recalculateFrom(created.month, created.year);

    const updated = await db.query(`SELECT * FROM months WHERE id = $1`, [created.id]);

    res.status(201).json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Editar mês
router.put('/:id', async (req, res) => {
  try {
    const { itau, nubank, salario, saldo_extra } = req.body;
    const id = req.params.id;

    const currentResult = await db.query(`SELECT * FROM months WHERE id = $1`, [id]);
    if (currentResult.rows.length === 0) return res.status(404).json({ error: 'Mês não encontrado' });

    const current = currentResult.rows[0];

    await db.query(
      `UPDATE months
       SET itau = $1, nubank = $2, salario = $3, saldo_extra = $4
       WHERE id = $5`,
      [itau, nubank, salario, saldo_extra, id]
    );

    // Recalcula os saldos a partir do mês editado
    await recalculateFrom(current.month, current.year);

    const updated = await db.query(`SELECT * FROM months WHERE id = $1`, [id]);

    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  router,
  recalculateFrom
};