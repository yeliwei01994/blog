import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NotFoundPage } from './pages/NotFoundPage';
import { HomePage } from './pages/HomePage';
import { DiaryIndexPage } from './pages/DiaryIndexPage';
import { AboutPage } from './pages/AboutPage';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/diary/" element={<DiaryIndexPage />} />
        <Route path="/about/" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
