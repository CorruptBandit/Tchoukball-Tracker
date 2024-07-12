import PropTypes from 'prop-types';
import {useState, useEffect} from 'react';
import ReactApexChart from 'react-apexcharts';
import {Box, Card, CardHeader, CircularProgress, Button} from '@mui/material';
import {fNumber} from '../../../utils/formatNumber';
import {useChart} from '../../../components/chart';

AppDietaryTracking.propTypes = {
    title: PropTypes.string, subheader: PropTypes.string, chartData: PropTypes.array.isRequired,
};

/**
 * AppDietaryTracking component for displaying dietary tracking data.
 * @param {string} title - The title of the card.
 * @param {string} subheader - The subheader of the card.
 * @param {array} chartData - Array of objects containing data points for the chart.
 * @returns {JSX.Element} - React component representing the dietary tracking card.
 */
export default function AppDietaryTracking({title, subheader, chartData, ...other}) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const sortedChartData = chartData.slice().sort((a, b) => new Date(a.label) - new Date(b.label));

    const chartLabels = sortedChartData.map((i) => i.label);
    const chartSeries = sortedChartData.map((i) => i.value);

    const chartOptions = useChart({
        tooltip: {
            marker: {show: false}, y: {
                formatter: (seriesName) => fNumber(seriesName), title: {
                    formatter: () => '',
                },
            },
        }, plotOptions: {
            bar: {vertical: true, barHeight: '35%', borderRadius: 2},
        }, xaxis: {
            categories: chartLabels,
        },
    });

    const exportToCSV = () => {
        const csvContent = 'data:text/csv;charset=utf-8,' + chartLabels.map((label, index) => `${label},${chartSeries[index]}`).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'weight_tracking_data.csv');
        document.body.appendChild(link);
        link.click();
    };

    return (<Card {...other} sx={{width: '100%', height: '100%'}}>
        <CardHeader
            title={title}
            subheader={subheader}
            action={<Button onClick={exportToCSV} variant="contained" color="primary">Export to CSV</Button>}
        />
        {loading ? (<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 364}}>
            <CircularProgress data-testid="loading-indicator"/>
        </Box>) : (chartData.length === 0 ? (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 364}}>
                No data available
            </Box>) : (<Box sx={{mx: 3}} dir="ltr">
            <ReactApexChart type="line" data-testid="chart" series={[{data: chartSeries}]}
                            options={chartOptions} height={364}/>
        </Box>))}
    </Card>);
}

