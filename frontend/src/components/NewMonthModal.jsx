import React, { useState } from 'react';

export default function NewMonthModal({ onClose, onCreated }) {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  async function handleCreate() {
    if (!month || !year) {
      alert('Preencha mês e ano');
      return;
    }

    const response = await fetch('http://192.168.0.8:4000/months', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year }),
    });

    if (response.ok) {
      onCreated();
    } else {
      alert('Erro ao criar mês');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">Novo Mês de Faturamento</h3>
        <label className="block mb-2">
          Mês (ex: 2)
          <input
            type="text"
            className="border p-2 w-full"
            value={month}
            onChange={e => setMonth(e.target.value.toLowerCase())}
            placeholder="2"
          />
        </label>
        <label className="block mb-4">
          Ano (ex: 2025)
          <input
            type="text"
            className="border p-2 w-full"
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="2025"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
}
