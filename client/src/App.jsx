import React from 'react';
import ExcelUpload from './components/ExcelUpload'; // Adjust the path as necessary
import SpreadsheetViewer from './components/SpreadsheetViewer'; // Adjust the path as necessary


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Excel File Uploader</h1>
      </header>
      <main>
        <SpreadsheetViewer />
      </main>
    </div>
  );
}

export default App;
