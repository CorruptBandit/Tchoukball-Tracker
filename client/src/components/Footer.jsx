import { Copyright } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center"
      }}>
      <div className="flex flex-col w-full items-center">
        <div className="flex w-full justify-center items-center">
          <Typography
            color="textSecondary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              mx: 1.8,
              fontSize: '0.775rem'
            }}>
            <Copyright fontSize="inherit" />
            {`${new Date().getFullYear()} Fujitsu`}
          </Typography>

          <Typography
            color="textSecondary"
            variant="subtitle1"
            component="h3"
            sx={{
              display: 'flex',
              alignItems: 'center',
              mx: 1.8,
              fontSize: '0.775rem'
            }}>
            <Link
              href="/about"
              underline="none"
              color="inherit"
              sx={{ mr: 0.6 }}>
              About
            </Link>
            |
            <Link
              href="http://localhost:8080/swagger/index.html"
              underline="none"
              color="inherit"
              sx={{ ml: 0.6 }}>
              API
            </Link>
          </Typography>
        </div>
      </div>
    </Box>
  );
}
