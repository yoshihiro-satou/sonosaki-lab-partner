"use client";

import { useEffect, useRef } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/gsap-lazy";
import styles from "@/app/partner/partner.module.css";

/** 受け取りから納品までの4段。文言はここだけに置く（図と説明がずれないように） */
const STEPS = [
  { label: "受け取り", sub: "デザイン / 既存リポ" },
  { label: "実装", sub: "ブランチを切って進める" },
  { label: "確認", sub: "PR + 実機 + 速度" },
  { label: "納品", sub: "マージ可能な状態で" },
] as const;

const ARIA = `進め方は4段階：${STEPS.map((s) => `${s.label}（${s.sub}）`).join("、")}`;

/**
 * 進め方を線画で見せる図。視界に入ると、線が引かれていく。
 *
 * 🔴 なぜ画像（PNG/JPG）ではなく SVG なのか＝
 *    ①**転送量がほぼ0**（この図で約 2KB・画像なら 40〜80KB）。
 *      このページは速度そのものを売りにしているので、飾りで重くしたら主張が崩れる。
 *    ②ベクタなので、どんな画面の密度でも線が滲まない。
 *    ③**文字が本物のテキスト**＝検索にも読み上げにも乗る（画像の中の字は乗らない）。
 *
 * 🔴🔴 なぜ横組みと縦組みの2つを描いているのか＝**SVG は折り返さないから。**
 *    SVG は viewBox ごと拡大縮小される＝**幅が半分になれば文字も半分になる。**
 *    横一列（viewBox 幅 920）のままスマホに出すと、実測で **13px の字が 4.4px** まで
 *    潰れて読めなくなった（2026-09-22 に実画面で計測）。
 *    HTML なら折り返して助かる所が、SVG では黙って潰れる。
 *    ⇒ 狭い画面用に**縦組みの viewBox（幅 320）を別に用意**して、CSS で出し分ける。
 *      幅 350px の端末で 320 → 350 の拡大になるので、13px は 14.2px として出る。
 *    📌 **文言は STEPS 1か所**なので、2つ描いても中身がずれることはない。
 *
 * 🔴 なぜ stroke-dasharray で描くのか＝
 *    「線の長さ」と「線の間の空白」を線の全長と同じ値にすると、線は完全に消える。
 *    そこから空白（dashoffset）を 0 へ動かすと、**引かれていくように見える**。
 *    要素を足したり消したりしないので、途中で画面が組み直る（＝ガタつく）ことがない。
 *
 * 🔴 なぜ全長を getTotalLength() で測るのか＝
 *    パスの長さを手で数字に書くと、線の形を少し直しただけで**動きが合わなくなる**
 *    （途中で止まる／一瞬で終わる）。実物から測れば、形を変えても勝手に追従する。
 */
export default function ProcessDiagram() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (prefersReducedMotion()) return; // 最初から引かれた状態で見せる

    let cleanup = () => {};
    let cancelled = false;

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled || !ref.current) return;

        /* 🔴 表示されているほうの SVG だけを動かす。
           display:none の SVG で getTotalLength() を呼ぶと 0 が返り、
           dasharray が 0 になって**線が最初から全部 見えている状態**で固まる。
           （= 画面幅によって「動かない日」が出る、再現しにくい不具合になる） */
        const visible = [...ref.current.querySelectorAll("svg")].find(
          (s) => s.getClientRects().length > 0,
        );
        if (!visible) return;

        const lines = visible.querySelectorAll<SVGPathElement>(`.${styles.line}`);
        const boxes = visible.querySelectorAll<SVGGElement>("[data-step]");
        if (!lines.length) return;

        lines.forEach((l) => {
          const len = l.getTotalLength();
          gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(boxes, { opacity: 0.25 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: visible, start: "top 78%", once: true },
        });
        // 線を引く → その先の箱が立つ、を繰り返す。
        // 箱を先に出すと「順番に進む工程」に見えず、ただ並んでいるだけになる。
        tl.to(boxes[0], { opacity: 1, duration: 0.3 }, 0);
        lines.forEach((l, i) => {
          tl.to(
            l,
            { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" },
            i * 0.34,
          ).to(boxes[i + 1], { opacity: 1, duration: 0.3 }, i * 0.34 + 0.32);
        });

        cleanup = () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(lines, { clearProps: "all" });
          gsap.set(boxes, { clearProps: "opacity" });
          ScrollTrigger.refresh();
        };
      })
      .catch(() => {
        /* 来なければ引かれた状態のまま＝図としては完成している */
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={ref}>
      <WideDiagram />
      <TallDiagram />
    </div>
  );
}

/** 横一列（広い画面用）。座標は式から出す＝段を増減しても手で数字を直さない */
function WideDiagram() {
  const W = 920;
  /* 🔴 92 は「箱の下端 76 ＋ 余白 16」。
     150 にしていたら、実画面で図の下に 74px の空白が出た（2026-09-22 実測）。
     SVG は viewBox の比率のまま拡大されるので、**使っていない高さも一緒に伸びる。** */
  const H = 92;
  const boxW = 176;
  const gap = (W - boxW * STEPS.length) / (STEPS.length - 1);
  const x = (i: number) => i * (boxW + gap);

  return (
    <svg
      className={`${styles.diagram} ${styles.diagramWide}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      /* 🔴 図の意味を1文で持たせる。読み上げソフトには線も箱も伝わらないので、
            「見なくても同じ情報が取れる」状態をここで作る。 */
      aria-label={ARIA}
    >
      {STEPS.slice(0, -1).map((_, i) => (
        <path
          key={i}
          className={styles.line}
          d={`M ${x(i) + boxW + 8} 46 L ${x(i + 1) - 8} 46`}
        />
      ))}
      {STEPS.map((s, i) => (
        <g key={s.label} data-step={i}>
          <rect className={styles.box} x={x(i)} y={16} width={boxW} height={60} rx={8} />
          <text className={styles.label} x={x(i) + 16} y={42}>
            {s.label}
          </text>
          <text className={styles.sub} x={x(i) + 16} y={62}>
            {s.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** 縦積み（狭い画面用）。viewBox を 320 幅にして、字が潰れない倍率に保つ */
function TallDiagram() {
  const W = 320;
  const boxH = 58;
  const gap = 22;
  const H = STEPS.length * boxH + (STEPS.length - 1) * gap;
  const y = (i: number) => i * (boxH + gap);

  return (
    <svg
      className={`${styles.diagram} ${styles.diagramTall}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      // 🔴 読み上げには2つとも見えるので、こちらは隠す（同じ文を二度 読ませない）
      aria-hidden="true"
    >
      {STEPS.slice(0, -1).map((_, i) => (
        <path
          key={i}
          className={styles.line}
          d={`M 22 ${y(i) + boxH + 5} L 22 ${y(i + 1) - 5}`}
        />
      ))}
      {STEPS.map((s, i) => (
        <g key={s.label} data-step={i}>
          <rect className={styles.box} x={0} y={y(i)} width={W} height={boxH} rx={8} />
          <text className={styles.label} x={16} y={y(i) + 25}>
            {s.label}
          </text>
          <text className={styles.sub} x={16} y={y(i) + 44}>
            {s.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}
