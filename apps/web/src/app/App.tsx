import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
