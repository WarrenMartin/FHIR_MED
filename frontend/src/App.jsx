import { Routes, Route } from 'react-router-dom';
import PatientsList from './PatientsList';
import PatientDetail from './components/PatientDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PatientsList />} />
      <Route path="/patient/:id" element={<PatientDetail />} />
    </Routes>
  );
}
