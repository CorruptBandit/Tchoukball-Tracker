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
                    const firstRow = nestedData[0];
                    const rowObj = {};
                    const keysForSorting = [];
    
                    Object.entries(firstRow).forEach(([key, value]) => {
                        if (typeof value === 'object' && value !== null && 'Key' in value && 'Value' in value) {
                            if (!(value.Key.startsWith('__EMPTY') && value.Value === 3)) {
                                rowObj[value.Key] = value.Value;
                                keysForSorting.push(value.Key); // Ensure all keys are included for sorting
                            }
                        }
                    });

                    console.log(keysForSorting)
    
                    // Sort the keys, ensuring custom order for "End" and "Name / number"
                    keysForSorting.sort((a, b) => {
                        if (a === 'End') return -1;
                        if (b === 'End') return 1;
                        if (a === 'Name / number') return -1;
                        if (b === 'Name / number') return 1;
                        return a.localeCompare(b);
                    });
    
                    const sortedRowObj = {};
                    keysForSorting.forEach(key => {
                        sortedRowObj[key] = rowObj[key];
                    });
    
                    const columns = keysForSorting.map(key => ({
                        key: key,
                        name: key.replace('__EMPTY_', 'Column '), // Custom names
                        resizable: true,
                        sortable: true
                    }));
    
                    setColumns(columns);
                    setRows([sortedRowObj]);
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

    console.log("First row: ", rows);
    console.log("Columns: ", columns);
    

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
        <div style={{ height: 600, width: '100%' }}>
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
