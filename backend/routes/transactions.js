const express = require('express');
const router = express.Router();
const db = require('../db');

// Função para atualizar o total de um tipo no mês correspondente
function atualizarTotalDoTipo(month_id, tipo) {
  return new Promise((resolve, reject) => {
    const sqlSoma = `
      SELECT SUM(valor) as total
      FROM transactions
      WHERE month_id = ? AND tipo = ?
    `;
    db.get(sqlSoma, [month_id, tipo], (err, row) => {
      if (err) return reject(err);

      const total = row.total || 0;

      const sqlUpdate = `
        UPDATE months
        SET ${tipo} = ?
        WHERE id = ?
      `;
      db.run(sqlUpdate, [total, month_id], function (err) {
        if (err) return reject(err);
        resolve(total);
      });
    });
  });
}

// Buscar todas as transações de um mês e tipo
router.get('/', (req, res) => {
  const { month_id, tipo } = req.query;
  const sql = `
    SELECT * FROM transactions
    WHERE month_id = ? AND tipo = ?
    ORDER BY data ASC
  `;
  db.all(sql, [month_id, tipo], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Criar uma nova transação
router.post('/', (req, res) => {
  const { month_id, tipo, descricao, valor, data } = req.body;
  const sql = `
    INSERT INTO transactions (month_id, tipo, descricao, valor, data)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [month_id, tipo, descricao, valor, data];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    atualizarTotalDoTipo(month_id, tipo)
      .then(() => {
        res.json({ id: this.lastID, ...req.body });
      })
      .catch(err => res.status(500).json({ error: err.message }));
  });
});

// Editar uma transação existente
router.put('/:id', (req, res) => {
  const { month_id, tipo, descricao, valor, data } = req.body;

  const sqlBusca = 'SELECT * FROM transactions WHERE id = ?';
  db.get(sqlBusca, [req.params.id], (err, transacaoAtual) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!transacaoAtual) return res.status(404).json({ error: 'Transaction not found' });

    const sqlUpdate = `
      UPDATE transactions
      SET month_id = ?, tipo = ?, descricao = ?, valor = ?, data = ?
      WHERE id = ?
    `;
    const params = [month_id, tipo, descricao, valor, data, req.params.id];

    db.run(sqlUpdate, params, function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });

      const promessas = [];
      promessas.push(atualizarTotalDoTipo(month_id, tipo));

      if (tipo !== transacaoAtual.tipo) {
        promessas.push(atualizarTotalDoTipo(month_id, transacaoAtual.tipo));
      }

      Promise.all(promessas)
        .then(() => res.json({ message: 'Transaction updated' }))
        .catch(err => res.status(500).json({ error: err.message }));
    });
  });
});

// Deletar uma transação
router.delete('/:id', (req, res) => {
  const sqlBusca = 'SELECT * FROM transactions WHERE id = ?';
  db.get(sqlBusca, [req.params.id], (err, transacao) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!transacao) return res.status(404).json({ error: 'Transaction not found' });

    const sqlDelete = 'DELETE FROM transactions WHERE id = ?';
    db.run(sqlDelete, [req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Transaction not found' });

      atualizarTotalDoTipo(transacao.month_id, transacao.tipo)
        .then(() => res.json({ message: 'Transaction deleted' }))
        .catch(err => res.status(500).json({ error: err.message }));
    });
  });
});

module.exports = router;
