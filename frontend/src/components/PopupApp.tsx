import React, { useState, useEffect } from 'react';
import { 
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import BlockIcon from '@mui/icons-material/Block';

const PopupApp: React.FC = () => {
  const [maksad, setMaksad] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Enter your maksad (aim)');

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

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMaksad(transcript);
      setIsListening(false);
      setStatus('Maksad updated!');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setStatus(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.start();
  };

  const applyContentFilter = () => {
    // Send message to content script to update filters
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'UPDATE_MAKSAD',
          maksad: maksad 
        });
      }
    });
    setStatus('Filter applied!');
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