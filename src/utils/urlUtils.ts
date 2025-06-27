import { logger } from './logger';

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateShortCode = (shortCode: string): boolean => {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(shortCode) && shortCode.length >= 3 && shortCode.length <= 20;
};

export const generateRandomShortCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  logger.info('Generated random shortcode', { shortCode: result }, 'urlUtils');
  return result;
};

export const isShortCodeUnique = (shortCode: string, existingUrls: any[]): boolean => {
  return !existingUrls.some(url => url.shortCode === shortCode);
};

export const getCoarseLocation = (): string => {
  // Simulate coarse location since we can't get real location client-side without permission
  const locations = ['New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU', 'Berlin, DE', 'Mumbai, IN'];
  return locations[Math.floor(Math.random() * locations.length)];
};

export const getSimulatedIP = (): string => {
  // Generate a simulated IP address for demo purposes
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};