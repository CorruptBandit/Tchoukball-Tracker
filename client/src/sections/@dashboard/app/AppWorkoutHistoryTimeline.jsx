import PropTypes from 'prop-types';
import {Card, Typography, CardHeader, CardContent, CircularProgress} from '@mui/material';
import {Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector} from '@mui/lab';
import {fDateTime} from '../../../utils/formatTime';
import {useEffect, useState} from "react";

AppWorkoutHistoryTimeline.propTypes = {
    title: PropTypes.string, subheader: PropTypes.string, list: PropTypes.array.isRequired,
};

/**
 * AppWorkoutHistoryTimeline component for displaying workout history in a timeline.
 * @param {string} title - The title of the card.
 * @param {string} subheader - The subheader of the card.
 * @param {array} list - Array of workout history items.
 * @returns {JSX.Element} - React component representing the workout history timeline.
 */
export default function AppWorkoutHistoryTimeline({title, subheader, list, ...other}) {
    const [loading, setLoading] = useState(true);
    const sortedList = list.slice().sort((a, b) => b.time.getTime() - a.time.getTime());

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (<Card {...other} sx={{height: '465px', overflow: 'auto', position: 'relative'}}>
        <CardHeader title={title} subheader={subheader}/>
        <CardContent
            sx={{
                '& .MuiTimelineItem-missingOppositeContent:before': {
                    display: 'none',
                }, position: 'relative',
            }}
        >
            {loading ? (// Conditionally render loading indicator
                <div style={{position: 'absolute', top: '75%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <CircularProgress color="primary" data-testid="loading-indicator"/>
                </div>) : sortedList.length === 0 ? ( // Conditionally render no data sign
                <Typography variant="body1" align="center">
                    No workout history available
                </Typography>) : (<Timeline>
                {sortedList.map((item, index) => (
                    <WorkoutItem key={item.id} item={item} isLast={index === sortedList.length - 1}/>))}
            </Timeline>)}
        </CardContent>
    </Card>);
}

WorkoutItem.propTypes = {
    isLast: PropTypes.bool, item: PropTypes.shape({
        time: PropTypes.instanceOf(Date), title: PropTypes.string, type: PropTypes.string,
    }),
};

/**
 * WorkoutItem component for displaying a single workout item in the timeline.
 * @param {object} item - The workout item object.
 * @param {Date} item.time - The time of the workout.
 * @param {string} item.title - The title of the workout.
 * @param {bool} isLast - Boolean indicating if the item is the last one in the timeline.
 * @returns {JSX.Element} - React component representing a single workout item in the timeline.
 */
function WorkoutItem({item, isLast}) {
    const {title, time} = item;
    return (<TimelineItem>
        <TimelineSeparator>
            <TimelineDot color='primary'/>
            {isLast ? null : <TimelineConnector/>}
        </TimelineSeparator>
        <TimelineContent>
            <Typography variant="subtitle2">{title}</Typography>
            <Typography variant="caption" sx={{color: 'text.secondary'}}>
                {fDateTime(time)}
            </Typography>
        </TimelineContent>
    </TimelineItem>);
}
