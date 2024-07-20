import ExcelUpload from './components/ExcelUpload'; // Adjust the path as necessary
import SpreadsheetViewer from './components/SpreadsheetViewer'; // Adjust the path as necessary
import Login from './pages/Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SpreadsheetViewer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<ExcelUpload />} />
      </Routes>
    </Router>
  );
}

export default App;
