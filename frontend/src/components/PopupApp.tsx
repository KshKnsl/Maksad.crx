import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button'; // Add this import
import { cn } from '../lib/utils';

declare global {
  interface Window {
  }
}

interface MessageResponse {
  success: boolean;
  error?: string;
}

const PopupApp: React.FC = () => {
  const [maksad, setMaksad] = useState<string>('');
  const [status, setStatus] = useState<string>('Enter your maksad (aim)');
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');

  // Check if current tab is supported
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab?.url) {
        const url = new URL(currentTab.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          setStatus('Extension not supported on this page');
          setStatusType('error');
          setShowStatus(true);
          return;
        }
      }
    });

    // Load saved maksad
    chrome.storage.local.get(['maksad', 'focusMode'], (result) => {
      if (result.maksad) {
        setMaksad(result.maksad);
        setStatus('Your current maksad');
        setStatusType('success');
        setShowStatus(true);
      }
      if (result.focusMode !== undefined) {
        setFocusMode(result.focusMode);
      }
    });
  }, []);

  const handleMaksadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaksad(event.target.value);
    setShowStatus(false);
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
        setStatus('Filter applied successfully!');
        setStatusType('success');
      } else {
        setStatus(response?.error || 'Error applying filter. Please refresh the page and try again.');
        setStatusType('error');
      }
      setShowStatus(true);
    } catch (err) {
      console.error('Error:', err);
      setStatus('Error applying filter. Please refresh the page and try again.');
      setStatusType('error');
      setShowStatus(true);
    }
  };

  const removeContentFilter = async () => {
    try {
      // Remove maksad from chrome storage
      await new Promise<void>((resolve) => {
        chrome.storage.local.remove('maksad', resolve);
      });

      // Send message to background script
      const response = await new Promise<MessageResponse>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'REMOVE_MAKSAD'
        }, resolve);
      });

      if (response?.success) {
        setStatus('Filter removed successfully!');
        setStatusType('success');
        setMaksad('');
      } else {
        setStatus(response?.error || 'Error removing filter. Please refresh the page and try again.');
        setStatusType('error');
      }
      setShowStatus(true);
    } catch (err) {
      console.error('Error:', err);
      setStatus('Error removing filter. Please refresh the page and try again.');
      setStatusType('error');
      setShowStatus(true);
    }
  };

  const toggleFocusMode = async (checked: boolean) => {
    try {
      console.log("Toggling focus mode:", checked);
      
      // Check if maksad is provided when enabling focus mode
      if (checked && !maksad.trim()) {
        setStatus('Please enter your maksad to enable focus mode');
        setStatusType('error');
        setShowStatus(true);
        return; // Don't update the UI state if validation fails
      }
      
      // Update UI state only after validation passes
      setFocusMode(checked);
      
      // Store focus mode in chrome storage immediately
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ focusMode: checked }, resolve);
      });

      // Send message to toggle focus mode in content script
      const response = await new Promise<MessageResponse>((resolve) => {
        chrome.runtime.sendMessage({ 
          type: 'TOGGLE_FOCUS_MODE',
          enabled: checked 
        }, (response) => {
          console.log("Focus mode toggle response:", response);
          resolve(response || { success: false, error: 'No response' });
        });
      });

      // Handle filter based on focus mode
      if (checked && maksad) {
        await applyContentFilter();
      } else if (!checked) {
        await removeContentFilter();
      }

      if (!response?.success) {
        console.error("Focus mode toggle failed:", response?.error);
        setStatus(response?.error || 'Error toggling focus mode. Please refresh the page and try again.');
        setStatusType('error');
        setShowStatus(true);
      } else {
        setStatus(checked ? 'Focus mode enabled' : 'Focus mode disabled');
        setStatusType('success');
        setShowStatus(true);
      }
    } catch (err) {
      console.error('Error toggling focus mode:', err);
      setStatus('Error toggling focus mode. Please refresh the page and try again.');
      setStatusType('error');
      setShowStatus(true);
      // Reset UI state on error
      setFocusMode(!checked);
    }
  };

  return (
    <div className="w-[320px] p-6 flex flex-col gap-6 bg-background">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-bold text-center bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Maksad Nahi Bhulna Dunga
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Stay focused on your goals
        </p>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter your maksad (aim)"
            value={maksad}
            onChange={handleMaksadChange}
            className="flex-1"
          />
        </div>

        {showStatus && (
          <div className={cn(
            "flex items-center gap-2 p-2 rounded-md text-sm transition-all duration-200",
            statusType === 'success' && "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
            statusType === 'error' && "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
            statusType === 'info' && "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          )}>
            {statusType === 'success' && <CheckCircle2 className="h-4 w-4" />}
            {statusType === 'error' && <AlertCircle className="h-4 w-4" />}
            {statusType === 'info' && <Target className="h-4 w-4" />}
            <span>{status}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Focus Mode</span>
        </div>
        <Button
          variant={focusMode ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFocusMode(!focusMode)}
          className={cn(
            "transition-all",
            focusMode && "bg-primary text-primary-foreground"
          )}
        >
          {focusMode ? "Enabled" : "Disabled"}
        </Button>
      </div>
    </div>
  );
};

export default PopupApp;