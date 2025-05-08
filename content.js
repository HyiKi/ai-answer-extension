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
    <div class="ai-popup-header">
      <span class="ai-popup-title">AI 问答</span>
      <span class="ai-popup-close" title="关闭">×</span>
    </div>
    <textarea>${selectedText}</textarea>
    <div class="ai-popup-actions">
      <button id="ai-confirm">确认</button>
      <button id="ai-close">关闭</button>
    </div>
  </div>
    `;
  // 绑定顶部 [X]
  popup.querySelector(".ai-popup-close").onclick = () => popup.remove();

  // 拖拽逻辑
  makeDraggable(popup.querySelector(".ai-popup-inner"), popup);
  document.body.appendChild(popup);
  const style = document.createElement("style");
  style.textContent = `
#ai-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
  background: rgba(0, 0, 0, 0.2); /* 半透明背景 */
  padding: 0;
  margin: 0;
}

.ai-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  margin-bottom: 12px;
  user-select: none;
}

.ai-popup-title {
  font-weight: bold;
  font-size: 16px;
}

.ai-popup-close {
  cursor: pointer;
  font-size: 18px;
  color: #999;
  padding: 2px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.ai-popup-close:hover {
  background-color: #eee;
  color: #333;
}

.ai-popup-inner {
  background-color: #ffffff;
  color: #333;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  width: 320px;
  max-width: 90vw;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  animation: fadeIn 0.3s ease;
}

.ai-popup-inner textarea {
  width: 100%;
  height: 120px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  transition: border 0.2s ease;
}

.ai-popup-inner textarea:focus {
  border-color: #4a90e2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.ai-popup-actions {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.ai-popup-actions button {
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

#ai-confirm {
  background-color: #4a90e2;
  color: white;
}

#ai-close {
  background-color: #e0e0e0;
  color: #333;
}

.ai-popup-actions button:hover {
  transform: translateY(-1px);
}

.ai-popup-actions button:active {
  transform: translateY(0);
}

.ai-answer-popup {
  margin-top: 20px;
  background-color: #f9f9f9;
  color: #333;
  padding: 14px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  white-space: pre-wrap;
  animation: fadeIn 0.25s ease;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
  word-break: break-word;
}

.ai-answer-popup::-webkit-scrollbar {
  width: 6px;
}

.ai-answer-popup::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}

.ai-answer-text {
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 12px;
}

.ai-copy-button {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.ai-copy-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.ai-copy-button:active {
  transform: translateY(0);
}

.ai-toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 100000;
}

.ai-toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.ai-answer-popup.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  gap: 12px;
  color: #666;
  font-size: 14px;
}

.ai-loading-text {
  font-style: italic;
}

.ai-loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #ccc;
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`;
  document.head.appendChild(style);

  document.getElementById("ai-close").onclick = () => popup.remove();
  document.getElementById("ai-confirm").onclick = () => {
    const question = document.querySelector("#ai-popup textarea").value;

    // 清除旧的回答区域（如有）
    const oldAnswer = document.querySelector(".ai-answer-popup");
    if (oldAnswer) oldAnswer.remove();

    // 插入 Loading 占位
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "ai-answer-popup loading";
    loadingDiv.innerHTML = `<div class="ai-loading-spinner"></div><div class="ai-loading-text">AI 正在思考中...</div>`;

    document.querySelector(".ai-popup-inner").appendChild(loadingDiv);

    // 向后台发消息
    chrome.runtime.sendMessage({ action: "fetchAIAnswer", question });
  };
}

function showAnswer(answer) {
  const loadingDiv = document.querySelector(".ai-answer-popup.loading");
  if (loadingDiv) loadingDiv.remove();
  const popup = document.getElementById("ai-popup");
  if (!popup) return;
  const oldAnswer = popup.querySelector(".ai-answer-popup");
  if (oldAnswer) oldAnswer.remove();

  const resultPopup = document.createElement("div");
  resultPopup.className = "ai-answer-popup";

  const answerText = document.createElement("div");
  answerText.className = "ai-answer-text";
  answerText.innerText = answer;

  const copyButton = document.createElement("button");
  copyButton.className = "ai-copy-button";
  copyButton.innerText = "复制";

  copyButton.onclick = () => {
    navigator.clipboard.writeText(answer).then(() => {
      showToast("复制成功！");
      copyButton.innerText = "已复制";
      setTimeout(() => (copyButton.innerText = "复制"), 1500);
    });
  };

  resultPopup.appendChild(answerText);
  resultPopup.appendChild(copyButton);

  document.querySelector(".ai-popup-inner").appendChild(resultPopup);
}

function makeDraggable(dragHandle, dragTarget) {
  let isDragging = false;
  let offsetX, offsetY;

  dragHandle.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = dragTarget.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    dragTarget.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      dragTarget.style.left = `${e.clientX - offsetX}px`;
      dragTarget.style.top = `${e.clientY - offsetY}px`;
      dragTarget.style.transform = `none`; // 禁用居中 transform
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

// Toast 提示函数
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "ai-toast";
  toast.innerText = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("visible");
  });

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
