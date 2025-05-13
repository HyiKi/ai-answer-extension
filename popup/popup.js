const input = document.getElementById("apikey-input");
const toggleBtn = document.getElementById("toggle-visibility");
const langSelect = document.getElementById("lang-select");
const labels = document.querySelectorAll("[data-i18n]");
const options = document.querySelectorAll("[data-i18n-option]");
const versionEl = document.getElementById("plugin-version");
const saveBtn = document.getElementById("save-btn");
const modelSelect = document.getElementById("model-select");
const toolSelect = document.getElementById("tool-select");
const apikeyInput = document.getElementById("apikey-input");

// 默认配置
const DEFAULT_CONFIG = {
  model: "deepseek",
  tool: "qa",
  apikey: "",
  lang: "zh",
};

const i18n = {
  zh: {
    model: "模型服务：",
    tool: "工具：",
    apikey: "密钥（如必要）：",
    version: "版本：",
    qa: "问答",
    translate: "翻译",
    save: "应用",
  },
  en: {
    model: "Model Service:",
    tool: "Tool:",
    apikey: "API Key (if needed):",
    version: "Version: ",
    qa: "Q&A",
    translate: "Translation",
    save: "Save",
  },
  ja: {
    model: "モデルサービス：",
    tool: "ツール：",
    apikey: "APIキー（必要に応じて）：",
    version: "バージョン：",
    qa: "質疑応答",
    translate: "翻訳",
    save: "応用",
  },
  ko: {
    model: "모델 서비스:",
    tool: "도구:",
    apikey: "API 키 (필요시):",
    version: "버전: ",
    qa: "질의응답",
    translate: "번역",
    save: "구하다",
  },
};

// 切换密钥显示
toggleBtn.addEventListener("click", () => {
  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
});

// 应用语言文本
function applyLanguage(lang) {
  labels.forEach((label) => {
    const key = label.getAttribute("data-i18n");
    label.textContent = i18n[lang][key];
  });
  options.forEach((option) => {
    const key = option.getAttribute("data-i18n-option");
    option.textContent = i18n[lang][key];
  });
  try {
    const version = chrome.runtime.getManifest().version || "1.0.0";
    versionEl.textContent = i18n[lang].version + version;
  } catch (e) {
    versionEl.textContent = i18n[lang].version + "1.0.0";
  }

  // 更新“保存”按钮文字
  if (saveBtn) saveBtn.textContent = i18n[lang].save;
}

// 下拉语言切换
langSelect.addEventListener("change", () => {
  const lang = langSelect.value;
  applyLanguage(lang);
  chrome.storage.sync.set({ lang });
});

// 初始化加载配置（带默认值 fallback）
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(DEFAULT_CONFIG, (data) => {
    modelSelect.value = data.model;
    toolSelect.value = data.tool;
    apikeyInput.value = data.apikey;
    langSelect.value = data.lang;
    applyLanguage(data.lang);
  });
});

saveBtn.addEventListener("click", () => {
  const config = {
    model: document.getElementById("model-select").value,
    tool: document.getElementById("tool-select").value,
    apikey: document.getElementById("apikey-input").value,
    lang: document.getElementById("lang-select").value,
  };
  chrome.storage.sync.set(config, () => {
    alert("Save Config ✅" + JSON.stringify(config));
  });
});
