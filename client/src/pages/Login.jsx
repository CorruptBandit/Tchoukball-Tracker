import { useContext, useState } from 'react';
// import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import {
//   fetchUserPreferences,
//   updateUserPreferences
// } from '../store/slices/userSlice';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button,
  Card,
  Checkbox,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  TextField,
  Typography
} from '@mui/material';
import { AuthContext } from '../App';

export default function LoginView() {
  // const dispatch = useDispatch();
  const navigate = useNavigate();
  const { setIsLoggedIn } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginRequestStatus, setLoginRequestStatus] = useState('idle');

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const changeUsername = (event) => setUsername(event.target.value);
  const changePassword = (event) => setPassword(event.target.value);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const toggleCheckbox = () => {
    setKeepLoggedIn(!keepLoggedIn);
  };

  const canLogin =
    [username, password].every(Boolean) && loginRequestStatus === 'idle';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (canLogin) {
      let isMounted = true;
      setErrorMessage('');
      try {
        setLoginRequestStatus('pending');
        let payload = {
          username: username,
          password: password,
          keep_logged_in: keepLoggedIn
        };

        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.auth_token) {
            if (isMounted) {
              setUsername('');
              setPassword('');
              setIsLoggedIn(true);
              // dispatch(fetchSettings());

              // dispatch(fetchUserPreferences(data.auth_token)).then(
              //   (preferencesResponse) => {
              //     if (
              //       preferencesResponse.status !== 'success' &&
              //       preferencesResponse.error !== undefined &&
              //       preferencesResponse.error.message ===
              //         'A user with this ID could not be found.'
              //     ) {
              //       dispatch(
              //         updateUserPreferences({
              //           emailNotifications: true,
              //           auth_token: data.auth_token
              //         })
              //       );
              //     }
              //  }
              //);

              if (data.user.role === 'OutcomeOwner') {
                navigate('/outcome-owner-navigation');
              } else if (data.user.role === 'Questioner') {
                navigate('/questioner-navigation');
              } else {
                navigate('/');
              }

              setLoginRequestStatus('idle');
              isMounted = false;
            }
          } else {
            throw new Error('Failed to login.');
          }
        } else {
          throw new Error('Login request failed.');
        }
      } catch (err) {
        setErrorMessage(`Failed to login: ${err.message}`);
        setLoginRequestStatus('idle');
        isMounted = false;
      }
    } else if (!username || !password) {
      setErrorMessage(
        'Please ensure you enter a username and password before trying to login.'
      );
    } else {
      setErrorMessage('Failed to login.');
    }
  };

  return (
    <div style={styles.container}>
      <Card
        sx={{ p: 6, mx: 6, my: 12 }}
        style={styles.card}
        raised>
        <form className="LoginView" onSubmit={handleLogin}>
          <Typography
            sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
            className="text-center">
            Log In
          </Typography>
          <Typography color="error">{errorMessage}</Typography>
          <div className="mt-2 mb-6">
            <TextField
              id="outlined-basic"
              label="Username"
              variant="outlined"
              fullWidth
              sx={{
                '& fieldset': {
                  borderRadius: '9999px'
                }
              }}
              type="text"
              value={username}
              onChange={(event) => changeUsername(event)}
            />
          </div>
          <div className="mt-2 mb-6">
            <FormControl variant="outlined" fullWidth>
              <InputLabel htmlFor="outlined-adornment-password">
                Password
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                fullWidth
                sx={{
                  '& fieldset': {
                    borderRadius: '9999px'
                  }
                }}
                value={password}
                onChange={(event) => changePassword(event)}
              />
            </FormControl>
          </div>
          <div className="items-center flex my-1">
            <Checkbox
              sx={{ mr: 1, p: 0 }}
              name="filterCheckboxes"
              id="ownCheckbox"
              checked={keepLoggedIn}
              onChange={toggleCheckbox}
              value="own"
            />
            <Typography sx={{ mr: 1 }}>Stay logged in</Typography>
          </div>

          <div className="flex w-full mt-6 mb-5">
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: '9999px'
              }}
              className="w-full">
              Log In
            </Button>
          </div>
          <div
            className="flex"
            style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {(
              import.meta.env.REACT_APP_REGISTER_TYPE === 'verify' ||
              import.meta.env.REACT_APP_REGISTER_TYPE === 'open'
            ) && (
              <div className="flex">
                <Typography sx={{ fontSize: '0.875rem' }}>
                  Don&apos;t have an account?{' '}
                </Typography>
                <Link
                  href="/register"
                  className="underline hover:cursor-pointer"
                  color="primary.main"
                  sx={{ mx: 0.6, fontSize: '0.875rem' }}>
                  Register now
                </Link>
              </div>
            )}
            <div className="flex">
              <Typography sx={{ fontSize: '0.875rem' }}>
                Forgot your password?{' '}
              </Typography>
              <Link
                href="/reset-password"
                className="underline hover:cursor-pointer"
                color="primary.main"
                sx={{ mx: 0.6, fontSize: '0.875rem' }}>
                Reset password
              </Link>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f0f0f0',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
  },
};