import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Chip,
  IconButton,
  Divider
} from '@mui/material';
import { Add, Delete, Link, Timer, Code } from '@mui/icons-material';
import { UrlFormData, ShortenedUrl } from '../types';
import { validateUrl, validateShortCode, generateRandomShortCode, isShortCodeUnique } from '../utils/urlUtils';
import { useUrlStorage } from '../hooks/useUrlStorage';
import { logger } from '../utils/logger';

const UrlShortenerForm: React.FC = () => {
  const { shortenedUrls, addUrl } = useUrlStorage();
  const [forms, setForms] = useState<UrlFormData[]>([
    { originalUrl: '', customShortCode: '', validityMinutes: 30 }
  ]);
  const [errors, setErrors] = useState<{ [key: number]: { [key: string]: string } }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { originalUrl: '', customShortCode: '', validityMinutes: 30 }]);
      logger.info('Added new URL form', { totalForms: forms.length + 1 }, 'UrlShortenerForm');
    }
  };

  const removeForm = (index: number) => {
    if (forms.length > 1) {
      const newForms = forms.filter((_, i) => i !== index);
      setForms(newForms);
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
      logger.info('Removed URL form', { index, remainingForms: newForms.length }, 'UrlShortenerForm');
    }
  };

  const updateForm = (index: number, field: keyof UrlFormData, value: string | number) => {
    const newForms = [...forms];
    newForms[index] = { ...newForms[index], [field]: value };
    setForms(newForms);

    // Clear specific field error when user starts typing
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const validateForm = (index: number, form: UrlFormData): { [key: string]: string } => {
    const formErrors: { [key: string]: string } = {};

    if (!form.originalUrl.trim()) {
      formErrors.originalUrl = 'URL is required';
    } else if (!validateUrl(form.originalUrl)) {
      formErrors.originalUrl = 'Please enter a valid URL';
    }

    if (form.customShortCode.trim()) {
      if (!validateShortCode(form.customShortCode)) {
        formErrors.customShortCode = 'Shortcode must be 3-20 alphanumeric characters';
      } else if (!isShortCodeUnique(form.customShortCode, shortenedUrls)) {
        formErrors.customShortCode = 'This shortcode is already taken';
      }
    }

    if (form.validityMinutes < 1 || form.validityMinutes > 43200) { // Max 30 days
      formErrors.validityMinutes = 'Validity must be between 1 and 43200 minutes';
    }

    return formErrors;
  };

  const validateAllForms = (): boolean => {
    const allErrors: { [key: number]: { [key: string]: string } } = {};
    let hasErrors = false;

    forms.forEach((form, index) => {
      const formErrors = validateForm(index, form);
      if (Object.keys(formErrors).length > 0) {
        allErrors[index] = formErrors;
        hasErrors = true;
      }
    });

    // Check for duplicate shortcodes within the current forms
    const shortCodes = forms
      .map((form, index) => ({ code: form.customShortCode.trim(), index }))
      .filter(item => item.code);

    const duplicates = shortCodes.filter((item, index) => 
      shortCodes.findIndex(other => other.code === item.code) !== index
    );

    duplicates.forEach(duplicate => {
      if (!allErrors[duplicate.index]) {
        allErrors[duplicate.index] = {};
      }
      allErrors[duplicate.index].customShortCode = 'Duplicate shortcode in current forms';
      hasErrors = true;
    });

    setErrors(allErrors);
    return !hasErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateAllForms()) {
      logger.warn('Form validation failed', { errors }, 'UrlShortenerForm');
      return;
    }

    const createdUrls: ShortenedUrl[] = [];

    forms.forEach((form) => {
      const shortCode = form.customShortCode.trim() || generateRandomShortCode();
      const now = Date.now();
      const expiresAt = now + (form.validityMinutes * 60 * 1000);

      const shortenedUrl: ShortenedUrl = {
        id: Math.random().toString(36).substr(2, 9),
        originalUrl: form.originalUrl,
        shortCode,
        createdAt: now,
        expiresAt,
        validityMinutes: form.validityMinutes,
        clicks: [],
        isActive: true
      };

      addUrl(shortenedUrl);
      createdUrls.push(shortenedUrl);
    });

    setSuccessMessage(`Successfully created ${createdUrls.length} short URL${createdUrls.length > 1 ? 's' : ''}!`);
    setForms([{ originalUrl: '', customShortCode: '', validityMinutes: 30 }]);
    
    logger.info('Successfully created short URLs', { 
      count: createdUrls.length, 
      shortCodes: createdUrls.map(url => url.shortCode) 
    }, 'UrlShortenerForm');
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link color="primary" />
        URL Shortener
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create up to 5 short URLs at once. Set custom shortcodes and validity periods for each URL.
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {forms.map((form, index) => (
          <Paper 
            key={index} 
            variant="outlined" 
            sx={{ p: 3, mb: 2, backgroundColor: 'grey.50' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">URL #{index + 1}</Typography>
              {forms.length > 1 && (
                <IconButton 
                  onClick={() => removeForm(index)}
                  color="error"
                  size="small"
                >
                  <Delete />
                </IconButton>
              )}
            </Box>

            <TextField
              fullWidth
              label="Original URL"
              placeholder="https://example.com/very-long-url"
              value={form.originalUrl}
              onChange={(e) => updateForm(index, 'originalUrl', e.target.value)}
              error={!!errors[index]?.originalUrl}
              helperText={errors[index]?.originalUrl}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <Link sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Custom Shortcode (Optional)"
                placeholder="mycode123"
                value={form.customShortCode}
                onChange={(e) => updateForm(index, 'customShortCode', e.target.value)}
                error={!!errors[index]?.customShortCode}
                helperText={errors[index]?.customShortCode || '3-20 alphanumeric characters'}
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: <Code sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />

              <TextField
                type="number"
                label="Validity (Minutes)"
                value={form.validityMinutes}
                onChange={(e) => updateForm(index, 'validityMinutes', parseInt(e.target.value) || 30)}
                error={!!errors[index]?.validityMinutes}
                helperText={errors[index]?.validityMinutes}
                sx={{ width: 200 }}
                inputProps={{ min: 1, max: 43200 }}
                InputProps={{
                  startAdornment: <Timer sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>

            {form.originalUrl && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Short URL will be:
                </Typography>
                <Chip 
                  label={`${window.location.origin}/${form.customShortCode || 'random'}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}
          </Paper>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addForm}
            disabled={forms.length >= 5}
          >
            Add Another URL ({forms.length}/5)
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ minWidth: 150 }}
          >
            Create Short URLs
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default UrlShortenerForm;