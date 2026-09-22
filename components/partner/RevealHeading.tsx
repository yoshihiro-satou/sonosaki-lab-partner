"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap-lazy";
import styles from "@/app/partner/partner.module.css";

/**
 * 節見出しを、一文字ずつ下から押し上げて出す。
 *
 * 🔴🔴 **最初の画面（Hero）には絶対に使わない。**
 *    ここが LCP（最大要素の表示）になるページでは、文字を隠して始めると
 *    LCP の時計が動き出しを待ち、PSI の点が落ちる。
 *    ＝運用の決まりごと「最初の画面の文字を透明から出さない」
 *    ⇒ この部品は **2画面目以降の節見出し専用**。Hero の見出しは素の <h1> のまま。
 *
 * 🔴 なぜ GSAP の SplitText を使わないのか＝
 *    SplitText は出来上がった見出しの DOM を**後から作り替える**。
 *    React は自分が書いた DOM を前提に次の更新を当てるので、
 *    差し替えられると書き込み先を見失う恐れがある。
 *    ⇒ **文字の分割は JSX 側でやる**（＝サーバが描画した時点で span が並んでいる）。
 *      React が最初から所有しているので、誰も DOM を横取りしない。
 *      おまけに **プラグインが1つ増えない**（速度を売る画面なので、載せる物は減らす）。
 *
 * 🔴 なぜ CSS に初期位置を書かないのか＝
 *    CSS で隠すと、JS が落ちた端末で見出しが**永久に消える**。
 *    隠すのは「これから動かせる」と確かめた後（gsap.set）だけにする。
 *    ⇒ 何も起きなければ、ただの読める見出しとして残る（壊れ方を軽いほうに倒す）。
 *
 * 🔴 なぜ単語ではなく1文字ずつか＝日本語には分かち書きが無く、
 *    単語単位で切ると「切れ目が無い1かたまり」になって動きが出ない。
 *    ただし **英数字の連なりは1かたまりに保つ**（`Next.js` が N/e/x/t…と散ると読みにくい）。
 */
export default function RevealHeading({
  text,
  as: Tag = "h2",
  className,
}: {
  text: string;
  as?: "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 動きが苦手な設定の人には、GSAP を1バイトも読み込まない（＝最初から出た状態）
    if (prefersReducedMotion()) return;

    let cleanup = () => {};
    let cancelled = false;

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !ref.current) return;
        const chars = ref.current.querySelectorAll<HTMLElement>(
          `.${styles.char}`,
        );
        if (!chars.length) return;

        // ここで初めて隠す（上のコメントの理由）
        gsap.set(chars, { yPercent: 118 });

        const tween = gsap.to(chars, {
          yPercent: 0,
          duration: 0.62,
          ease: "power3.out",
          // 🔴 1文字ごとの遅れは 26ms。40ms を超えると長い見出しで
          //    最後の文字が着くまでに1秒以上かかり、読み始めを待たせる。
          stagger: 0.026,
          scrollTrigger: {
            trigger: ref.current,
            // 見出しが画面の下から 15% 入った所で始める。
            // "top bottom"（触れた瞬間）だと、まだ目が向いていない所で終わってしまう。
            start: "top 85%",
            // 🔴 一度だけ。戻るたびに再生すると、読み返すたびに文字が踊って鬱陶しい。
            once: true,
          },
        });

        cleanup = () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          // 念のため、消える前に見える状態へ戻す
          gsap.set(chars, { clearProps: "transform" });
          ScrollTrigger.refresh();
        };
      })
      .catch(() => {
        /* GSAP が来なくても見出しは読める状態のまま＝何もしない */
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  /* 英数字・記号の連なりは割らずに1かたまりにする。
     例＝「Next.js の実装」→ ["Next.js", " ", "の", "実", "装"] */
  const pieces = text.match(/[A-Za-z0-9./+#-]+|\s|[\s\S]/g) ?? [];

  return (
    /* 🔴 aria-label で見出しの文を1本に戻している。
       これが無いと、読み上げソフトは span に割れた文字を1つずつ読み、
       「せ・い・さ・く」と区切って発音する（動きのために中身を割った副作用）。
       中の span は aria-hidden にして、読まれるのは label の1本だけにする。 */
    <Tag className={className} ref={ref} aria-label={text}>
      {/* 見出し全体を1つの箱で切る。箱が無いと、押し上げる前の文字が上の行にはみ出す */}
      <span className={styles.charLine} aria-hidden="true">
        {pieces.map((p, i) =>
          p === " " ? (
            // 空白は動かさない（動かすと語間がガタつく）
            <span key={i}> </span>
          ) : (
            <span key={i} className={styles.char}>
              {p}
            </span>
          ),
        )}
      </span>
    </Tag>
  );
}
