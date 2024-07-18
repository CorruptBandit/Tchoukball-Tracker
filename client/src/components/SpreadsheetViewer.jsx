import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';

function SpreadsheetViewer() {
    const [rows, setRows] = React.useState([]);
    const [columns, setColumns] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedRow, setSelectedRow] = React.useState(null);
    const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);
    const [rowSelectionModel, setRowSelectionModel] = React.useState([]);

    React.useEffect(() => {
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
                    processAndSetData(nestedData);
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

    const processAndSetData = (nestedData) => {
        let maxEmptyNumber = 0;
        const processedRows = nestedData.map((dict, index) => {
            const rowObj = { id: index }; // Assign a unique id for each row
            Object.entries(dict).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null && 'Key' in value && 'Value' in value) {
                    const keyMatch = value.Key.match(/__EMPTY_(\d+)/);
                    if (keyMatch) {
                        const emptyNumber = parseInt(keyMatch[1], 10);
                        if (emptyNumber >= 24) {  // Only consider __EMPTY numbers 24 and above
                            maxEmptyNumber = Math.max(maxEmptyNumber, emptyNumber);
                            rowObj[value.Key] = value.Value;
                        }
                    } else {
                        rowObj[value.Key] = value.Value;  // This ensures all keys are added, not just __EMPTY
                    }
                }
            });
            return rowObj;
        });

        const processedColumns = [
            { field: 'End', headerName: 'End', width: 150, editable: true },
            { field: 'Name / number', headerName: 'Name / Number', width: 150, editable: true } // Predefined columns
        ];
        for (let i = 24; i <= maxEmptyNumber; i++) {
            processedColumns.push({ field: `__EMPTY_${i}`, headerName: `Column ${i}`, width: 150, editable: true });
        }

        setColumns(processedColumns);
        setRows(processedRows);
    };

    const handleRowSelection = (newRowSelectionModel) => {
        setRowSelectionModel(newRowSelectionModel);
        console.log('New Row Selection Model:', newRowSelectionModel);
        if (newRowSelectionModel.length > 0) {
            const rowIndex = rows.findIndex(row => row.id.toString() === newRowSelectionModel[0].toString());
            console.log('Selected Row Index:', rowIndex);
            console.log('Selected Row:', rows[rowIndex]);
            setSelectedRow(rows[rowIndex]);
            setSelectedRowIndex(rowIndex);
        } else {
            setSelectedRow(null);
            setSelectedRowIndex(null);
        }
    };

    const handleActionClick = (action) => {
        if (selectedRow && selectedRowIndex != null) {
            const updatedRows = [...rows];
            const nextEditableColumnIndex = Object.keys(updatedRows[selectedRowIndex]).findIndex(
                key => key.startsWith('__EMPTY_') && !updatedRows[selectedRowIndex][key]
            );
            if (nextEditableColumnIndex !== -1) {
                const keyToUpdate = Object.keys(updatedRows[selectedRowIndex])[nextEditableColumnIndex];
                updatedRows[selectedRowIndex][keyToUpdate] = action;
                setRows(updatedRows);
            }
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ height: '50%', width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    onRowSelectionModelChange={handleRowSelection}
                    rowSelectionModel={rowSelectionModel}
                />
            </Box>
            {selectedRow && (
                <Box sx={{ padding: 2 }}>
                    {console.log('Rendering selected row:', selectedRow)}
                    <h3 style={{ color: 'black' }}>Action for: {selectedRow['Name / number'] || 'No name available'}</h3>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {['Point', 'Caught', 'Short', 'Mistake', '1st', '2nd', 'Drop', 'Gap'].map((action) => (
                            <Button key={action} variant="contained" color="primary" onClick={() => handleActionClick(action)}>
                                {action}
                            </Button>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default SpreadsheetViewer;
