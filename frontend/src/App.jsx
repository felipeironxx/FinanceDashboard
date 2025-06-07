import React, { useEffect, useState } from 'react';
import MonthCard from './components/MonthCard';
import NewMonthModal from './components/NewMonthModal';

export default function App() {
  const [months, setMonths] = useState([]);
  const [showNewModal, setShowNewModal] = useState(false);

  async function fetchMonths() {
    const res = await fetch('http://192.168.0.8:4000/months');
    const date = await res.json();
    setMonths(date);
  }

  useEffect(() => {
    fetchMonths();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Finance Dashboard</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Novo Mês de Faturamento
        </button>
      </header>

      <div className="space-y-6">
        {months.length === 0 && <p>Carregando meses...</p>}
        {months.map(month => (
          <MonthCard key={month.id} month={month} onUpdate={fetchMonths} />
        ))}
      </div>

      {showNewModal && (
        <NewMonthModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            fetchMonths();
          }}
        />
      )}
    </div>
  );
}
