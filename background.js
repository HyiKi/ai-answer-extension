// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ai-answer",
    title: "Get AI Answer",
    contexts: ["selection"],
  });
});

// 响应右键点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "ai-answer" && info.selectionText) {
    // 注入 content.js（如果还没注入）
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content.js"],
      },
      () => {
        // 向 content script 发送消息
        chrome.tabs.sendMessage(tab.id, {
          action: "showPopup",
          selectedText: info.selectionText,
        });
      }
    );
  }
});

// 接收 content script 请求 AI 接口
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "fetchAIAnswer") {
    // 获取配置参数
    chrome.storage.sync.get(["model", "tool", "apikey", "lang"], (config) => {
      const model = config.model || "DEEPSEEK";
      const tool = config.tool || "QA";
      const apikey = config.apikey || "";
      const lang = config.lang?.toUpperCase() || "ZH"; // zh → ZH
      const authToken = "token-7jejj0g6cce03g0fa5bd39b8fe66"; // 固定 Bearer token

      fetch(
        "https://ai-answer-ai-answer-liqfgxbbaa.cn-beijing.fcapp.run/api/ai/answer",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: message.question,
            answers: [{ key: "answer", type: "STRING" }],
            model: model,
            tool: tool,
            apikey: apikey,
            lang: lang,
          }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          const answer = data?.data?.output?.answer || "NO ANSWER";
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "showAIAnswer",
            answer: answer,
          });
        })
        .catch((error) => {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "showAIAnswer",
            answer: "ERROR " + error.message,
          });
        });
    });
  }
});
