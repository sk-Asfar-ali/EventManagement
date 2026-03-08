import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserEventsPage from "./pages/UserEventsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserEventsPage />} />
      </Routes>
    </BrowserRouter>
  );
}