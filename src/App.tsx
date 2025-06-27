import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Tabs, Tab, Box, AppBar, Toolbar, Typography } from '@mui/material';
import { Link as LinkIcon, Analytics } from '@mui/icons-material';
import UrlShortenerForm from './components/UrlShortenerForm';
import Statistics from './components/Statistics';
import RedirectHandler from './components/RedirectHandler';
import { logger } from './utils/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function MainApp() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    logger.info('Tab changed', { tab: newValue === 0 ? 'shortener' : 'statistics' }, 'MainApp');
  };

  React.useEffect(() => {
    logger.info('Application started', { timestamp: Date.now() }, 'MainApp');
  }, []);

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener Pro
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="URL shortener tabs"
            centered
          >
            <Tab 
              icon={<LinkIcon />} 
              label="URL Shortener" 
              iconPosition="start"
            />
            <Tab 
              icon={<Analytics />} 
              label="Statistics" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <UrlShortenerForm />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Statistics />
        </TabPanel>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/:shortCode" element={<RedirectHandler />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;