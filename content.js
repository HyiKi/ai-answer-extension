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
