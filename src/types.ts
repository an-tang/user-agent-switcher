export interface SiteRule {
  domain: string;
  userAgent: string;
}

export interface CustomPreset {
  name: string;
  userAgent: string;
}

export interface Settings {
  enabled: boolean;
  userAgent: string;
  mode: 'all' | 'perSite';
  siteRules: SiteRule[];
  customPresets: CustomPreset[];
  excludedDomains: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: false,
  userAgent: '',
  mode: 'all',
  siteRules: [],
  customPresets: [],
  excludedDomains: ['chatgpt.com', 'chat.openai.com', 'openai.com', 'oaistatic.com', 'oaiusercontent.com']
};
