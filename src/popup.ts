import { Settings, SiteRule, CustomPreset, DEFAULT_SETTINGS } from './types.js';

document.addEventListener('DOMContentLoaded', async () => {
  const enabledEl = document.getElementById('enabled') as HTMLInputElement;
  const modeEl = document.getElementById('mode') as HTMLSelectElement;
  const userAgentEl = document.getElementById('userAgent') as HTMLTextAreaElement;
  const globalSection = document.getElementById('globalSection') as HTMLDivElement;
  const perSiteSection = document.getElementById('perSiteSection') as HTMLDivElement;
  const siteRulesEl = document.getElementById('siteRules') as HTMLDivElement;
  const addRuleBtn = document.getElementById('addRule') as HTMLButtonElement;
  const saveBtn = document.getElementById('save') as HTMLButtonElement;
  const statusEl = document.getElementById('status') as HTMLDivElement;
  const customPresetsEl = document.getElementById('customPresets') as HTMLDivElement;
  const presetNameEl = document.getElementById('presetName') as HTMLInputElement;
  const savePresetBtn = document.getElementById('savePreset') as HTMLButtonElement;

  let customPresets: CustomPreset[] = [];

  // Load saved settings
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS) as Settings;

  enabledEl.checked = settings.enabled;
  modeEl.value = settings.mode;
  userAgentEl.value = settings.userAgent;
  customPresets = settings.customPresets || [];

  updateModeVisibility();
  renderSiteRules(settings.siteRules);
  renderCustomPresets();

  // Mode change handler
  modeEl.addEventListener('change', updateModeVisibility);

  function updateModeVisibility(): void {
    if (modeEl.value === 'all') {
      globalSection.classList.remove('hidden');
      perSiteSection.classList.add('hidden');
    } else {
      globalSection.classList.add('hidden');
      perSiteSection.classList.remove('hidden');
    }
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderSiteRules(rules: SiteRule[]): void {
    siteRulesEl.innerHTML = '';
    rules.forEach((rule, index) => {
      const ruleDiv = document.createElement('div');
      ruleDiv.className = 'site-rule';
      ruleDiv.innerHTML = `
        <input type="text" class="rule-domain" placeholder="example.com" value="${escapeHtml(rule.domain || '')}">
        <textarea class="rule-ua" placeholder="User-Agent">${escapeHtml(rule.userAgent || '')}</textarea>
        <button class="btn-remove" data-index="${index}">&times;</button>
      `;
      siteRulesEl.appendChild(ruleDiv);
    });

    // Add remove handlers
    siteRulesEl.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLButtonElement;
        const index = Number.parseInt(target.dataset.index || '0', 10);
        const currentRules = getSiteRulesFromDOM();
        currentRules.splice(index, 1);
        renderSiteRules(currentRules);
      });
    });
  }

  function getSiteRulesFromDOM(): SiteRule[] {
    const rules: SiteRule[] = [];
    siteRulesEl.querySelectorAll('.site-rule').forEach(ruleDiv => {
      const domainInput = ruleDiv.querySelector('.rule-domain') as HTMLInputElement;
      const uaTextarea = ruleDiv.querySelector('.rule-ua') as HTMLTextAreaElement;
      rules.push({
        domain: domainInput.value.trim(),
        userAgent: uaTextarea.value.trim()
      });
    });
    return rules;
  }

  // Add new rule
  addRuleBtn.addEventListener('click', () => {
    const currentRules = getSiteRulesFromDOM();
    currentRules.push({ domain: '', userAgent: '' });
    renderSiteRules(currentRules);
  });

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const button = btn as HTMLButtonElement;
      userAgentEl.value = button.dataset.ua || '';
    });
  });

  // Render custom presets
  function renderCustomPresets(): void {
    customPresetsEl.innerHTML = '';
    customPresets.forEach((preset, index) => {
      const btn = document.createElement('button');
      btn.className = 'custom-preset';
      btn.dataset.ua = preset.userAgent;
      btn.innerHTML = `
        ${escapeHtml(preset.name)}
        <span class="delete-preset" data-index="${index}">&times;</span>
      `;
      customPresetsEl.appendChild(btn);
    });

    // Add click handlers for custom presets
    customPresetsEl.querySelectorAll('.custom-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!target.classList.contains('delete-preset')) {
          const button = btn as HTMLButtonElement;
          userAgentEl.value = button.dataset.ua || '';
        }
      });
    });

    // Add delete handlers
    customPresetsEl.querySelectorAll('.delete-preset').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        const index = Number.parseInt(target.dataset.index || '0', 10);
        customPresets.splice(index, 1);
        await chrome.storage.local.set({ customPresets });
        renderCustomPresets();
      });
    });
  }

  // Save as preset
  savePresetBtn.addEventListener('click', async () => {
    const name = presetNameEl.value.trim();
    const userAgent = userAgentEl.value.trim();

    if (!name) {
      statusEl.textContent = 'Please enter a preset name';
      statusEl.classList.add('error');
      setTimeout(() => statusEl.textContent = '', 2000);
      return;
    }

    if (!userAgent) {
      statusEl.textContent = 'Please enter a User-Agent first';
      statusEl.classList.add('error');
      setTimeout(() => statusEl.textContent = '', 2000);
      return;
    }

    customPresets.push({ name, userAgent });
    await chrome.storage.local.set({ customPresets });
    presetNameEl.value = '';
    renderCustomPresets();

    statusEl.textContent = 'Preset saved!';
    statusEl.classList.remove('error');
    setTimeout(() => statusEl.textContent = '', 2000);
  });

  // Save settings
  saveBtn.addEventListener('click', async () => {
    const newSettings: Settings = {
      enabled: enabledEl.checked,
      mode: modeEl.value as 'all' | 'perSite',
      userAgent: userAgentEl.value.trim(),
      siteRules: getSiteRulesFromDOM().filter(r => r.domain || r.userAgent),
      customPresets
    };

    try {
      await chrome.storage.local.set(newSettings);
      statusEl.textContent = 'Settings saved!';
      statusEl.classList.remove('error');
      setTimeout(() => {
        statusEl.textContent = '';
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      statusEl.textContent = `Error saving settings: ${message}`;
      statusEl.classList.add('error');
      console.error('Failed to save settings:', error);
    }
  });
});
