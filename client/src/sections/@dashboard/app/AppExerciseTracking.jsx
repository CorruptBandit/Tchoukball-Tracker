import PropTypes from 'prop-types';
import {useState, useEffect} from 'react';
import ReactApexChart from 'react-apexcharts';
import {Card, CardHeader, Box, Tab, Tabs, CircularProgress, Button} from '@mui/material';
import {useChart} from '../../../components/chart';

AppExerciseTracking.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    chartData: PropTypes.array.isRequired,
    chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

/**
 * AppExerciseTracking component for displaying exercise tracking data.
 * @param {string} title - The title of the card.
 * @param {string} subheader - The subheader of the card.
 * @param {array} chartLabels - Array of labels for the tabs.
 * @param {array} chartData - Array of objects containing data points for each tab.
 * @returns {JSX.Element} - React component representing the exercise tracking card.
 */
export default function AppExerciseTracking({title, subheader, chartLabels, chartData, ...other}) {
    const [tabIndex, setTabIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleChangeTab = (event, newValue) => {
        setTabIndex(newValue);
    };

    const chartOptions = useChart({
        plotOptions: {bar: {columnWidth: '16%'}}, fill: {type: 'solid'}, xaxis: {type: 'datetime'}, tooltip: {
            shared: true, intersect: false, y: {
                formatter: (y) => {
                    if (typeof y !== 'undefined') {
                        return `${y.toFixed(0)}kg`;
                    }
                    return y;
                },
            }, "custom": ({series, seriesIndex, dataPointIndex}) => {
                const weight = series[seriesIndex][dataPointIndex];
                return `<div>${weight}kg</div>`;
            },
        },
    });

    const exportToCSV = () => {
        const csvContent = 'data:text/csv;charset=utf-8,' + chartData.map((data, index) => {
            const label = chartLabels[index];
            const csvData = data.data.map((point) => `"${label}",${point}`);
            return csvData.join('\n');
        }).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'exercise_progression.csv');
        document.body.appendChild(link);
        link.click();
    };

    return (<Box sx={{width: '100%', height: '100%'}}>
        <Card {...other} sx={{width: '100%', height: '100%'}}>
            <CardHeader
                title={title}
                subheader={subheader}
                action={<Button onClick={exportToCSV} variant="contained" color="primary">Export to CSV</Button>}
            />
            <Box sx={{p: 3, pb: 1}} dir="ltr">
                <Tabs value={tabIndex} onChange={handleChangeTab} data-testid="chart-tab">
                    {chartLabels.map((label, index) => (<Tab key={index} label={label}/>))}
                </Tabs>
                {loading ? (<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300}}>
                    <CircularProgress data-testid="loading-indicator"/>
                </Box>) : (chartData.length === 0 ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300}}>
                        No data available
                    </Box>) : (chartData.map((data, index) => (<Box key={index} hidden={tabIndex !== index}>
                    {tabIndex === index && (<ReactApexChart
                        type="bar"
                        series={[{data: data.data}]}
                        options={chartOptions}
                        height={300}
                        data-testid="bar-chart"
                    />)}
                </Box>))))}
            </Box>
        </Card>
    </Box>);
}
