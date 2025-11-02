import { useState } from 'react'

import { Header } from './components'

import './App.css';
import SummaryCards from './components/SummaryCards';

function App() {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header dateRange={dateRange} onChangeDateRange={setDateRange} />

      <main className="p-6">
        <SummaryCards dateRange={dateRange} />
      </main>
    </div>
  );
}

export default App;
