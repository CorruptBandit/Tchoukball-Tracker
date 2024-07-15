// src/SpreadsheetViewer.jsx

import { dark } from '@mui/material/styles/createPalette';
import React, { useState, useEffect } from 'react';
import DataGrid from 'react-data-grid';

function SpreadsheetViewer() {
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/spreadsheets/6695724dac0d02421a17b287')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const nestedData = data.data;
                if (nestedData && nestedData.length > 0) {
                    const transformedData = nestedData.map(row => {
                        const rowObj = {};
                        row.forEach(({Key, Value}) => {
                            // Create more meaningful column names here
                            const columnName = Key.replace('__EMPTY_', '').replace(/_/g, ' ');
                            rowObj[columnName] = Value;
                        });
                        return rowObj;
                    });

                    // Determine columns from the first row of transformed data
                    const cols = Object.keys(transformedData[0]).map(key => ({
                        key: key,
                        name: key, // Potentially adjust naming here for better labels
                        resizable: true,
                        sortable: true
                    }));
                    setColumns(cols);
                    setRows(transformedData);
                } else {
                    setError('Data array is empty');
                }
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    console.log(columns)
    console.log("hi")

    return (
        <div>
            <DataGrid
                columns={columns}
                rows={rows}
                defaultColumnOptions={{
                    sortable: true,
                    resizable: true,
                    width: 160
                }}
                className="fill-grid"
            />
        </div>
    );
}

export default SpreadsheetViewer;
