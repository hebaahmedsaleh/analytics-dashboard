
import { Header, SummaryCards, ScatterChartWithDateSelector, CoverageTrendsChart, Tabs } from './components';

import './App.css';
import { useDateRange } from './context/date-range-context';
import DetailedTable from './components/DetailedTable';

function App() {
  
  const { dateRange } = useDateRange();
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="p-6">
        <SummaryCards dateRange={dateRange} />
        
        {dateRange.start && dateRange.end && (
          <div className="mt-6">
            <Tabs
              tabs={[
                {
                  id: 'scatter',
                  label: 'Coverage vs Usage',
                  content: <ScatterChartWithDateSelector />
                },
                {
                  id: 'trends',
                  label: 'Coverage Trends',
                  content: <CoverageTrendsChart />
                },
                {
                  id: 'details',
                  label: 'API Details',
                  content: <DetailedTable />
                }
              ]}
              defaultTab="scatter"
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
