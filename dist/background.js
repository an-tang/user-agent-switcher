import { DEFAULT_SETTINGS } from './types.js';
const RULE_ID_BASE = 1;
const RESOURCE_TYPES = [
    'main_frame',
    'sub_frame',
    'stylesheet',
    'script',
    'image',
    'font',
    'object',
    'xmlhttprequest',
    'ping',
    'media',
    'websocket',
    'webtransport',
    'webbundle',
    'other'
];
async function getSettings() {
    const result = await chrome.storage.local.get(DEFAULT_SETTINGS);
    return result;
}
async function updateRules() {
    const settings = await getSettings();
    // Remove all existing dynamic rules
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    if (existingRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: existingRuleIds
        });
    }
    if (!settings.enabled || !settings.userAgent) {
        return;
    }
    const excludedDomains = settings.excludedDomains?.length
        ? settings.excludedDomains
        : DEFAULT_SETTINGS.excludedDomains;
    const newRules = [];
    if (settings.mode === 'all') {
        newRules.push({
            id: RULE_ID_BASE,
            priority: 1,
            action: {
                type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                requestHeaders: [
                    {
                        header: 'User-Agent',
                        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                        value: settings.userAgent
                    }
                ]
            },
            condition: {
                urlFilter: '*',
                resourceTypes: RESOURCE_TYPES,
                ...(excludedDomains.length > 0 && {
                    excludedRequestDomains: excludedDomains
                })
            }
        });
    }
    else if (settings.mode === 'perSite' && settings.siteRules.length > 0) {
        settings.siteRules.forEach((rule, index) => {
            if (rule.domain && rule.userAgent) {
                newRules.push({
                    id: RULE_ID_BASE + index,
                    priority: 1,
                    action: {
                        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                        requestHeaders: [
                            {
                                header: 'User-Agent',
                                operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                                value: rule.userAgent
                            }
                        ]
                    },
                    condition: {
                        urlFilter: `||${rule.domain}`,
                        resourceTypes: RESOURCE_TYPES
                    }
                });
            }
        });
    }
    if (newRules.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: newRules
        });
    }
}
// Listen for settings changes
chrome.storage.onChanged.addListener(async (_changes, namespace) => {
    if (namespace === 'local') {
        try {
            await updateRules();
        }
        catch (error) {
            console.error('Failed to update rules:', error);
        }
    }
});
// Initialize rules on install/startup
chrome.runtime.onInstalled.addListener(async () => {
    try {
        await updateRules();
    }
    catch (error) {
        console.error('Failed to initialize rules on install:', error);
    }
});
chrome.runtime.onStartup.addListener(async () => {
    try {
        await updateRules();
    }
    catch (error) {
        console.error('Failed to initialize rules on startup:', error);
    }
});
// Initialize rules when service worker activates
// Using async IIFE because top-level await is not supported in service workers
(async () => {
    try {
        await updateRules();
    }
    catch (error) {
        console.error('Failed to initialize rules:', error);
    }
})();
