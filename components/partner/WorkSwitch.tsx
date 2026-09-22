"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import styles from "@/app/partner/partner.module.css";

export type Work = {
  id: string;
  tab: string;
  title: string;
  body: string;
  facts: { k: string; v: string }[];
};

/**
 * 事例の切り替え。View Transitions API で、切り替えの「間」をつなぐ。
 *
 * 🎯 なぜこれを載せたか＝送り先の募集文が
 *    **「慣性スクロールや非同期遷移、各要素への演出」**を名指ししているから。
 *    「非同期遷移ができます」と書く代わりに、押してもらう。
 *
 * 🔴 なぜ CSS のフェードで済ませないのか＝
 *    フェードは「古い絵が消えて、新しい絵が出る」だけで、**間がつながらない**。
 *    View Transitions は切り替えの前後の絵をブラウザが撮って補間するので、
 *    枠や見出しが**同じ物として移動する**。差は動かしてみると一目で分かる。
 *
 * 🔴 なぜ flushSync が要るのか＝
 *    startViewTransition は「渡した関数が終わった時点の DOM」を後の絵として撮る。
 *    React の更新は既定では後回し（非同期）なので、普通に setState すると
 *    **まだ変わっていない DOM が撮られ、何も動かない**。
 *    flushSync でその場で描き切ってから返す。
 *
 * 🔴 なぜ対応していないブラウザを分岐で外すのか＝
 *    Safari の古い版などには startViewTransition が無い。
 *    呼べば例外で落ちて**タブそのものが切り替わらなくなる**ので、
 *    無い時はただの setState に落とす（動きが無いだけで、機能は生きる）。
 */
export default function WorkSwitch({ works }: { works: Work[] }) {
  const [active, setActive] = useState(works[0].id);

  const select = (id: string) => {
    if (id === active) return;

    type WithVT = Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const doc = document as WithVT;

    // 動きが苦手な設定の人には、切り替えの演出を掛けない（中身は同じように変わる）
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!doc.startViewTransition || reduced) {
      setActive(id);
      return;
    }
    doc.startViewTransition(() => {
      flushSync(() => setActive(id));
    });
  };

  const current = works.find((w) => w.id === active) ?? works[0];

  return (
    <div>
      {/* role=tablist ＝キーボードと読み上げに「選ぶ物が並んでいる」と伝える。
          見た目だけボタンに似せると、支援技術には何も伝わらない。 */}
      <div className={styles.switchBar} role="tablist" aria-label="実装の例">
        {works.map((w) => (
          <button
            key={w.id}
            type="button"
            role="tab"
            aria-selected={w.id === active}
            aria-controls={`work-${w.id}`}
            id={`tab-${w.id}`}
            className={styles.switchBtn}
            onClick={() => select(w.id)}
          >
            {w.tab}
          </button>
        ))}
      </div>

      <div
        className={styles.switchPanel}
        role="tabpanel"
        id={`work-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
      >
        <h3>{current.title}</h3>
        <p>{current.body}</p>
        <dl>
          {current.facts.map((f) => (
            <div key={f.k} style={{ display: "contents" }}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
