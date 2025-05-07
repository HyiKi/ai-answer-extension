// 接收来自后台的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "showPopup") {
    createPopup(message.selectedText);
  } else if (message.action === "showAIAnswer") {
    showAnswer(message.answer);
  }
});

function createPopup(selectedText) {
  // 避免重复插入
  if (document.getElementById("ai-popup")) return;

  const popup = document.createElement("div");
  popup.id = "ai-popup";
  popup.innerHTML = `
      <div class="ai-popup-inner">
        <textarea>${selectedText}</textarea>
        <div class="ai-popup-actions">
          <button id="ai-confirm">确认</button>
          <button id="ai-close">关闭</button>
        </div>
      </div>
    `;
  document.body.appendChild(popup);
  const style = document.createElement("style");
  style.textContent = `
  #ai-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    width: 300px;
    font-family: sans-serif;
  }
  #ai-popup textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 12px;
  }
  .ai-popup-actions {
    display: flex;
    justify-content: space-between;
  }
  .ai-answer-popup {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #323232;
    color: #fff;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10000;
  }
`;
  document.head.appendChild(style);

  document.getElementById("ai-close").onclick = () => popup.remove();
  document.getElementById("ai-confirm").onclick = () => {
    const question = popup.querySelector("textarea").value;
    chrome.runtime.sendMessage({ action: "fetchAIAnswer", question });
    popup.remove();
  };
}

function showAnswer(answer) {
  const resultPopup = document.createElement("div");
  resultPopup.className = "ai-answer-popup";
  resultPopup.innerText = "AI Answer: " + answer;
  document.body.appendChild(resultPopup);
  setTimeout(() => resultPopup.remove(), 8000);
}
