"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap-lazy";
import styles from "@/app/partner/partner.module.css";

/**
 * 枠線の中の一覧（できること／お引き受けしません／資材の扱い…）を、
 * 視界に入ったときに1行ずつ ふわっと立ち上げる。
 *
 * 🔴🔴 初期位置（隠れた状態）を CSS に書かない。
 *    CSS で `opacity:0` にすると、JS が落ちた端末で**一覧が永久に出ない。**
 *    このページで消えるのが「できること・できないこと」だと、
 *    読み手は仕事の範囲が分からないまま帰ることになる＝演出のために本題を失う。
 *    ⇒ 隠すのは、GSAP が読み終わって「これから動かせる」と確定した後だけ。
 *      何も起きなければ、ただの読める一覧として残る。
 *
 * 🔴 なぜ節ごとではなく「行ごと」に遅らせるのか＝
 *    箱ごと出すと、一覧であることが伝わる前に全部 出てしまう。
 *    1行ずつ上がると、目が自然に上から下へ動く＝**読ませたい順に視線が乗る。**
 *
 * 🔴 なぜ 0.06 秒 刻みなのか＝
 *    7項目 × 0.06 ＝ 0.42 秒。0.1 秒 刻みだと最後の行まで 0.7 秒 かかり、
 *    「読もうとしたのにまだ出ていない」待ちが生まれる。
 *    演出が読む速さを邪魔しない上限が、だいたいこのあたり。
 *
 * 🔴 なぜ once: true なのか＝
 *    上下に読み返すたびに出し直すと、探し物をしている人の邪魔になる。
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
        const items = ref.current.querySelectorAll<HTMLElement>(
          `.${styles.revealItem}`,
        );
        if (!items.length) return;

        // ここで初めて隠す（上のコメントの理由）
        gsap.set(items, { opacity: 0, y: 14 });

        const tween = gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            once: true,
          },
        });

        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          // 消える前に必ず見える状態へ戻す
          gsap.set(items, { clearProps: "opacity,transform" });
          ScrollTrigger.refresh();
        };
      })
      .catch(() => {
        /* 来なければ出たまま＝一覧としては完成している */
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
