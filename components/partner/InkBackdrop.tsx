import styles from "@/app/partner/partner.module.css";

/**
 * 地の絵＝**絵具を水に落としたときの広がり。**
 *
 * 🔴 なぜ画像ではないのか＝このページは表示速度そのものを売っている。
 *    同じ絵を JPG で出すと 150〜400KB、WebP でも 60KB 前後。
 *    ここは **SVG で約 2KB**（gzip 後はもっと小さい）。
 *    速度を主張する画面の地に、本文より重い飾りは置けない。
 *
 * 🔴 どうやって「絵具」にしているか＝
 *    ① なめらかな楕円をいくつか重ねる（これだけだと、ただのぼんやりした丸）
 *    ② `feTurbulence` で雲状のノイズを作る
 *    ③ `feDisplacementMap` で、そのノイズのぶんだけ楕円の輪郭を**押しずらす**
 *       → 縁が絵具の筋のように裂ける。これが「水に溶けた」感じの正体。
 *    ④ `feGaussianBlur` で全体を水ににじませる
 *    ⇒ 同じことを手で描こうとすると、パスが数百個になる。ノイズに崩させるほうが軽い。
 *
 * 🔴 **動かさない。** フィルタは描くのが重い処理なので、1回 描いて終わりにする。
 *    アニメーションさせると毎フレーム 計算し直すことになり、
 *    スクロールのなめらかさ（このページの見せ場）を自分で潰す。
 *
 * 🔴 `position: fixed` ＋ `pointer-events: none`＝
 *    スクロールしても地が動かない（水の中を降りていくように見える）。
 *    クリックは全部 下の本文へ抜ける。
 *
 * ♿ 読み上げには `aria-hidden`。意味を持たない絵なので、読ませるものが無い。
 */
export default function InkBackdrop() {
  return (
    <svg
      className={styles.ink}
      viewBox="0 0 1200 1600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* 輪郭を絵具の筋に崩すフィルタ。
            baseFrequency が小さいほど大きなうねり、大きいほど細かい毛羽になる。
            .009 は「水に落として数秒」くらいの大きさのうねり。 */}
        <filter id="ink-bleed" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009"
            numOctaves="4"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="150"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          {/* 崩したあとに にじませる。順番が逆だと、ぼかしてから崩すことになって
              ただの霧になり、絵具の筋が残らない。 */}
          <feGaussianBlur stdDeviation="22" />
        </filter>

        {/* 細かい毛羽だけの層。上の大きなうねりと重ねると、
            「濃い芯」と「water に溶けた縁」の二層に見える。 */}
        <filter id="ink-fine" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.028"
            numOctaves="3"
            seed="19"
            result="n2"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n2"
            scale="60"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="10" />
        </filter>

        {/* 芯が濃く、縁へ行くほど薄れる＝水に溶けていく濃度。
            単色で塗ると「切り絵」に見えて、液体にならない。 */}
        <radialGradient id="bloom-blue">
          <stop offset="0%" stopColor="#3d6fe0" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#2b57bd" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#2b57bd" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bloom-deep">
          <stop offset="0%" stopColor="#081230" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#0a1838" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0a1838" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bloom-gold">
          {/* 金は**ごく薄く**。ここを濃くすると、差し色が地に負けて
              取っ手やボタンが目立たなくなる（強くする所は1つ、の原則） */}
          <stop offset="0%" stopColor="#f5c445" stopOpacity="0.30" />
          <stop offset="70%" stopColor="#e9a802" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#e9a802" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 大きなうねりの層＝水の中で広がった本体 */}
      <g filter="url(#ink-bleed)">
        <ellipse cx="240" cy="230" rx="430" ry="330" fill="url(#bloom-blue)" />
        <ellipse cx="980" cy="620" rx="380" ry="420" fill="url(#bloom-deep)" />
        <ellipse cx="420" cy="1080" rx="460" ry="360" fill="url(#bloom-blue)" />
        <ellipse cx="1060" cy="1420" rx="340" ry="300" fill="url(#bloom-deep)" />
      </g>

      {/* 細かい毛羽の層＝縁でほどけた筋 */}
      <g filter="url(#ink-fine)">
        <ellipse cx="880" cy="180" rx="230" ry="180" fill="url(#bloom-gold)" />
        <ellipse cx="150" cy="720" rx="200" ry="240" fill="url(#bloom-gold)" />
        <ellipse cx="760" cy="1240" rx="260" ry="200" fill="url(#bloom-blue)" />
      </g>
    </svg>
  );
}
