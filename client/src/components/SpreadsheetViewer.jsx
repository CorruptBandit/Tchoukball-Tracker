// src/SpreadsheetViewer.jsx

import { dark } from '@mui/material/styles/createPalette';
import React, { useState, useEffect } from 'react';
import 'react-data-grid/lib/styles.css';
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
                    let maxEmptyNumber = 0;
                    const rows = nestedData.map((dict) => {
                        const rowObj = {};
                        Object.entries(dict).forEach(([key, value]) => {
                            if (typeof value === 'object' && value !== null && 'Key' in value && 'Value' in value) {
                                const keyMatch = value.Key.match(/__EMPTY_(\d+)/);
                                if (keyMatch) {
                                    const emptyNumber = parseInt(keyMatch[1], 10);
                                    if (emptyNumber >= 24) {  // Only consider __EMPTY numbers 24 and above
                                        maxEmptyNumber = Math.max(maxEmptyNumber, emptyNumber);
                                        rowObj[value.Key] = value.Value;
                                    }
                                } else if (!(value.Key.startsWith('__EMPTY') && value.Value === 3)) {
                                    rowObj[value.Key] = value.Value;
                                }
                            }
                        });
                        return rowObj;
                    });
    
                    const columns = [];
                    // Generate columns starting from __EMPTY_24 to the highest found
                    for (let i = 24; i <= maxEmptyNumber; i++) {
                        columns.push({
                            key: `__EMPTY_${i}`,
                            name: ``,
                            resizable: true,
                            sortable: true
                        });
                    }
    
                    // Include other key columns that are not EMPTY
                    const additionalKeys = ['End', 'Name / number'];
                    additionalKeys.forEach(key => {
                        if (!columns.some(column => column.key === key)) {
                            columns.push({
                                key: key,
                                name: key,
                                resizable: true,
                                sortable: true
                            });
                        }
                    });
    
                    // Sort columns based on specific criteria
                    columns.sort((a, b) => {
                        if (a.key === 'End') return -1;
                        if (b.key === 'End') return 1;
                        if (a.key === 'Name / number') return -1;
                        if (b.key === 'Name / number') return 1;
                        return a.key.localeCompare(b.key);
                    });
    
                    setColumns(columns);
                    setRows(rows);  // Set the full array of row objects
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
    // return (
    //         <DataGrid
    //             columns={[
    //                 { key: 'id', name: 'ID' },
    //                 { key: 'title', name: 'Title' }
    //             ]}
    //             rows={[
    //                 { id: 1, title: 'Test Row 1' },
    //                 { id: 2, title: 'Test Row 2' }
    //             ]}
    //         />
    // );
    

    
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <DataGrid
                columns={columns}
                rows={rows}
                defaultColumnOptions={{
                    sortable: true,
                    resizable: true,
                    width: 160
                }}
                // rowClass={(row) => row.idx % 2 === 0 ? 'row-separator' : ''} fix this to add thick border between persons
                className="fill-grid"
            />
        </div>
    );
}

export default SpreadsheetViewer;
