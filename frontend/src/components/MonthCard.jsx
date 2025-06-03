import React, { useState } from 'react';
import EditModal from './EditModal';

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// 🔥 Função para converter número do mês para nome
function getMonthName(monthNumber) {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[monthNumber - 1] || 'Mês Inválido';
}

export default function MonthCard({ month, onUpdate }) {
  const [showEdit, setShowEdit] = useState(null);

  const totalDespesa = (Number(month.itau) || 0) + (Number(month.nubank) || 0);
  const totalReceita = (Number(month.salario) || 0) + (Number(month.saldo_extra) || 0);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">
        {getMonthName(Number(month.month))} / {String(month.year).slice(2)}
      </h2>

      <div className="grid grid-cols-2 gap-8 mb-4">
        {/* Despesas */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">Despesas</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="font-semibold">Itaú</div>
              <div>{formatCurrency(Number(month.itau))}</div>
              <button
                onClick={() => setShowEdit('itau')}
                className="mt-1 text-sm text-blue-600 underline"
              >
                Editar
              </button>
            </div>
            <div>
              <div className="font-semibold">Nubank</div>
              <div>{formatCurrency(Number(month.nubank))}</div>
              <button
                onClick={() => setShowEdit('nubank')}
                className="mt-1 text-sm text-blue-600 underline"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        {/* Receitas */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-center">Receitas</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="font-semibold">Salário</div>
              <div>{formatCurrency(Number(month.salario))}</div>
              <button
                onClick={() => setShowEdit('salario')}
                className="mt-1 text-sm text-blue-600 underline"
              >
                Editar
              </button>
            </div>
            <div>
              <div className="font-semibold">Saldo Extra</div>
              <div>{formatCurrency(Number(month.saldo_extra))}</div>
              <button
                onClick={() => setShowEdit('saldo_extra')}
                className="mt-1 text-sm text-blue-600 underline"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 gap-4 text-center border-t pt-4 mt-4">
        <div>
          <div className="font-semibold">Total Despesas</div>
          <div>{formatCurrency(totalDespesa)}</div>
        </div>
        <div>
          <div className="font-semibold">Total Receitas</div>
          <div>{formatCurrency(totalReceita)}</div>
        </div>
      </div>

      {/* Saldos */}
      <div className="grid grid-cols-3 gap-4 text-center border-t pt-4 mt-4">
        <div>
          <div className="font-semibold text-sm">Saldo Anterior</div>
          <div className="text-blue-600">{formatCurrency(Number(month.saldo_anterior) || 0)}</div>
        </div>
        <div>
          <div className="font-semibold text-sm">Saldo Atual</div>
          <div className="text-green-600">{formatCurrency(Number(month.saldo_final) || 0)}</div>
        </div>
{/*}        <div>
          <div className="font-semibold text-sm">Saldo Extra</div>
          <div className="text-yellow-600">{formatCurrency(Number(month.saldo_extra) || 0)}</div>
        </div>*/}
      </div>

      {showEdit && (
        <EditModal
          month={month}
          field={showEdit}
          onClose={() => setShowEdit(null)}
          onUpdated={onUpdate}
        />
      )}
    </div>
  );
}
