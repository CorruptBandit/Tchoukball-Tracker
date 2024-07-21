import { Route, Routes } from "react-router-dom";
import ExcelUpload from './components/ExcelUpload';
import SpreadsheetViewer from './components/SpreadsheetViewer';
import TrackerView from "./pages/TrackerView";
import MatchesView from "./pages/MatchesView";
import PageNotFound from "./pages/PageNotFound";
import CreateMatchView from "./pages/CreateMatchView";
import { createTheme, ThemeProvider } from "@mui/material";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      background: {
        default: '#f5f5f5',
      },
    },
  });
  
  return (
    <div className="flex flex-col justify-between" style={{width: "100vw"}}>
      <ThemeProvider theme={theme}>
        <Routes>
            <Route path="/" element={<MatchesView />} />
            <Route path="/create-match" element={<CreateMatchView />} />
            <Route path="/match/:matchId/third/:third" element={<TrackerView />} />
            <Route path="/upload" element={<ExcelUpload/>} />
            <Route path="/view" element={<SpreadsheetViewer/>} />
            <Route path="/*" element={<PageNotFound/>} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
