import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import dashboardPreview from "../assets/example.png";
import dashboardPreviewDark from "../assets/example-dark.png";
import Navbar from "../components/Navbar";
import DashboardSideMenu from "../menus/AvailableDashboardSideMenu";
import { useState } from "react";
import PropTypes from "prop-types";

function Hero() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      className="hero"
      sx={{
        mt: 5,
        p: 8,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        textAlign: "center",
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        Build customisable dashboards in minutes
      </Typography>
      <Typography component="h2" variant="subtitle1" gutterBottom>
        Our dashboard maker easily combines data from various sources into a
        dynamic, always-updated dashboard.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/new")}
      >
        Start Building
      </Button>
    </Box>
  );
}
function DashboardPreview() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        my: 1,
        py: 4,
        backgroundColor: theme.palette.mode === 'dark' ? "#5A5A5A": "#e3f2fd",
        color: theme.palette.text.primary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        sx={{mb: 3}}
        gutterBottom
      >
        Dashboard Preview
      </Typography>
      <img
        src={
          theme.palette.mode == "dark" ? dashboardPreviewDark : dashboardPreview
        }
        alt="Dashboard Preview"
        style={{ width: "80%", maxWidth: 600, height: "auto" }}
      />
    </Box>
  );
}

function Features() {
  const theme = useTheme();

  return (
    <Box sx={{ py: 4, px: 2, pb: 20, color: theme.palette.text.primary, }}>
      <Typography
        variant="h5"
        component="h2"
        textAlign="center"
        gutterBottom
      >
        Key Features of the Platform
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography gutterBottom variant="h6" component="h2">
              Drag-and-Drop Interface
            </Typography>
            <Typography variant="body2">
              Allows users to effortlessly create and customise dashboards
              without prior coding knowledge, enhancing efficiency in preparing
              for trade shows and internal presentations.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography gutterBottom variant="h6" component="h2">
              Real-Time Data Integration
            </Typography>
            <Typography variant="body2">
              Connects seamlessly to various backend data sources, ensuring that
              all displayed information is up-to-date and accurate, crucial for
              live events and decision-making processes.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Typography gutterBottom variant="h6" component="h2">
              Adaptive Presentation Tools
            </Typography>
            <Typography variant="body2">
              Features adaptive visual elements that can be tailored to
              different audiences and contexts, providing flexibility and
              enhancing audience engagement during presentations.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function HomePage({setDarkMode}) {
  const [modal, setModal] = useState(false);

  return (
    <div>
      <DashboardSideMenu state={modal} setState={setModal}/>
      <Navbar
        title={"Dashboard Creator"}
        toggleComponentMenu={()=>{setModal(true)}}
        setDarkMode={setDarkMode}
      />
      <Hero />
      <DashboardPreview />
      <Features />
    </div>
  );
}

HomePage.propTypes = {
  setDarkMode: PropTypes.func,
}

export default HomePage;
