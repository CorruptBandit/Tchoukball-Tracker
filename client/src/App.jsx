import { Route, Routes } from "react-router-dom";
import ExcelUpload from './components/ExcelUpload';
import SpreadsheetViewer from './components/SpreadsheetViewer';
import TrackerView from "./pages/TrackerView";
import PageNotFound from "./pages/PageNotFound";


function App() {
  return (
    <Routes>
        <Route path="/" element={<TrackerView id={"muppet"} />} />
        <Route path="/upload" element={<ExcelUpload/>} />
        <Route path="/view" element={<SpreadsheetViewer/>} />
        <Route path="/*" element={<PageNotFound/>} />
    </Routes>
  );
}

export default App;
