"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "@/app/partner/partner.module.css";

/** 取りうる幅の下限。これ以下にすると中のカードが読めなくなる */
const MIN_WIDTH = 280;

/**
 * 「幅を引ける枠」＝このページの主役。
 *
 * 🎯 ねらい＝**「レスポンシブ対応できます」と書かずに、相手の指で確かめさせる。**
 *    募集要項に並ぶ必須スキルは、文章で主張しても他の応募者と区別がつかない。
 *    枠を引いて中が本当に組み直れば、審査する側はその場で確かめ終わる。
 *
 * 🔴 なぜ pointer イベントで、ResizeObserver ではないのか＝
 *    枠の幅は「人が決めた入力値」であって「監視する対象」ではない。
 *    ResizeObserver で追うと、①指を動かす → ②枠が変わる → ③観測が発火 → ④再描画、
 *    と1フレーム余計に挟まり、**枠が指から遅れて付いてくる**。
 *    このページでは遅れがそのまま「実装が重い人」の印象になるので、
 *    指の座標から直接 幅を出して、同じフレームのうちに反映する。
 *
 * 🔴🔴 なぜ state を1つも持たないのか＝
 *    ドラッグ中は 1秒に 60〜120 回 動く。**1回でも setState を挟むと、
 *    そのたびに中のカードまで React が作り直し、確実にコマが落ちる。**
 *    幅・表示している数値・掴んでいるかどうかの3つとも、
 *    「React が管理する必要のない、見た目だけの値」なので DOM へ直接 書く。
 *    ⇒ この部品は、最初の1回を描いたあと二度と再描画されない。
 *    （React の作法から外れて見えるが、外部システム＝ポインタ入力との同期なので
 *      これが正しい側。逆に state で持つと、React の更新がボトルネックになる。）
 *
 * 🔴 なぜ pointer capture を使うのか＝
 *    取っ手から指がはみ出しても掴んだままにするため。
 *    使わないと、速く引いた瞬間にポインタが枠の外へ出て**ドラッグが切れる**。
 *
 * ♿ キーボードでも動く＝取っ手は button で、左右キーで 32px（Shift で 96px）動く。
 *    「触らないと何も分からない画面」を作らないのは実装者の責任の範囲。
 */
export default function ViewportFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const draggingRef = useRef(false);

  /** 幅を実際に当てる。返り値は丸めたあとの実値 */
  const applyWidth = useCallback((px: number) => {
    const frame = frameRef.current;
    const wrap = wrapRef.current;
    if (!frame || !wrap) return null;

    const clamped = Math.round(
      Math.min(Math.max(px, MIN_WIDTH), wrap.clientWidth),
    );
    frame.style.setProperty("--frame-w", `${clamped}px`);
    // 数値の表示も DOM へ直接。React を通さないので再描画が起きない
    if (labelRef.current) labelRef.current.textContent = `${clamped}px`;
    return clamped;
  }, []);

  /** いま枠に入っている幅（入っていなければ外枠いっぱい） */
  const currentWidth = useCallback(() => {
    const frame = frameRef.current;
    const wrap = wrapRef.current;
    if (!frame || !wrap) return 0;
    const v = parseInt(frame.style.getPropertyValue("--frame-w"), 10);
    return Number.isNaN(v) ? wrap.clientWidth : v;
  }, []);

  /* 初期値＝外枠いっぱい。
     🔴 サーバ描画では幅が分からないので、CSS 側の既定を 100% にしてある。
        ここで初めて数値が入る＝**最初の絵は JS 無しでも完成している**
        （JS が来なければ「引けないだけの、普通に正しい枠」として残る）。 */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (wrap?.clientWidth) applyWidth(wrap.clientWidth);

    const onResize = () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      // 画面が縮んで枠がはみ出すときだけ縮める。
      // 常に合わせにいくと、利用者がせっかく決めた幅を勝手に戻すことになる。
      if (currentWidth() > wrap.clientWidth) applyWidth(wrap.clientWidth);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyWidth, currentWidth]);

  /* 🔴 幅は「指の位置 − 枠の左端」の絶対座標で出す。
     前回との差分を足し込む作りにすると、取りこぼした 1px が毎フレーム積もって
     **指と枠が少しずつズレていく**。 */
  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingRef.current = true;
    // 🔴 掴んでいる間は transition を切る。残すと枠が指より 0.4秒 遅れて付いてきて、
    //    「重い実装」に見える。クラスの付け外しも DOM へ直接（再描画を起こさない）。
    frameRef.current?.classList.add(styles.dragging);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return;
    const frame = frameRef.current;
    if (!frame) return;
    applyWidth(e.clientX - frame.getBoundingClientRect().left);
  };

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    draggingRef.current = false;
    frameRef.current?.classList.remove(styles.dragging);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const step = (e.shiftKey ? 96 : 32) * (e.key === "ArrowLeft" ? -1 : 1);
    applyWidth(currentWidth() + step);
  };

  return (
    <div className={styles.frameWrap} ref={wrapRef}>
      <p className={styles.frameHint}>
        <span aria-hidden="true">⇤⇥</span>
        右の取っ手を引くと、中のレイアウトが本当に組み直ります
      </p>

      <div className={styles.frame} ref={frameRef}>
        <div className={styles.frameBar}>
          <span className={styles.frameDots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>sonosaki-lab.com</span>
          {/* 幅の数値。中身は applyWidth が DOM へ直接 書く。
              🔴 aria-live は付けない＝ドラッグ中に毎フレーム読み上げられて邪魔になる。 */}
          <span className={styles.frameWidth} ref={labelRef} aria-hidden="true">
            —
          </span>
        </div>

        <div className={styles.frameBody}>{children}</div>

        <button
          type="button"
          className={styles.handle}
          aria-label="枠の幅を変える（左右キーでも動きます）"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}
