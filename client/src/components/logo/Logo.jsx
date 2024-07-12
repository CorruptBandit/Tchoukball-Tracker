import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link } from '@mui/material';

// ----------------------------------------------------------------------

const Logo = forwardRef(({ disabledLink = false, sx, ...props }, ref) => {
  const logo = (
    <Box
      component="img"
      src="/assets/logo.svg"
      sx={{ width: 100, height: 100, cursor: 'pointer', ...sx }}
      ref={ref}
      {...props}
    />
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <Link to="/" component={RouterLink} sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  sx: PropTypes.object,
  disabledLink: PropTypes.bool,
};
Logo.displayName = 'Logo';
export default Logo;
