import { ThemeProvider, createTheme } from '@mui/material';
import PopupApp from './components/PopupApp';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <PopupApp />
    </ThemeProvider>
  );
}

export default App;
