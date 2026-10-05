// ================================================
// お問い合わせフォームの送信処理
// ================================================
// 本来<form action="...">だけでも送信はできるが、その場合は
// Formspreeの完了ページへページ遷移してしまう(自分のサイトから離れてしまう)。
// それを避けるため、ブラウザ標準の送信は止めて、代わりにfetch()で
// 裏側(バックグラウンド)で送信し、結果はポップアップで表示する。

// ================================================
// ポップアップ(送信結果を表示するモーダル)関連
// ================================================
// HTML側の構造(index.html)は以下の入れ子になっている:
// #popup(全体。hidden属性で表示/非表示を切り替える)
//   .popup__overlay(背景の薄暗い部分。クリックで閉じる)
//   .popup__box(中央の白い箱)
//     .popup__close(右上の×ボタン)
//     .popup__message(「送信しました」などの文章)
//     .popup__summary(入力内容の確認リスト。dl/dt/ddで組み立てる)

const contactForm = document.querySelector(".contact-form");
const popup = document.getElementById("popup");
// popup.querySelector(...): popup全体ではなく、popupの中にある特定の要素だけを取得している
// .popup__message(全体)ではなく、中のテキスト部分(.popup__message-text)だけを取得している。
// アイコン(svg)とテキストが同じ.popup__message内にあるため、.popup__message自体のtextContentを
// 書き換えるとアイコンごと消えてしまう。テキスト部分だけを狙って書き換えるための工夫
const popupMessage = popup.querySelector(".popup__message-text");
const popupSummary = popup.querySelector(".popup__summary");

// フォームの各input/textareaのname属性と、ポップアップ内で表示したい日本語の項目名を対応させる表。
// オブジェクトのキー(name, company, email, message)はHTML側のname属性の値と完全に一致させる必要がある。
// こうして対応表にまとめておくことで、下のopenPopup()内でfor文を使い、
// 「name, company, email, message用のdt/ddを4回コピペする」ような重複を避けられる。
const fieldLabels = {
  name: "お名前",
  company: "会社名",
  email: "メールアドレス",
  message: "お問い合わせ内容",
};

// ポップアップを開く(表示する)関数。
// 引数:
//   message: ポップアップの上部に表示する一言メッセージ(必須)
//   summaryFormData: 送信した入力内容が入ったFormDataオブジェクト(省略可能)
//     ・渡された場合: 入力内容の確認リスト(dl)を組み立てて表示する(送信成功時に使う)
//     ・渡されなかった場合(undefined): 確認リストは空のまま、メッセージだけ表示する(送信失敗時に使う)
function openPopup(message, summaryFormData) {W

  // textContentに代入するとテキストとして扱われるため、
  // messageの中にもし<script>などの文字列が含まれていてもHTMLとして実行されず安全
  popupMessage.textContent = message;

  // 前回開いた時の確認リストが残らないよう、毎回いったん空にしてから組み立て直す
  popupSummary.innerHTML = "";

  // if (summaryFormData): summaryFormDataが渡されている(=truthyな値がある)時だけ中身を実行する。
  // 送信失敗時はopenPopup(message)のようにsummaryFormDataを渡さず呼ぶので、
  // その場合summaryFormDataはundefined(falsy)になり、このifの中はスキップされる
  if (summaryFormData) {
    // Object.entries(fieldLabels): {key: value}の形のオブジェクトを
    // [["name", "お名前"], ["company", "会社名"], ...] のような配列に変換し、
    // for...ofで1組ずつ取り出せるようにする
    for (const [key, label] of Object.entries(fieldLabels)) {
      // FormData.get(key): フォーム送信時点でその名前(name属性)の入力欄に入っていた値を取り出す
      const value = summaryFormData.get(key);

      // 項目名(例:「お名前」)を表示するdt要素を、JSで1つずつ作成する
      const dt = document.createElement("dt");
      dt.textContent = label;

      // 入力値(例:「山田 太郎」)を表示するdd要素を作成する
      const dd = document.createElement("dd");
      // 会社名は任意項目なので、空欄のまま送信されている可能性がある。
      // value || "(未入力)" は、valueが空文字("")のような falsy な値の時だけ
      // 代わりに"(未入力)"を使う、という意味(valueに何か入っていればそのまま使う)
      dd.textContent = value || "(未入力)";

      // 作ったdt・ddを、ポップアップ内の<dl class="popup__summary">の最後に追加する。
      // append()は複数の要素をまとめて追加できるので、dt→ddの順で並ぶ
      popupSummary.append(dt, dd);
    }
  }

  // hidden属性を外す(false にする)ことで、CSS側の `.popup[hidden] { display: none; }` が
  // 効かなくなり、ポップアップが画面に表示される
  popup.hidden = false;
}

// ポップアップを閉じる関数。hidden属性を付け直すだけのシンプルな処理
function closePopup() {
  popup.hidden = true;
}

// 閉じるボタン(.popup__close)と背景(.popup__overlay)、両方をクリックした時に閉じたいので、
// HTML側でその2つに共通の目印として data-popup-close というカスタム属性を付けてある。
// [data-popup-close] という書き方で、その属性を持つ要素をまとめて取得できる
popup.querySelectorAll("[data-popup-close]").forEach((el) => {
  el.addEventListener("click", closePopup);
});

// フォームが存在するページだけで動かす(他ページで読み込まれてもエラーにならないように)
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // ブラウザ標準の「送信してページ遷移する」動きを止める

    // フォーム内のinput/textareaの入力値を、送信用のデータにまとめる
    const formData = new FormData(contactForm);

    try {
      // form要素のaction/method属性の値をそのまま使って送信する
      const response = await fetch(contactForm.action, {
        method: contactForm.method,
        body: formData,
        headers: {
          // "JSON形式で結果を返してほしい"とFormspreeに伝えることで、
          // 完了ページへのリダイレクトではなくJSONレスポンスが返ってくるようになる
          Accept: "application/json",
        },W
      });

      if (response.ok) {
        // response.ok: HTTPステータスが200番台(成功)だった場合
        // formDataは送信時点の入力値をまだ持っているので、reset()より前に確認用として渡す
        openPopup("以下の内容で送信が完了しました。", formData);
        contactForm.reset(); // 入力欄を空に戻す
      } else {
        // サーバー側には届いたが、エラーが返ってきた場合(入力内容の問題など)
        openPopup("送信に失敗しました。\n時間をおいて再度お試しください。");
      }
    } catch (error) {
      // ネットワーク切断などでfetch自体が失敗した場合
      openPopup("通信エラーが発生しました。\nネットワーク環境をご確認ください。");
    }
  });
}
