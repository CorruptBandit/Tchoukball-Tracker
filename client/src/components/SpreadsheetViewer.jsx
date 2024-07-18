import * as React from 'react';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import { Button, Box, Typography } from '@mui/material';

function SpreadsheetViewer() {
    const apiRef = useGridApiRef();
    const [rows, setRows] = React.useState([]);
    const [columns, setColumns] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [selectedRow, setSelectedRow] = React.useState(null);
    const [selectedRowIndex, setSelectedRowIndex] = React.useState(null);
    const [rowSelectionModel, setRowSelectionModel] = React.useState([]);
    const [nextEditableIndex, setNextEditableIndex] = React.useState(24); // Start with __EMPTY_24

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
            setNextEditableIndex(24); // Reset to start with __EMPTY_24
        } else {
            setSelectedRow(null);
            setSelectedRowIndex(null);
        }
    };

    const handleActionClick = (action) => {
        if (selectedRow && selectedRowIndex != null) {
            const updatedRow = { ...rows[selectedRowIndex] };
            const keyToUpdate = `__EMPTY_${nextEditableIndex}`;
            console.log('Updating key:', keyToUpdate, 'with action:', action);
            updatedRow[keyToUpdate] = action;
            apiRef.current.updateRows([updatedRow]);
            const updatedRows = [...rows];
            updatedRows[selectedRowIndex] = updatedRow;
            setRows(updatedRows);
            setSelectedRow(updatedRow);
            setNextEditableIndex(prevIndex => prevIndex + 1); // Increment for the next action
        } else {
            console.log('No row selected');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ height: '50%', width: '100%' }}>
                <DataGrid
                    apiRef={apiRef}
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
                    <Typography variant="h3" sx={{ color: 'black' }}>
                        Action for: {selectedRow['Name / number'] || 'No name available'}
                    </Typography>
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
