(function () {
  const storageKey = 'your-nodered-theme-overrides';
  const rootStyle = document.documentElement.style;

  const loadOverrides = () => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn('my-nodered theme: failed to read overrides from storage', error);
      return {};
    }
  };

  const persistOverrides = (overrides) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(overrides));
    } catch (error) {
      console.warn('my-nodered theme: failed to persist overrides', error);
    }
  };

  const applyOverrides = (overrides = {}) => {
    Object.entries(overrides).forEach(([variable, value]) => {
      if (typeof variable !== 'string' || !variable.startsWith('--')) {
        return;
      }

      if (value === null || value === undefined) {
        rootStyle.removeProperty(variable);
        return;
      }

      rootStyle.setProperty(variable, value);
    });
  };

  const mergeOverrides = (current, next = {}) => {
    const merged = { ...current };
    Object.entries(next).forEach(([key, value]) => {
      if (value === null) {
        delete merged[key];
      } else {
        merged[key] = value;
      }
    });
    return merged;
  };

  const currentOverrides = loadOverrides();
  applyOverrides(currentOverrides);

  const api = {
    apply(overrides) {
      const next = mergeOverrides(currentOverrides, overrides);
      applyOverrides(next);
      persistOverrides(next);
      return next;
    },
    reset() {
      Object.keys(currentOverrides).forEach((key) => {
        rootStyle.removeProperty(key);
        delete currentOverrides[key];
      });
      try {
        window.localStorage.removeItem(storageKey);
      } catch (error) {
        console.warn('my-nodered theme: failed to clear overrides', error);
      }
      return {};
    },
    get() {
      return { ...currentOverrides };
    },
  };

  window.myNoderedTheme = api;

  console.info('my-nodered theme (Zendesk Garden base) loaded');
  console.info('Customize via window.myNoderedTheme.apply({ "--red-ui-primary-background": "#1d2328" })');
  console.info('Call window.myNoderedTheme.reset() to clear persisted overrides.');

  // Enhance Function node Setup tab: add datalist suggestions for module names
  function getAllowedModules() {
    try {
      const allow = (window.RED && RED.settings && RED.settings.externalModules && RED.settings.externalModules.modules && RED.settings.externalModules.modules.allowList) || [];
      const builtins = ['fs','path','os','crypto','util','url','stream'];
      const merged = Array.from(new Set([].concat(allow, builtins))).filter(Boolean);
      return merged.sort((a,b)=>String(a).localeCompare(String(b)));
    } catch (err) {
      return [];
    }
  }

  function ensureDatalist() {
    let dl = document.getElementById('nr-allowed-modules-list');
    if (!dl) {
      dl = document.createElement('datalist');
      dl.id = 'nr-allowed-modules-list';
      document.body.appendChild(dl);
    }
    const items = getAllowedModules();
    const current = Array.from(dl.querySelectorAll('option')).map(o=>o.value);
    if (items.join('\n') !== current.join('\n')) {
      dl.innerHTML = items.map(m=>`<option value="${m}"></option>`).join('');
    }
    return dl;
  }

  function attachDatalistToInputs(root=document) {
    const dl = ensureDatalist();
    const inputs = root.querySelectorAll('input[type="text"]');
    inputs.forEach((inp)=>{
      const id = inp.id || '';
      const name = inp.getAttribute('name') || '';
      const placeholder = inp.getAttribute('placeholder') || '';
      const looksLikeModuleField = /module/i.test(id+name+placeholder);
      if (looksLikeModuleField) {
        inp.setAttribute('list', dl.id);
      }
    });
  }

  const observer = new MutationObserver((mutations)=>{
    for (const m of mutations) {
      if (m.addedNodes) {
        m.addedNodes.forEach((node)=>{
          if (node instanceof HTMLElement) {
            attachDatalistToInputs(node);
          }
        });
      }
    }
  });
  try {
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
  attachDatalistToInputs(document);
})();
