"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap-lazy";
import styles from "@/app/partner/partner.module.css";

/**
 * 一覧の枠を「ネオン管が点く」ように出し、そのあと行を立ち上げる。
 *
 * 🎬 **演出は1か所にまとめている。**
 *    枠が視界に入る → 管が2回 瞬いてから灯る → 行が下から起き上がる、の一続き。
 *    節ごとにフェードを散らすより、**一度だけ起きる出来事**のほうが記憶に残る。
 *    本物のネオンは点く瞬間に必ず一度 ためらうので、そこを写した。
 *
 * 🔴🔴 隠れた状態を CSS の初期値にしない。
 *    CSS で `opacity:0` にすると、JS が落ちた端末で**一覧が永久に出ない。**
 *    このページで消えるのが「お引き受けできること・できないこと」だと、
 *    読み手は仕事の範囲が分からないまま帰る＝演出のために本題を失う。
 *    ⇒ 隠すのは、GSAP が読み終わって「これから動かせる」と確定した後だけ。
 *      何も起きなければ、**灯ったままの枠と、読める一覧**として残る。
 *
 * 🔴 なぜ枠の明滅を GSAP ではなく CSS の keyframes でやるのか＝
 *    box-shadow を毎フレーム 計算し直すのは重い。
 *    明滅は決め打ちのキーフレームで足りるので、ブラウザに任せて
 *    GSAP は**合図（クラスを付ける）だけ**にする。行の動きだけが GSAP の担当。
 *
 * ♿ 動きが苦手な設定のときは、明滅も立ち上がりもせず、最初から灯った状態で出す
 *    （明滅は光に過敏な人の負担になるため、ここは外せる装飾ではなく既定）。
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
    if (prefersReducedMotion()) return; // 最初から出た状態で見せる（0KB）

    let cleanup = () => {};
    let cancelled = false;

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !ref.current) return;

        /* ネオン管にする枠＝一覧の枠と、作ったものの枠。
           🔴 作ったものの枠の**中身は1行ずつ動かさない。**
              タブで中身が入れ替わる所なので、GSAP が opacity:0 を書いた要素を
              React が差し替えると、インラインの値が宙に浮いて事故りやすい。
              あそこは「管が点く」だけにして、中身は素直に出す。 */
        const panels = ref.current.querySelectorAll<HTMLElement>(
          `.${styles.panel}, .${styles.switchPanel}`,
        );
        const items = ref.current.querySelectorAll<HTMLElement>(`.${styles.revealItem}`);
        if (!panels.length && !items.length) return;

        // ここで初めて隠す・消す（上のコメントの理由）
        panels.forEach((p) => p.classList.add(styles.panelOff));
        if (items.length) gsap.set(items, { opacity: 0, y: 28 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true, // 🔴 1回だけ。読み返すたびに点け直さない
          },
        });

        // ① 管を点ける。枠が2つ並ぶときは 0.12 秒 ずらす
        //    （同時に点くと「1枚の板が光った」に見えて、管に見えない）
        tl.add(() => {
          panels.forEach((p, i) =>
            window.setTimeout(() => {
              p.classList.remove(styles.panelOff);
              p.classList.add(styles.panelOn);
            }, i * 120),
          );
        });

        // ② 管が安定してから行が起きる。
        //    0.52 秒＝明滅（0.8秒）の2回目の瞬きが終わるあたり。
        //    完全に終わるのを待つと間が空きすぎ、早すぎると明滅に埋もれる。
        if (items.length) {
          tl.to(
            items,
            {
              opacity: 1,
              y: 0,
              duration: 0.62,
              ease: "power3.out",
              // 🔴 0.07 秒 刻み。7項目で 0.49 秒＝読み始めを待たせない上限あたり。
              stagger: 0.07,
            },
            0.52,
          );
        }

        cleanup = () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          // 消える前に必ず「見える・灯っている」状態へ戻す
          if (items.length) gsap.set(items, { clearProps: "opacity,transform" });
          panels.forEach((p) =>
            p.classList.remove(styles.panelOff, styles.panelOn),
          );
          ScrollTrigger.refresh();
        };
      })
      .catch(() => {
        /* 来なければ灯ったまま・出たまま＝一覧としては完成している */
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
