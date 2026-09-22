import type { Metadata } from "next";
import styles from "./partner.module.css";
import SourceNote from "@/components/partner/SourceNote";
import ViewportFrame from "@/components/partner/ViewportFrame";
import RevealHeading from "@/components/partner/RevealHeading";
import ProcessDiagram from "@/components/partner/ProcessDiagram";
import WorkSwitch, { type Work } from "@/components/partner/WorkSwitch";
import RevealPanel from "@/components/partner/RevealPanel";

/**
 * 制作会社さま向けページ（sonosaki-lab.com/partner）
 *
 * 🔴 このページに出す数字は、社内の台帳に「測った日・測り方・回数つき」で
 *    記録したものからしか取らない。思い出しで書かない。
 * ⚠️ 他ページで測った速度の値を、このページの値として流用しない。
 *    ページが違えば読み込むものが違うので、別の数字になる。
 *    このページの速度は、公開後にこのページ自身で測り直して入れる。
 */
export const metadata: Metadata = {
  /* 🔴 屋号を書かない。ルートの layout に `template: "%s｜Sonosaki Lab."` があるので、
     ここに入れると「実装パートナーとして｜Sonosaki Lab.｜Sonosaki Lab.」と二重になる
     （2026-09-22 に実画面のタブで見つけた）。 */
  title: "実装パートナーとして",
  description:
    "Web制作会社さま向けに、フロントエンド実装の下請けを承ります。Next.js・TypeScript・Cloudflare Workers。1ページ分の実装から 税込 ¥30,000。",
  alternates: { canonical: "https://sonosaki-lab.com/partner" },
};

/** 事例＝自社で公開中のものだけ。作っていない物は載せない */
const WORKS: Work[] = [
  {
    id: "neat",
    tab: "neat-please.com",
    title: "ウイスキーの比較メディア（企画・実装・運用とも自分）",
    body: "記事とカタログを持つ多ページ構成。Next.js App Router を Cloudflare Workers へ載せ、外部 API（楽天）のデータをページに組み込んでいます。ページ数が増えても崩れない作りと、日本語の見出し書体をどう軽くするかが主な課題でした。",
    facts: [
      { k: "運用ページ数", v: "307ページ（2026-09-09 サイトマップ実測）" },
      {
        k: "検索1ページ目",
        v: "25キーワード（直近28日・表示5回以上・平均10位以内／2026-09-09 時点）",
      },
      {
        k: "見出し書体の削減",
        v: "643KB・46ファイル → 147KB・2ファイル（サブセット化・2026-08-28 実測）",
      },
      { k: "構成", v: "Next.js App Router / TypeScript / Cloudflare Workers / 楽天API" },
    ],
  },
  {
    id: "lp",
    tab: "sonosaki-lab.com",
    title: "この LP 自体（デザインから実装まで）",
    body: "いま開いているサイトの本体です。慣性スクロール（Lenis）と GSAP の連動、スクロールに追従する演出、フォームの計測までを、速度を落とさない範囲で載せています。演出のライブラリは初期表示には乗せず、手が空いてから読み込む作りです。",
    facts: [
      { k: "動き", v: "Lenis + GSAP（ScrollTrigger / Flip）を遅延読み込み" },
      { k: "配信", v: "Cloudflare Workers（@opennextjs/cloudflare）" },
      {
        k: "動きを切る設定",
        v: "prefers-reduced-motion のときはライブラリごと読み込まない",
      },
      { k: "公開", v: "2026-09-13（段階公開）" },
    ],
  },
  {
    id: "this",
    tab: "このページ",
    title: "いま見ているページ",
    body: "上の枠のドラッグ、この切り替え（View Transitions）、下の線画、節見出しの立ち上がり。どれも画像を1枚も使わずに作っています。ソースには「なぜそうしたか」のコメントを本番まで残してあるので、View Source でそのまま読めます。",
    facts: [
      { k: "画像", v: "0枚（線と組み方と動きだけ）" },
      { k: "日本語 Web フォント", v: "0KB（OS 標準のゴシックのみ）" },
      { k: "枠の組み替え", v: "CSS Container Queries（画面幅ではなく枠幅で判定）" },
      { k: "切り替え", v: "View Transitions API（非対応ブラウザは素の切り替え）" },
    ],
  },
];

export default function PartnerPage() {
  return (
    <main className={styles.page}>
      <SourceNote
        title="このページについて"
        lines={[
          "Sonosaki Lab.（佐藤 善裕）／ 制作会社さま向けの実装パートナー案内。",
          "",
          "ご覧のとおり、本番のソースにコメントを残しています。理由は2つ。",
          "1. 読み手が実装者を審査する側なので、ソースも見られる前提で書いている。",
          "2. 画面の説明より、作り方の判断のほうが実力が出ると考えているため。",
          "",
          "Next.js の本番ビルドは JSX のコメントを落とし CSS も minify するので、",
          "普通に書いたコメントは1行も残りません。ここはサーバが描画時に作る",
          "文字列として出しているため、圧縮を通り抜けています（約1〜2KB）。",
          "ビルド全体の minify を切る手は、転送量が増えて速度が落ちるので採っていません。",
          "",
          "全文 → https://github.com/yoshihiro-satou/sonosaki-lab-partner",
        ]}
      />

      {/* ═══ 最初の画面 ═══ */}
      <section className={styles.hero}>
        {/* 🔴 この見出しには動きを掛けない。ここが LCP になるため（下のコメント参照） */}
        <SourceNote
          title="最初の見出しに動きを掛けていない理由"
          lines={[
            "この h1 が LCP（Largest Contentful Paint＝最大要素の表示）になります。",
            "一文字ずつ出す演出は opacity:0 か transform から始めるので、",
            "LCP の計測が「動き終わり」を待ち、モバイルのスコアが素直に落ちます。",
            "",
            "そこで、文字の立ち上がりは 2画面目以降の節見出しだけに掛けています。",
            "演出を入れるかどうかではなく、どこに入れないかを決めるほうが効きます。",
          ]}
        />
        <h1 className={styles.heroTitle}>
          実装だけ、
          <br />
          <em>引き受けます。</em>
        </h1>
        <p className={styles.heroLead}>
          Web 制作会社さま向けのページです。デザインとお客様対応はそちらに置いたまま、
          フロントエンドの実装だけを外に出したいときの受け皿として作りました。
          下の枠は、右の取っ手を引くと本当に組み直ります。
        </p>

        <SourceNote
          title="幅を引ける枠：なぜ ResizeObserver ではなく pointer イベントか"
          lines={[
            "枠の幅は「人が決めた入力値」で、監視する対象ではありません。",
            "ResizeObserver で追うと、指が動く → 枠が変わる → 観測が発火 → 再描画、と",
            "1フレーム余分に挟まり、枠が指から遅れて付いてきます。",
            "このページでは、その遅れがそのまま「実装が重い人」の印象になります。",
            "",
            "もう1つ。中のカードはメディアクエリではなく Container Queries で",
            "組み替えています。画面幅で判定すると、枠を引いても中身が変わらず、",
            "「レスポンシブを確かめてもらう」という仕掛けが成立しないためです。",
          ]}
        />
        <ViewportFrame>
          <div className={`${styles.card} ${styles.cardWide}`}>
            <div>
              <h3>この中身は枠の幅で組み替わります</h3>
              <p>
                画面の幅ではありません。枠を 34rem・52rem で越えるたびに列が増え、
                先頭のカードは横並びに変わります。ブラウザの窓は動かしていません。
              </p>
            </div>
          </div>
          <div className={styles.card}>
            <h3>断点は 2つだけ</h3>
            <p>増やすほど確認の手間が増えるので、必要な所にしか置きません。</p>
          </div>
          <div className={styles.card}>
            <h3>画像は 0枚</h3>
            <p>線と余白と組み方で密度を出しています。転送量が増えないため。</p>
          </div>
          <div className={styles.card}>
            <h3>キーボードでも動きます</h3>
            <p>取っ手に焦点を当てて左右キー。Shift を押すと大きく動きます。</p>
          </div>
        </ViewportFrame>
      </section>

      {/* ═══ できること・できないこと ═══ */}
      <section className={styles.section}>
        <RevealHeading className={styles.sectionTitle} text="お渡しできる範囲" />
        <p className={styles.sectionLead}>
          できないことを先に書きます。ここを曖昧にしたまま始めると、
          結局そちらの手間が増えるためです。
        </p>

        <SourceNote
          title="節見出しの一文字ずつの立ち上がりについて"
          lines={[
            "GSAP の SplitText は使っていません。あれは出来上がった見出しの DOM を",
            "後から作り替えるので、React が自分の書き込み先を見失う恐れがあります。",
            "代わりに、文字の分割は JSX 側（サーバ描画の時点）で済ませています。",
            "React が最初から所有している DOM なので、誰も横取りしません。",
            "プラグインが1つ減るという副産物もあります。",
            "",
            "初期状態（隠れた位置）は CSS に書かず、JS が動くと確かめてから付けます。",
            "CSS で隠すと、JS が落ちた端末で見出しが永久に消えるためです。",
            "壊れるときは、軽いほうに壊れてほしい。",
          ]}
        />

        <RevealPanel className={styles.cols}>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>引き受けます</h3>
            <ul>
              <li className={styles.revealItem}>
                <b>デザインからの実装</b>（Figma・XD・PSD・画像いずれでも）
              </li>
              <li className={styles.revealItem}>
                <b>既存リポジトリへの機能追加・改修</b>
              </li>
              <li className={styles.revealItem}>
                <b>Next.js（App Router）・TypeScript・React</b> での構築
              </li>
              <li className={styles.revealItem}>
                <b>Cloudflare Workers への配信</b>（@opennextjs/cloudflare）
              </li>
              <li className={styles.revealItem}>
                <b>動きの実装</b>（GSAP・Lenis・CSS アニメーション・View Transitions）
              </li>
              <li className={styles.revealItem}>
                <b>表示速度の改善</b>（書体・画像・読み込み順・計測まで）
              </li>
              <li className={styles.revealItem}>
                <b>レスポンシブ対応と実機確認</b>
              </li>
            </ul>
          </div>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>お引き受けしません</h3>
            <ul>
              <li className={styles.revealItem}>
                <b>エンドのお客様との打ち合わせ・窓口対応</b>（元請けさま持ちが前提）
              </li>
              <li className={styles.revealItem}>
                <b>ディレクション・進行管理</b>
              </li>
              <li className={styles.revealItem}>
                <b>デザイン制作そのもの</b>（実装のための調整は行います）
              </li>
              <li className={styles.revealItem}>
                <b>検索順位の保証</b>（できると言える性質のものではないため）
              </li>
              <li className={styles.revealItem}>
                <b>上記を含む依頼を、この金額で受けること</b>
                。範囲が変わるなら金額も別に出します
              </li>
            </ul>
          </div>
        </RevealPanel>
      </section>

      {/* ═══ 進め方 ═══ */}
      <section className={styles.section}>
        <RevealHeading className={styles.sectionTitle} text="進め方" />
        <p className={styles.sectionLead}>
          Git で資材を管理し、ブランチを切って進めます。レビューできる形でお渡しするので、
          そちらの基準でご確認いただけます。
        </p>

        <SourceNote
          title="この図が SVG である理由"
          lines={[
            "画像で作ると 40〜80KB、この SVG は約 1.5KB です。",
            "速度そのものを売りにしているページで、飾りに数十 KB は払えません。",
            "",
            "線は stroke-dasharray で引いています。線の長さと空白を同じ値にすると",
            "線が完全に消え、そこから空白を 0 へ動かすと左から引かれて見えます。",
            "要素を足したり消したりしないので、途中で画面が組み直りません。",
            "",
            "全長は getTotalLength() で実物から測っています。手で数字を書くと、",
            "線の形を少し直しただけで動きが途中で止まります。",
          ]}
        />
        <ProcessDiagram />

        <RevealPanel className={`${styles.cols} ${styles.colsSpaced}`}>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>資材の扱い</h3>
            <ul>
              <li className={styles.revealItem}>
                <b>作業はブランチを切って</b>行い、main へ直接 push しません
              </li>
              <li className={styles.revealItem}>
                <b>Pull Request の形でお渡し</b>します（差分をそちらで確認できます）
              </li>
              <li className={styles.revealItem}>
                コミットは<b>意図が分かる粒度</b>で分け、なぜ変えたかを本文に書きます
              </li>
              <li className={styles.revealItem}>
                そちらの既存の<b>運用ルール（ブランチ名・レビュー体制・CI）に合わせます</b>
              </li>
            </ul>
          </div>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>お渡し前に必ず見ること</h3>
            <ul>
              <li className={styles.revealItem}>
                <b>型チェックと Lint</b>をエラー 0 で通す
              </li>
              <li className={styles.revealItem}>
                <b>実機での表示確認</b>（狭い端末を含む）
              </li>
              <li className={styles.revealItem}>
                <b>PageSpeed Insights</b> で速度を測る。
                単発では判定せず、間隔を空けて複数回の中央値で見ます
              </li>
              <li className={styles.revealItem}>
                <b>動きを切る設定（prefers-reduced-motion）</b>での見え方
              </li>
            </ul>
          </div>
        </RevealPanel>
      </section>

      {/* ═══ 事例 ═══ */}
      <section className={styles.section}>
        <RevealHeading className={styles.sectionTitle} text="作ったもの" />
        <p className={styles.sectionLead}>
          公開中で、いま測れるものだけを挙げます。
          いずれも自社のサイトです（受注案件は守秘のため掲載していません）。
        </p>

        <SourceNote
          title="切り替えに View Transitions を使っている理由"
          lines={[
            "CSS のフェードは「古い絵が消えて新しい絵が出る」だけで、間がつながりません。",
            "View Transitions はブラウザが前後の絵を撮って補間するので、",
            "枠や見出しが同じ物として移動します。押すと違いが分かります。",
            "",
            "React と組み合わせるときの注意が1つ。startViewTransition は渡した関数が",
            "終わった時点の DOM を「後の絵」として撮ります。React の更新は既定では",
            "後回しなので、普通に setState するとまだ変わっていない DOM が撮られ、",
            "何も動きません。flushSync でその場で描き切ってから返しています。",
            "",
            "startViewTransition が無いブラウザでは呼ばずに素の setState へ落とします。",
            "呼べば例外で落ちて、タブの切り替え自体が動かなくなるためです。",
          ]}
        />
        <WorkSwitch works={WORKS} />
      </section>

      {/* ═══ 条件 ═══ */}
      <section className={styles.section}>
        <RevealHeading className={styles.sectionTitle} text="条件" />
        <RevealPanel className={styles.cols}>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>金額</h3>
            <ul>
              <li className={styles.revealItem}>
                <b>1ページ分の実装から 税込 ¥30,000</b>
              </li>
              <li className={styles.revealItem}>
                <b>それより小さい単位</b>（部品ひとつ・一画面だけ など）のご依頼は、
                範囲を伺って<b>別途お見積り</b>します
              </li>
              <li className={styles.revealItem}>
                打ち合わせ・ディレクション・お客様対応が入る場合も、
                <b>範囲を整理したうえで別途お見積り</b>します
              </li>
              <li className={styles.revealItem}>値引きはしていません。渡す範囲を変えて調整します</li>
            </ul>
          </div>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>体制</h3>
            <ul>
              <li className={styles.revealItem}>
                <b>一人で請けています</b>（宮城県・リモート）。再委託はしません
              </li>
              <li className={styles.revealItem}>NDA・業務委託契約はそちらの書式で構いません</li>
              <li className={styles.revealItem}>
                <b>事業としての開始は 2026年7月</b>です。
                年数では他の方に及びませんので、
                <b>公開中の実物と、いま測れる数字でご判断ください</b>
              </li>
            </ul>
          </div>
        </RevealPanel>

        <p style={{ marginTop: 32 }}>
          <a className={styles.cta} href="mailto:yoshihirock0710@gmail.com">
            実装の相談をする
          </a>
        </p>

        <p className={styles.sourceLink}>
          <span aria-hidden="true">{"</>"}</span>
          このページのソース：
          <a
            href="https://github.com/yoshihiro-satou/sonosaki-lab-partner"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/yoshihiro-satou/sonosaki-lab-partner
          </a>
        </p>
      </section>

      <footer className={styles.foot}>
        佐藤 善裕（屋号：Sonosaki Lab.）／ 宮城県
        <br />
        掲載している数字は、測った日と測り方を添えています。
      </footer>
    </main>
  );
}
