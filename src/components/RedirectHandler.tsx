import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Alert, Button } from '@mui/material';
import { Link, Schedule, Warning } from '@mui/icons-material';
import { useUrlStorage } from '../hooks/useUrlStorage';
import { ClickData } from '../types';
import { getCoarseLocation, getSimulatedIP } from '../utils/urlUtils';
import { logger } from '../utils/logger';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { findUrlByShortCode, addClick, isUrlExpired } = useUrlStorage();
  const [redirecting, setRedirecting] = useState(true);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setRedirecting(false);
      return;
    }

    const shortenedUrl = findUrlByShortCode(shortCode);

    if (!shortenedUrl) {
      logger.warn('Short code not found', { shortCode }, 'RedirectHandler');
      setError('Short URL not found');
      setRedirecting(false);
      return;
    }

    if (isUrlExpired(shortenedUrl)) {
      logger.warn('Attempted to access expired URL', { shortCode, expiresAt: shortenedUrl.expiresAt }, 'RedirectHandler');
      setError('This short URL has expired');
      setRedirecting(false);
      return;
    }

    // Record the click
    const clickData: ClickData = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ip: getSimulatedIP(),
      location: getCoarseLocation()
    };

    addClick(shortCode, clickData);
    logger.info('Recorded click and redirecting', { 
      shortCode, 
      originalUrl: shortenedUrl.originalUrl,
      clickId: clickData.id 
    }, 'RedirectHandler');

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          window.location.href = shortenedUrl.originalUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [shortCode, findUrlByShortCode, addClick, isUrlExpired]);

  if (error) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.50'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <Warning color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error">
            URL Not Found
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The short URL you're looking for doesn't exist or has expired.
          </Typography>
          <Button 
            variant="contained" 
            component="a" 
            href="/"
            sx={{ mt: 2 }}
          >
            Go to URL Shortener
          </Button>
        </Paper>
      </Box>
    );
  }

  if (redirecting) {
    const url = findUrlByShortCode(shortCode!);
    
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.50'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}>
          <Link color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Redirecting...
          </Typography>
          
          {url && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                You will be redirected to:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.200'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                  }}
                >
                  {url.originalUrl}
                </Typography>
              </Paper>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
            <CircularProgress size={24} />
            <Typography variant="h6" color="primary">
              {countdown}
            </Typography>
            <Schedule color="action" />
          </Box>

          <Typography variant="body2" color="text.secondary">
            If you are not redirected automatically, please click the link above.
          </Typography>
          
          {url && (
            <Button 
              variant="outlined" 
              component="a" 
              href={url.originalUrl}
              sx={{ mt: 2 }}
            >
              Go Now
            </Button>
          )}
        </Paper>
      </Box>
    );
  }

  return <Navigate to="/" replace />;
};

export default RedirectHandler;