import React, { useState } from 'react';

export default function EditModal({ month, field, onClose, onUpdated }) {
  const [value, setValue] = useState(month[field] || 0);
  const fieldNameMap = {
    itau: 'Itaú',
    nubank: 'Nubank',
    salario: 'Salário',
    saldo_extra: 'Saldo Mês/Extra',
  };

  async function handleSave() {
    const response = await fetch(`http://192.168.0.8:4000/months/${month.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itau: field === 'itau' ? Number(value) : month.itau,
        nubank: field === 'nubank' ? Number(value) : month.nubank,
        salario: field === 'salario' ? Number(value) : month.salario,
        saldo_extra: field === 'saldo_extra' ? Number(value) : month.saldo_extra,
      }),
    });
    if (response.ok) {
      onUpdated();
      onClose();
    } else {
      alert('Erro ao salvar');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">Editar {fieldNameMap[field]}</h3>
        <input
          type="number"
          step="0.01"
          className="border p-2 w-full mb-4"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
