// Local tracking utility for Suelo Urbano
export interface PageMetrics {
  views: number;
  timeSpentSeconds: number;
}

export interface AnalyticsData {
  firstInteraction: number;
  lastInteraction: number;
  pages: { [path: string]: PageMetrics };
  totalSessions: number;
  clickEvents: { path: string; elementId: string; timestamp: number }[];
}

const DEFAULT_ANALYTICS: AnalyticsData = {
  firstInteraction: Date.now(),
  lastInteraction: Date.now(),
  pages: {},
  totalSessions: 1,
  clickEvents: []
};

export const getLocalAnalytics = (): AnalyticsData => {
  try {
    const raw = localStorage.getItem('suelo_urbano_local_analytics_v1');
    if (!raw) {
      localStorage.setItem('suelo_urbano_local_analytics_v1', JSON.stringify(DEFAULT_ANALYTICS));
      return JSON.stringify(DEFAULT_ANALYTICS) as unknown as AnalyticsData;
    }
    const parsed = JSON.parse(raw);
    // Ensure nested properties exist
    if (!parsed.pages) parsed.pages = {};
    if (!parsed.clickEvents) parsed.clickEvents = [];
    return parsed;
  } catch (e) {
    return DEFAULT_ANALYTICS;
  }
};

export const saveLocalAnalytics = (data: AnalyticsData) => {
  try {
    localStorage.setItem('suelo_urbano_local_analytics_v1', JSON.stringify(data));
  } catch (e) {
    console.error('Error saving local analytics', e);
  }
};

export const trackPageView = (path: string) => {
  const data = getLocalAnalytics();
  const cleanPath = path || '#/inicio';
  
  if (!data.pages[cleanPath]) {
    data.pages[cleanPath] = { views: 0, timeSpentSeconds: 0 };
  }
  
  data.pages[cleanPath].views += 1;
  data.lastInteraction = Date.now();
  saveLocalAnalytics(data);
};

export const trackPageTime = (path: string, durationSeconds: number) => {
  if (durationSeconds <= 0) return;
  const data = getLocalAnalytics();
  const cleanPath = path || '#/inicio';
  
  if (!data.pages[cleanPath]) {
    data.pages[cleanPath] = { views: 1, timeSpentSeconds: 0 };
  }
  
  data.pages[cleanPath].timeSpentSeconds += Math.round(durationSeconds);
  data.lastInteraction = Date.now();
  saveLocalAnalytics(data);
};

export const trackClick = (path: string, elementId: string) => {
  const data = getLocalAnalytics();
  data.clickEvents.push({
    path,
    elementId,
    timestamp: Date.now()
  });
  // Keep only last 100 click events
  if (data.clickEvents.length > 100) {
    data.clickEvents.shift();
  }
  saveLocalAnalytics(data);
};

export const clearLocalAnalytics = () => {
  const fresh = {
    ...DEFAULT_ANALYTICS,
    firstInteraction: Date.now(),
    lastInteraction: Date.now(),
    totalSessions: 1
  };
  saveLocalAnalytics(fresh);
  return fresh;
};
