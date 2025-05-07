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
    fetch("https://api.hyiki.sbs/intelligent/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: message.question,
        answers: [{ key: "answer", type: "STRING" }],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "showAIAnswer",
          answer: data.data.output.answer,
        });
      })
      .catch((error) => {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "showAIAnswer",
          answer: "Error: " + error.message,
        });
      });
  }
});
