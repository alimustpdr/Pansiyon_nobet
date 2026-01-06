import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import DutyList from './pages/DutyList';
import Settings from './pages/Settings';
import Holidays from './pages/Holidays';
import Excuses from './pages/Excuses';
import Statistics from './pages/Statistics';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="duties" element={<DutyList />} />
        <Route path="settings" element={<Settings />} />
        <Route path="holidays" element={<Holidays />} />
        <Route path="excuses" element={<Excuses />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
