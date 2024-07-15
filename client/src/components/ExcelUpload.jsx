// src/components/ExcelUpload.jsx

import { useState } from "react";
import * as XLSX from 'xlsx';

function ExcelUpload() {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (file) {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            console.log(json)
            sendDataToServer(json);
        }
    };

    const sendDataToServer = (data) => {
        fetch('/api/spreadsheets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(() => alert('Data successfully uploaded'))
        .catch(error => alert('Failed to upload data: ' + error.message));
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} accept=".xlsx, .xls" />
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
}

export default ExcelUpload;
