import React, { useEffect, useState } from 'react';

export default function TransactionModal({ month, type, onClose, onUpdated }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');

  const typeMap = {
    itau: 'Itaú',
    nubank: 'Nubank',
    saldo_extra: 'Saldo Extra',
  };

  async function fetchTransactions() {
    const res = await fetch(`http://localhost:4000/transactions?monthId=${month.id}&type=${type}`);
    const data = await res.json();
    setTransactions(data);
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function handleAdd() {
    if (!description || !value || !date) {
      alert('Preencha todos os campos');
      return;
    }

    await fetch('http://localhost:4000/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthId: month.id,
        type,
        description,
        value: Number(value),
        date,
      }),
    });

    setDescription('');
    setValue('');
    setDate('');
    fetchTransactions();
    onUpdated();
  }

  async function handleDelete(id) {
    if (!window.confirm('Deseja realmente excluir?')) return;

    await fetch(`http://localhost:4000/transactions/${id}`, {
      method: 'DELETE',
    });

    fetchTransactions();
    onUpdated();
  }

  async function handleEdit(id, field, newValue) {
    await fetch(`http://localhost:4000/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...transactions.find(t => t.id === id),
        [field]: field === 'value' ? Number(newValue) : newValue,
      }),
    });

    fetchTransactions();
    onUpdated();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-[500px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          Lançamentos - {typeMap[type]}
        </h3>

        <div className="space-y-4">
          {transactions.map(t => (
            <div key={t.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={t.description}
                onChange={e => handleEdit(t.id, 'description', e.target.value)}
                className="border p-1 flex-1"
              />
              <input
                type="number"
                step="0.01"
                value={t.value}
                onChange={e => handleEdit(t.id, 'value', e.target.value)}
                className="border p-1 w-24"
              />
              <input
                type="text"
                value={t.date}
                onChange={e => handleEdit(t.id, 'date', e.target.value)}
                className="border p-1"
              />
              <button
                onClick={() => handleDelete(t.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold mb-2">Novo Lançamento</h4>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Descrição"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border p-2 flex-1"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="border p-2 w-24"
            />
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border p-2"
            />
          </div>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Adicionar
          </button>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
