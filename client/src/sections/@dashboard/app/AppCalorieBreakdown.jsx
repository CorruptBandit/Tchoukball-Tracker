import PropTypes from 'prop-types';
import {useState, useEffect} from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import ReactApexChart from 'react-apexcharts';
// @mui
import {useTheme, styled, Button} from '@mui/material';
import {Card, CardHeader} from '@mui/material';
// utils
import {fNumber} from '../../../utils/formatNumber';
// components
import {useChart} from '../../../components/chart';

const CHART_HEIGHT = 205;
const LEGEND_HEIGHT = 48;

const StyledChartWrapper = styled('div')(({theme}) => ({
    height: CHART_HEIGHT,
    marginTop: theme.spacing(0),
    '& .apexcharts-canvas svg': {height: CHART_HEIGHT},
    '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
        overflow: 'visible',
    },
    '& .apexcharts-legend': {
        height: LEGEND_HEIGHT,
        alignContent: 'center',
        position: 'relative !important',
        borderTop: `solid 1px ${theme.palette.divider}`,
        top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
    },
}));

AppCalorieBreakdown.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    chartColors: PropTypes.arrayOf(PropTypes.string),
    chartData: PropTypes.array,
};

/**
 * AppCalorieBreakdown component for displaying calorie breakdown data in a pie chart.
 * @param {string} title - The title of the card.
 * @param {string} subheader - The subheader of the card.
 * @param {array} chartColors - Array of colors for the chart.
 * @param {array} chartData - Array of objects containing data points for the chart.
 * @returns {JSX.Element} - React component representing the calorie breakdown card.
 */
export default function AppCalorieBreakdown({title, subheader, chartColors, chartData, ...other}) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timeout);
    }, []);

    const chartLabels = chartData.map((i) => i.label);
    const chartSeries = chartData.map((i) => i.value);

    const chartOptions = useChart({
        colors: chartColors,
        labels: chartLabels,
        stroke: {colors: [theme.palette.background.paper]},
        legend: {floating: true, horizontalAlign: 'center'},
        dataLabels: {enabled: true, dropShadow: {enabled: false}},
        tooltip: {
            fillSeriesColor: false, y: {
                formatter: (seriesName) => fNumber(seriesName), title: {
                    formatter: (seriesName) => `${seriesName}`,
                },
            },
        },
        plotOptions: {
            pie: {
                donut: {labels: {show: false}}, dataLabels: {
                    offset: -10, minAngleToShowLabel: 10,
                },
            },
        },
    });

    const exportToCSV = () => {
        const csvContent = 'data:text/csv;charset=utf-8,' + chartLabels.map((label, index) => `"${label}",${chartSeries[index]}`).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'daily_calorie_intake_data.csv');
        document.body.appendChild(link);
        link.click();
    };

    return (<Card {...other}>
        <CardHeader
            title={title}
            subheader={subheader}
            action={<Button onClick={exportToCSV} variant="contained" color="primary">Export to CSV</Button>}
        />
        <StyledChartWrapper dir="ltr">
            {chartData.length === 0 ? ( // Check if chart data is empty
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: CHART_HEIGHT}}>
                    No data available
                </div>) : (loading ? ( // Conditional rendering based on loading state
                    <div
                        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: CHART_HEIGHT}}>
                        <CircularProgress data-testid="loading-indicator"/>
                    </div>) : (
                    <ReactApexChart type="pie" data-testid="chart" series={chartSeries} options={chartOptions}
                                    height={180}/>))}
        </StyledChartWrapper>
    </Card>);
}

