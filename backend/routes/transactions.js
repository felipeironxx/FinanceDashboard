const express = require('express');
const router = express.Router();
const db = require('../db');
const { recalculateFrom } = require('./months');

// 🔄 Atualiza o total do tipo (itau, nubank, etc) no mês correspondente
async function atualizarTotalDoTipo(monthsId, type) {
  const sqlSoma = `
    SELECT COALESCE(SUM(valor), 0) AS total
    FROM transactions
    WHERE months_id = $1 AND tipo = $2
  `;

  const somaResult = await db.query(sqlSoma, [monthsId, type]);
  const total = somaResult.rows[0].total;

  const sqlUpdate = `
    UPDATE months
    SET ${type} = $1
    WHERE id = $2
  `;

  await db.query(sqlUpdate, [total, monthsId]);

  return total;
}

// 🔍 Buscar todas as transações de um mês e tipo
router.get('/', async (req, res) => {
  const { monthsId, type } = req.query;

  if (!monthsId || !type) {
    return res.status(400).json({ error: 'Parâmetros monthsId e type são obrigatórios' });
  }

  try {
    const sql = `
      SELECT id, months_id AS "monthsId", tipo AS "type", descricao AS "description",
             valor AS "value", data AS "date"
      FROM transactions
      WHERE months_id = $1 AND tipo = $2
      ORDER BY data ASC
    `;
    const result = await db.query(sql, [monthsId, type]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Criar uma nova transação
router.post('/', async (req, res) => {
  const { monthsId, type, description, value, date } = req.body;

  try {
    const sql = `
      INSERT INTO transactions (months_id, tipo, descricao, valor, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const result = await db.query(sql, [monthsId, type, description, value, date]);

    await atualizarTotalDoTipo(monthsId, type);

    // 🔄 Recalcular os saldos após alteração
    const monthResult = await db.query('SELECT month, year FROM months WHERE id = $1', [monthsId]);
    const { month, year } = monthResult.rows[0];
    await recalculateFrom(month, year);

    res.json({ id: result.rows[0].id, monthsId, type, description, value, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Editar uma transação existente
router.put('/:id', async (req, res) => {
  const { monthsId, type, description, value, date } = req.body;
  const { id } = req.params;

  try {
    const busca = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
    const transacaoAtual = busca.rows[0];

    if (!transacaoAtual) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const sql = `
      UPDATE transactions
      SET months_id = $1, tipo = $2, descricao = $3, valor = $4, data = $5
      WHERE id = $6
    `;
    await db.query(sql, [monthsId, type, description, value, date, id]);

    // Atualiza o tipo atual
    await atualizarTotalDoTipo(monthsId, type);

    // Se o tipo foi alterado, atualiza o tipo antigo também
    if (type !== transacaoAtual.tipo) {
      await atualizarTotalDoTipo(monthsId, transacaoAtual.tipo);
    }

    // 🔄 Recalcular os saldos após alteração
    const monthResult = await db.query('SELECT month, year FROM months WHERE id = $1', [monthsId]);
    const { month, year } = monthResult.rows[0];
    await recalculateFrom(month, year);

    res.json({ message: 'Transaction updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Deletar uma transação
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const busca = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
    const transacao = busca.rows[0];

    if (!transacao) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db.query('DELETE FROM transactions WHERE id = $1', [id]);

    await atualizarTotalDoTipo(transacao.months_id, transacao.tipo);

    // 🔄 Recalcular os saldos após exclusão
    const monthResult = await db.query('SELECT month, year FROM months WHERE id = $1', [transacao.months_id]);
    const { month, year } = monthResult.rows[0];
    await recalculateFrom(month, year);

    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
