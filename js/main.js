// お問い合わせフォーム・送信結果ポップアップ
const contactForm = document.querySelector(".contact-form");
const popup = document.getElementById("popup");
const popupMessage = popup.querySelector(".popup__message-text");
const popupSummary = popup.querySelector(".popup__summary");

// 送信内容の項目名
const fieldLabels = {
  name: "お名前",
  company: "会社名",
  email: "メールアドレス",
  message: "お問い合わせ内容",
};

// 送信結果を表示し、成功時は入力内容も一覧にする。
function openPopup(message, summaryFormData) {

  // アイコンを残し、テキスト部分だけを更新する。
  popupMessage.textContent = message;

  popupSummary.innerHTML = "";

  if (summaryFormData) {
    for (const [key, label] of Object.entries(fieldLabels)) {
      const value = summaryFormData.get(key);

      const dt = document.createElement("dt");
      dt.textContent = label;

      const dd = document.createElement("dd");
      dd.textContent = value || "(未入力)";

      popupSummary.append(dt, dd);
    }
  }

  popup.hidden = false;
}

// 送信結果ポップアップを閉じる。
function closePopup() {
  popup.hidden = true;
}

// 閉じるボタン・背景クリック
popup.querySelectorAll("[data-popup-close]").forEach((el) => {
  el.addEventListener("click", closePopup);
});

// ページ遷移せずに送信し、結果をポップアップに表示する。
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: formData,
        headers: {
          Accept: "application/json", // FormspreeからJSONで結果を受け取る。
        },
      });

      if (response.ok) {
        // 入力内容を表示してからフォームをリセットする。
        openPopup("以下の内容で送信が完了しました。", formData);
        contactForm.reset();
      } else {
        openPopup("送信に失敗しました。\n時間をおいて再度お試しください。");
      }
    } catch (error) {
      openPopup("通信エラーが発生しました。\nネットワーク環境をご確認ください。");
    }
  });
}

// 作品仕様書のモーダルを開く。
document.querySelectorAll('[data-work-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.workOpen);
    if (dialog && !dialog.open) dialog.showModal();
  });
});

// 背景クリックで閉じる。Escキーとフォーカス管理はdialogの標準機能を使う。
document.querySelectorAll('.work-modal').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) {
      dialog.close();
    }
  });
});
