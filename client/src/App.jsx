// App.jsx
import { HelmetProvider } from 'react-helmet-async';
import Routes from './routes'; // Renamed for clarity
import ThemeProvider from './theme';
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
// Other imports...

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <ScrollToTop />
        <StyledChart />
        <Routes /> {/* Updated to use the new name */}
      </ThemeProvider>
    </HelmetProvider>
  );
}
