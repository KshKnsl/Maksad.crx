import React, { useState, useEffect } from 'react';
import { 
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import BlockIcon from '@mui/icons-material/Block';
import FocusIcon from '@mui/icons-material/CenterFocusStrong';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const PopupApp: React.FC = () => {
  const [maksad, setMaksad] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Enter your maksad (aim)');
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Load saved maksad when popup opens
  useEffect(() => {
    chrome.storage.local.get(['maksad', 'focusMode'], (result) => {
      if (result.maksad) {
        setMaksad(result.maksad);
        setStatus('Your current maksad');
      }
      if (result.focusMode !== undefined) {
        setFocusMode(result.focusMode);
      }
    });
  }, []);

  const handleMaksadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaksad(event.target.value);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus('Speech Recognition not supported!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Listening...');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setMaksad(transcript);
      setIsListening(false);
      setStatus('Maksad updated!');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setStatus(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.start();
  };

  const applyContentFilter = () => {
    // Store maksad in chrome storage
    chrome.storage.local.set({ maksad }, () => {
      // Send message to content script to update filters
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
          chrome.tabs.sendMessage(activeTab.id, { 
            type: 'UPDATE_MAKSAD',
            maksad 
          });
        }
      });
      setStatus('Filter applied!');
    });
  };

  const toggleFocusMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFocusMode = event.target.checked;
    setFocusMode(newFocusMode);
    chrome.storage.local.set({ focusMode: newFocusMode }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.id) {
          chrome.tabs.sendMessage(activeTab.id, { 
            type: 'TOGGLE_FOCUS_MODE',
            enabled: newFocusMode 
          });
        }
      });
    });
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '300px',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Typography variant="h6" align="center">
        Maksad Nahi Bhulna Dunga
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          fullWidth
          label="Your Maksad"
          value={maksad}
          onChange={handleMaksadChange}
          variant="outlined"
          size="small"
        />
        <IconButton 
          onClick={startListening}
          color={isListening ? 'secondary' : 'primary'}
        >
          <MicIcon />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" align="center">
        {status}
      </Typography>

      <FormControlLabel
        control={
          <Switch
            checked={focusMode}
            onChange={toggleFocusMode}
            color="primary"
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FocusIcon />
            <Typography>Focus Mode</Typography>
          </Box>
        }
      />

      <Button
        variant="contained"
        startIcon={<BlockIcon />}
        onClick={applyContentFilter}
        fullWidth
      >
        Apply Filter
      </Button>
    </Paper>
  );
};

export default PopupApp; 