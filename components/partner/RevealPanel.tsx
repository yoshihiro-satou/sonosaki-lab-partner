"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap-lazy";
import styles from "@/app/partner/partner.module.css";

/**
 * 一覧の行を、少し下から定位置へ揃えて出す（節が画面に入ったとき、一度だけ）。
 *
 * 🆕 2026-10-13＝**透明から出すのをやめた。** 行は最初から見えていて、18px 下から上がってくるだけ。
 *    旧（opacity:0 から出す＋枠のネオン管を明滅させる）は、スクロールしないで撮った
 *    全体のスクリーンショットで、一覧の中身と枠の光が全部消えて「空の箱が並ぶページ」に写った。
 *    このページは撮られて社内で回されることがある＝撮った絵で中身が読めないのは致命的。
 *    ⇒ 隠す初期状態を1つも作らない。どの撮り方でも、どの瞬間でも、文字は読める。
 *
 * 🎬 動きの決め方（短い距離を、長めの時間で）
 *    18px を 1.0 秒。既定値に多い「40〜60px を 0.4 秒」は、ぬるっと湧いて見える。
 *    距離を短くすると、動いたことは分かるのに、読む邪魔をしない。
 *
 * 🔴 初期位置は CSS に書かない。JS が「これから動かせる」と確かめてから付ける。
 *    JS が落ちた端末では、何も起きずに定位置のまま＝完成した一覧として残る。
 *
 * ♿ 動きが苦手な設定のときは、GSAP を読み込まない（0KB・最初から定位置）。
 */
export default function RevealPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    let cleanup = () => {};
    let cancelled = false;

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !ref.current) return;

        /* 🔴 作ったもの（タブで中身が入れ替わる所）の中身は動かさない。
           GSAP がインラインの値を書いた要素を React が差し替えると、値が宙に浮いて事故りやすい。 */
        const items = ref.current.querySelectorAll<HTMLElement>(`.${styles.revealItem}`);
        if (!items.length) return;

        // ここで初めて位置をずらす（上のコメントの理由）。opacity には触らない
        gsap.set(items, { y: 18 });

        const tween = gsap.to(items, {
          y: 0,
          duration: 1.0,
          ease: "power3.out",
          // 🔴 0.07 秒 刻み。7項目で 0.49 秒＝読み始めを待たせない上限あたり。
          stagger: 0.07,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true, // 🔴 1回だけ。読み返すたびに動かし直さない
          },
        });

        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(items, { clearProps: "transform" });
          ScrollTrigger.refresh();
        };
      })
      .catch(() => {
        /* 来なければ定位置のまま＝一覧としては完成している */
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  );
}
