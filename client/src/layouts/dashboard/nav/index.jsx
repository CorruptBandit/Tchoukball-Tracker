import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Drawer, Typography, Avatar } from '@mui/material';
import useResponsive from '../../../hooks/useResponsive';
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import NavSection from '../../../components/nav-section';
import useNavConfig from '../../../hooks/useNavConfig';
import { useAuth } from '../../../context/AuthContext';

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const { name, email, isLoggedIn } = useAuth();
  const navConfig = useNavConfig(); // Get navigation config based on user role
  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    if (openNav && !isDesktop) {
      onCloseNav();
    }
  }, [pathname, openNav, onCloseNav, isDesktop]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', px: 2.5, py: 3 }}>
        <Logo />
      </Box>


      {isLoggedIn && ( // Only show user info if logged in
        <Box sx={{ mb: 5, mx: 2.5 }}>
          <Link underline="none">
            <StyledAccount>
              <Avatar src="/assets/avatar_default.jpg" alt="photoURL" />
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                  {name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {email}
                </Typography>
              </Box>
            </StyledAccount>
          </Link>
        </Box>
      )}

      <NavSection data={navConfig} />

      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              boxShadow: '4px 0 6px -2px rgba(0,0,0,0.2)', // subtle shadow to the right
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              boxShadow: '4px 0 6px -2px rgba(0,0,0,0.2)', // adding shadow here as well
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );  
}
