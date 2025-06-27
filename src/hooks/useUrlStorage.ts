import { useState, useEffect } from 'react';
import { ShortenedUrl, ClickData } from '../types';
import { logger } from '../utils/logger';

export const useUrlStorage = () => {
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedUrl[]>([]);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = () => {
    try {
      const stored = localStorage.getItem('shortened-urls');
      if (stored) {
        const urls = JSON.parse(stored);
        setShortenedUrls(urls);
        logger.info('Loaded URLs from storage', { count: urls.length }, 'useUrlStorage');
      }
    } catch (error) {
      logger.error('Failed to load URLs from storage', error, 'useUrlStorage');
    }
  };

  const saveUrls = (urls: ShortenedUrl[]) => {
    try {
      localStorage.setItem('shortened-urls', JSON.stringify(urls));
      setShortenedUrls(urls);
      logger.info('Saved URLs to storage', { count: urls.length }, 'useUrlStorage');
    } catch (error) {
      logger.error('Failed to save URLs to storage', error, 'useUrlStorage');
    }
  };

  const addUrl = (url: ShortenedUrl) => {
    const updatedUrls = [...shortenedUrls, url];
    saveUrls(updatedUrls);
    logger.info('Added new shortened URL', { shortCode: url.shortCode, originalUrl: url.originalUrl }, 'useUrlStorage');
  };

  const addClick = (shortCode: string, clickData: ClickData) => {
    const updatedUrls = shortenedUrls.map(url => {
      if (url.shortCode === shortCode) {
        return {
          ...url,
          clicks: [...url.clicks, clickData]
        };
      }
      return url;
    });
    saveUrls(updatedUrls);
    logger.info('Added click data', { shortCode, clickId: clickData.id }, 'useUrlStorage');
  };

  const findUrlByShortCode = (shortCode: string): ShortenedUrl | undefined => {
    return shortenedUrls.find(url => url.shortCode === shortCode && url.isActive);
  };

  const isUrlExpired = (url: ShortenedUrl): boolean => {
    return Date.now() > url.expiresAt;
  };

  const getActiveUrls = (): ShortenedUrl[] => {
    return shortenedUrls.filter(url => url.isActive && !isUrlExpired(url));
  };

  const getAllUrls = (): ShortenedUrl[] => {
    return shortenedUrls;
  };

  const clearAllUrls = () => {
    localStorage.removeItem('shortened-urls');
    setShortenedUrls([]);
    logger.info('Cleared all URLs', {}, 'useUrlStorage');
  };

  return {
    shortenedUrls,
    addUrl,
    addClick,
    findUrlByShortCode,
    isUrlExpired,
    getActiveUrls,
    getAllUrls,
    clearAllUrls
  };
};