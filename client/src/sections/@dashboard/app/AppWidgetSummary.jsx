import PropTypes from 'prop-types';
import {alpha, styled} from '@mui/material/styles';
import {Card, Typography} from '@mui/material';
import Iconify from '../../../components/iconify';

const StyledIcon = styled('div')(({theme}) => ({
    margin: 'auto',
    display: 'flex',
    borderRadius: '50%',
    alignItems: 'center',
    width: theme.spacing(10),
    height: theme.spacing(10),
    justifyContent: 'center',
    marginBottom: theme.spacing(4),
}));

AppWidgetSummary.propTypes = {
    color: PropTypes.string,
    icon: PropTypes.string,
    title: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
    sx: PropTypes.object,
};

/**
 * AppWidgetSummary component for displaying summarized data with an icon.
 * @param {string} title - The title of the summary.
 * @param {string} data - The data to be displayed.
 * @param {string} icon - The icon to be displayed.
 * @param {string} color - The color scheme for the card.
 * @param {object} sx - The style object for customization.
 * @returns {JSX.Element} - React component representing the summarized data with an icon.
 */
export default function AppWidgetSummary({title, data, icon, color = 'primary', sx, ...other}) {
    return (<Card
        sx={{
            py: 6,
            boxShadow: 0,
            textAlign: 'center',
            color: (theme) => theme.palette[color].darker,
            bgcolor: (theme) => theme.palette[color].lighter, ...sx,
        }}
        {...other}
    >
        <StyledIcon
            sx={{
                color: (theme) => theme.palette[color].dark, backgroundImage: (theme) => `linear-gradient(135deg, 
                ${alpha(theme.palette[color].dark, 0)} 0%, ${alpha(theme.palette[color].dark, 0.24)} 100%)`,
            }}
        >
            <Iconify icon={icon} width={28} height={28}/>
        </StyledIcon>

        <Typography variant="h3">{(data)}</Typography>

        <Typography variant="subtitle2" sx={{opacity: 0.72}}>
            {title}
        </Typography>
    </Card>);
}
