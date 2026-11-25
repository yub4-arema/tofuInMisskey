// ==UserScript==
// @name         Tofu for Misskey
// @namespace    https://github.com/yub4-arema/tofuInMisskey
// @version      0.1.0
// @description  Misskey の画面の右下にトウフを出す。マウスに顔と目が追従し、クリックでモーションを再生する。
// @match        https://YOUR-SERVER.example/*
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

// @match の YOUR-SERVER.example を、使っている Misskey のサーバー名に書き換えて使う。

(() => {
  "use strict";
  const URL_TOFU = "https://yub4-arema.github.io/tofuInMisskey/widget.html";
  const ORIGIN = new URL(URL_TOFU).origin;
  const KEY = "tofu.hidden";
  const W = 240;
  const H = 360;

  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "fixed", right: "12px", bottom: "0", width: `${W}px`, height: `${H}px`,
    zIndex: "9999", pointerEvents: "none",
  });
  const frame = document.createElement("iframe");
  frame.src = URL_TOFU;
  frame.title = "Tofu";
  frame.setAttribute("allowtransparency", "true");
  Object.assign(frame.style, {
    width: "100%", height: "100%", border: "0", background: "transparent",
    colorScheme: "light", // 親が dark でも iframe の背景が不透明にならないようにする
    pointerEvents: "auto",
  });
  box.append(frame);
  document.body.append(box);

  const apply = () => (box.style.display = localStorage.getItem(KEY) === "1" ? "none" : "block");
  apply();
  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("トウフを表示 / 隠す", () => {
      localStorage.setItem(KEY, localStorage.getItem(KEY) === "1" ? "0" : "1");
      apply();
    });
  }

  // 親ページのマウス位置を iframe に渡す (iframe の外でも追従させる)
  let pending = null;
  const send = (m) =>
    frame.contentWindow?.postMessage(m ? { type: "tofu:look", ...m } : { type: "tofu:look" }, ORIGIN);
  window.addEventListener("pointermove", (e) => {
    if (box.style.display === "none") return;
    if (!pending) requestAnimationFrame(() => {
      if (pending) send(pending);
      pending = null;
    });
    const r = frame.getBoundingClientRect();
    pending = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  document.documentElement.addEventListener("pointerleave", () => send(null));
})();
