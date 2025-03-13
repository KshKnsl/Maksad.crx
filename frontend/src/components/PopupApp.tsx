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

interface MessageResponse {
  success: boolean;
  error?: string;
}

const PopupApp: React.FC = () => {
  const [maksad, setMaksad] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Enter your maksad (aim)');
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Check if current tab is supported
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab?.url) {
        const url = new URL(currentTab.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          setStatus('Extension not supported on this page');
          return;
        }
      }
    });

    // Load saved maksad
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

  const applyContentFilter = async () => {
    try {
      // Store maksad in chrome storage
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ maksad }, resolve);
      });

      // Send message to background script
      const response = await new Promise<MessageResponse>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'UPDATE_MAKSAD',
          maksad 
        }, resolve);
      });

      if (response?.success) {
        setStatus('Filter applied!');
      } else {
        setStatus(response?.error || 'Error applying filter. Please refresh the page and try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('Error applying filter. Please refresh the page and try again.');
    }
  };

  const toggleFocusMode = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFocusMode = event.target.checked;
    setFocusMode(newFocusMode);
    
    try {
      // Store focus mode in chrome storage
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ focusMode: newFocusMode }, resolve);
      });

      // Send message to background script
      const response = await new Promise<MessageResponse>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'TOGGLE_FOCUS_MODE',
          enabled: newFocusMode 
        }, resolve);
      });

      if (!response?.success) {
        setStatus(response?.error || 'Error toggling focus mode. Please refresh the page and try again.');
        setFocusMode(!newFocusMode); // Revert the switch
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('Error toggling focus mode. Please refresh the page and try again.');
      setFocusMode(!newFocusMode); // Revert the switch
    }
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