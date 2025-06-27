export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: number;
  expiresAt: number;
  validityMinutes: number;
  clicks: ClickData[];
  isActive: boolean;
}

export interface ClickData {
  id: string;
  timestamp: number;
  userAgent: string;
  referrer: string;
  ip: string; // Will be simulated since we're client-side only
  location: string; // Coarse location simulation
}

export interface UrlFormData {
  originalUrl: string;
  customShortCode: string;
  validityMinutes: number;
}