import type { Metadata } from "next";
import styles from "./partner.module.css";
import SourceNote from "@/components/partner/SourceNote";
import ViewportFrame from "@/components/partner/ViewportFrame";
import RevealHeading from "@/components/partner/RevealHeading";
import ProcessDiagram from "@/components/partner/ProcessDiagram";
import WorkSwitch, { type Work } from "@/components/partner/WorkSwitch";
import RevealPanel from "@/components/partner/RevealPanel";
import InkBackdrop from "@/components/partner/InkBackdrop";
import { Phrased, phrase } from "@/components/phrase";

/**
 * 制作会社さま向けページ（sonosaki-lab.com/partner）
 *
 * 🔴 このページに出す数字は、社内の台帳に「測った日・測り方・回数つき」で
 *    記録したものからしか取らない。思い出しで書かない。
 * ⚠️ 他ページで測った速度の値を、このページの値として流用しない。
 *    ページが違えば読み込むものが違うので、別の数字になる。
 */
export const metadata: Metadata = {
  /* ルートの layout に `template: "%s｜Sonosaki Lab."` があるので屋号は書かない
     （書くと「…｜Sonosaki Lab.｜Sonosaki Lab.」と二重になる） */
  title: "実装パートナーとして",
  description:
    "Web制作会社・デザイン会社さま向けのフロントエンド実装パートナーです。既存サイトの改修、アニメーション、レスポンシブ対応まで。1ページ分の実装 税込 ¥30,000〜。",
  alternates: { canonical: "https://sonosaki-lab.com/partner" },
  /* 応募文で手渡すだけのページ＝検索には出さない（2026-09-23 社長決裁）。
     リンクはたどってよいので follow は残す */
  robots: { index: false, follow: true },
};

/** よくある依頼の形。ここは「できること」ではなく「持ち込まれる場面」で書く */
const CASES = [
  {
    when: "既存サイトに動きを足したい",
    then: "GSAP・CSS アニメーション・View Transitions で実装します。",
  },
  {
    when: "スマホだけ崩れている",
    then: "既存のコードを読んで、原因のところだけ直します。",
  },
  {
    when: "Next.js の案件で実装の手が足りない",
    then: "フロントエンドの担当として入ります。",
  },
  {
    when: "納品前に表示速度を上げておきたい",
    then: "実機と PageSpeed Insights で測りながら詰めます。",
  },
] as const;

/* 広告運用の会社さま向け。🔴 「広告用 LP の実績」は名乗らない
   （広告の飛び先として納めた LP はまだ無い）。書くのは、受託の1件で実際にやったことだけ。 */
const AD_CASES = [
  {
    when: "原稿とデザインはあるのに、LP を組む手が空いていない",
    then: "支給のデザインと原稿で、1ページ分を実装します。税込 ¥30,000 から。",
  },
  {
    when: "広告から来た人が、LP を開き切る前に離れている気がする",
    then: "表示速度を測って、重さの原因のところから直します。",
  },
  {
    when: "コンバージョンの計測が合っているか自信がない",
    then: "GA4・GTM・Meta ピクセルのタグが、押したときに本当に記録されるかを確かめて直します。",
  },
] as const;

/* 🔴 受託か自社かを、それぞれの中で必ず名乗る。
   数が少ないのを隠すために曖昧にすると、載っている数字まで疑われる。 */
const WORKS: Work<string>[] = [
  {
    id: "client",
    tab: "受託",
    kind: "受託案件（2026年8月・ココナラ経由）",
    title: "ペライチで作られた LP の表示速度改善",
    body: "問い合わせは来ているのにページが重い、という相談でした。作り直さず、いまのページのまま軽くしています。お客様のお名前と URL は非公開です。",
    did: [
      "ページが送るデータ量を約 69% 削減",
      "画像の書き出しと、読み込む順番の見直し",
      "前後を同じ条件で4回ずつ測って確認",
      "作業報告書と、直した箇所の一覧をお渡し",
    ],
    soYouCan:
      "「作り直すほどではないが重い」という既存サイトの相談を、そのまま回していただけます。",
  },
  {
    id: "neat",
    tab: "自社開発",
    kind: "自社メディア（企画・実装・運用とも自分）",
    title: "ウイスキーの比較メディア neat-please.com",
    body: "記事とカタログで 307 ページあります。ページが増え続ける前提で、あとから破綻しない作りにするのが主な仕事でした。",
    did: [
      "Next.js App Router で構築し、Cloudflare Workers へ配信",
      "楽天 API のデータをページに組み込み",
      "ページ数が増えても崩れない部品の設計",
      "日本語の見出し書体をサブセット化（643KB・46ファイル → 147KB・2ファイル）",
    ],
    soYouCan:
      "ページ数の多いサイトでも、あとから破綻しない実装をお任せいただけます。",
  },
  {
    id: "lp",
    tab: "自主制作",
    kind: "自社サイト（デザインから実装まで）",
    title: "Sonosaki Lab. 公式サイト",
    body: "いま開いているサイトの本体です。動きを載せながら表示速度を落とさない、という条件を自分に課して作りました。",
    did: [
      "Lenis の慣性スクロールと GSAP の連動",
      "スクロールに追従する演出と、フォームの計測",
      "演出のライブラリは初期表示に乗せず、手が空いてから読み込む",
      "動きを切る設定の人には、ライブラリごと読み込まない",
    ],
    soYouCan:
      "「動きは欲しいが重くしたくない」案件で、どこまで載せられるかの判断ごとお任せいただけます。",
  },
];

export default function PartnerPage() {
  return (
    <Phrased>
    <main className={styles.page}>
      <InkBackdrop />

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
        <SourceNote
          title="最初の画面に、幅を引ける枠を置いている理由"
          lines={[
            "「レスポンシブ対応できます」と書くより、枠を引いて中が組み直るのを",
            "見てもらうほうが早いからです。主張ではなく挙動で答えます。",
            "",
            "枠の幅は「人が決めた入力値」で、監視する対象ではありません。",
            "ResizeObserver で追うと、指が動く → 枠が変わる → 観測が発火 → 再描画、と",
            "1フレーム余分に挟まり、枠が指から遅れて付いてきます。",
            "そこで pointer イベントの座標から幅を出し、同じフレームで反映しています。",
            "",
            "中のカードはメディアクエリではなく Container Queries で組み替えています。",
            "画面幅で判定すると、枠を引いても中身が変わらず、仕掛けが成立しません。",
          ]}
        />
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLead}>デザインは、御社のまま。</span>
            {/* 🔴 読点で自分で折る。見出しの最大 116px で10字を1行に置くと 1160px 必要で、
                左の列からはみ出して「こち／らで。」と語の途中で折れる
                （2026-09-22 に 136px で実画面を確認・10-13 に左右2列へ組み替え）。 */}
            実装だけ、
            <br />
            こちらで。
          </h1>
          <p className={styles.heroLead}>
            Web 制作会社・デザイン会社さま向けの、フロントエンド実装パートナーです。
            既存サイトの改修、アニメーション、レスポンシブ対応まで、
            実装の工程をお引き受けします。
          </p>
          {/* 受け取る → 作る → 渡す は順番のある流れ＝並べ方そのものが情報。
              技術名をタグで並べる形にしない（どの画面でも見る形で、何を任せられるかが伝わらない）。 */}
          <dl className={styles.heroFlow}>
            <div>
              <dt>受け取る</dt>
              <dd>Figma などのデザインデータ、既存サイトのリポジトリ</dd>
            </div>
            <div>
              <dt>作る</dt>
              <dd>
                Next.js、React、TypeScript での実装。GSAP と CSS の動き、レスポンシブ、表示速度の調整まで
              </dd>
            </div>
            <div>
              <dt>渡す</dt>
              <dd>そのままマージできる Pull Request と、直した箇所の説明</dd>
            </div>
          </dl>
          <p className={styles.heroActions}>
            <a className={styles.cta} href="mailto:yoshihirock0710@gmail.com">
              実装の相談をする
            </a>
            <a className={styles.heroSub} href="#works">
              作ったものを見る
            </a>
          </p>
        </div>

        <div className={styles.heroDemo}>
          <ViewportFrame>
            {/* 🔴 枠の中は「解説」ではなく「実際のサイトらしい中身」を置く。
               説明文を並べると、デモが技術の講義になる。見せたいのは挙動のほう。
               🔴 最初の画面なので隠してから出す動きは付けない（revealItem を付けない）。
               🔴 カードの見出しは h3 にしない＝見本のサイトの見出しが、このページの目次（h1 の次）に混ざる。 */}
            <div className={`${styles.card} ${styles.cardWide}`}>
              <p className={styles.mockEyebrow}>架空の店舗サイト</p>
              <p className={styles.cardTitle}>髪を切るだけの場所にしない</p>
              <p>駅から歩いて3分。予約は前日まで受け付けています。</p>
            </div>
            <div className={styles.card}>
              <p className={styles.cardTitle}>メニューと料金</p>
              <p>カット ¥4,800／カラー ¥7,200／トリートメント ¥3,000</p>
            </div>
            <div className={styles.card}>
              <p className={styles.cardTitle}>アクセス</p>
              <p>宮城県大崎市◯◯ 1-2-3／水曜定休／10:00〜19:00</p>
            </div>
            <div className={styles.card}>
              <p className={styles.cardTitle}>ご予約</p>
              <p>電話、LINE、フォームのどれでも受け付けています。</p>
            </div>
          </ViewportFrame>
          <p className={styles.demoNote}>
            画面の幅ではなく、<b>枠そのものの幅</b>でレイアウトを切り替えています。
            ブラウザの窓は動かしていません。
          </p>
        </div>
      </section>

      {/* ═══ こんなときに ═══ */}
      <section className={styles.section}>
        <RevealHeading
          className={styles.sectionTitle}
          text="こんなときに|呼んでください"
        />
        <p className={styles.sectionLead}>
          いただいたデザインを、ブラウザで動くところまで持っていく仕事です。
        </p>

        <RevealPanel className={styles.caseList}>
          {CASES.map((c) => (
            <div className={styles.caseItem} key={c.when}>
              <p className={`${styles.caseWhen} ${styles.revealItem}`}>{c.when}</p>
              <p className={`${styles.caseThen} ${styles.revealItem}`}>{c.then}</p>
            </div>
          ))}
        </RevealPanel>
      </section>

      {/* ═══ 広告運用の会社さまへ ═══ */}
      <section className={styles.section}>
        <RevealHeading
          className={styles.sectionTitle}
          text="広告運用の|会社さまへ"
        />
        <p className={styles.sectionLead}>
          LP のデザインと原稿が決まっていれば、実装からお引き受けします。
        </p>

        <RevealPanel className={styles.caseList}>
          {AD_CASES.map((c) => (
            <div className={styles.caseItem} key={c.when}>
              <p className={`${styles.caseWhen} ${styles.revealItem}`}>{c.when}</p>
              <p className={`${styles.caseThen} ${styles.revealItem}`}>{c.then}</p>
            </div>
          ))}
        </RevealPanel>

        <p className={styles.demoNote}>
          広告の飛び先として納めた LP は、まだありません。お受けした1件は、ペライチの LP を軽くして、動いていなかった計測タグを直した仕事です。CVR などの成果はお約束していません。
        </p>
      </section>

      {/* ═══ 作ったもの ═══
          id＝最初の画面の「作ったものを見る」の飛び先 */}
      <section className={styles.section} id="works">
        <RevealHeading className={styles.sectionTitle} text="作ったもの" />
        <p className={styles.sectionLead}>受託か自社かは、それぞれに書いています。</p>

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
        <RevealPanel>
          {/* 切り替えはクライアント部品＝<Phrased> が届かない。渡す文をここ（サーバ）で区切ってから渡す（2026-09-30） */}
          <WorkSwitch
            works={WORKS.map((w) => ({
              ...w,
              kind: phrase(w.kind),
              title: phrase(w.title),
              body: phrase(w.body),
              did: w.did.map((d, i) => phrase(d, i)),
              soYouCan: phrase(w.soYouCan),
            }))}
          />
        </RevealPanel>

        {/* 実績を読み終えた所が、いちばん相談したくなる所。ページの末尾まで待たせない。
            ボタンの名前は最初の画面・末尾と同じにする（同じ動作は同じ名前）。 */}
        <p className={styles.ctaWrap}>
          <span className={styles.ctaNote}>
            デザインか既存のリポジトリを見せていただければ、範囲と金額をお返しします。
          </span>
          <a className={styles.cta} href="mailto:yoshihirock0710@gmail.com">
            実装の相談をする
          </a>
        </p>
      </section>

      {/* ═══ 役割の分け方 ═══ */}
      <section className={styles.section}>
        <RevealHeading className={styles.sectionTitle} text="役割の分け方" />
        <p className={styles.sectionLead}>
          勝手にお客様と話し始めることはありません。窓口は御社のままです。
        </p>

        <SourceNote
          title="節見出しの一文字ずつの立ち上がりについて"
          lines={[
            "GSAP の SplitText は使っていません。あれは出来上がった見出しの DOM を",
            "後から作り替えるので、React が自分の書き込み先を見失う恐れがあります。",
            "代わりに、文字の分割は JSX 側（サーバ描画の時点）で済ませています。",
            "React が最初から所有している DOM なので、誰も横取りしません。",
            "",
            "文字は隠していません。少し下から定位置へ揃えるだけです。",
            "以前は透明や枠の外から出していましたが、スクロールせずに撮った",
            "全体のスクリーンショットでは、見出しも一覧も消えて写りました。",
            "このページは撮られて社内で回されることがあるので、どの瞬間を撮られても",
            "読める作りにしています。ずらす初期位置も CSS には書かず、JS が動くと",
            "確かめてから付けます。壊れるときは、軽いほうに壊れてほしい。",
          ]}
        />

        <RevealPanel className={styles.cols}>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>御社にお願いしたいこと</h3>
            <ul>
              <li className={styles.revealItem}>お客様との窓口</li>
              <li className={styles.revealItem}>デザインの決定</li>
              <li className={styles.revealItem}>ディレクション</li>
              <li className={styles.revealItem}>スケジュールの管理</li>
            </ul>
          </div>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>こちらが担当すること</h3>
            <ul>
              <li className={styles.revealItem}>
                デザインデータ（Figma など）からの実装もお受けします（他社のデザインからの受託は、まだありません）
              </li>
              <li className={styles.revealItem}>既存リポジトリへの機能追加と改修</li>
              <li className={styles.revealItem}>
                WordPress の既存サイトの修正（内容を確認して、お受けできるかをお伝えします。受託の実績はまだありません）
              </li>
              <li className={styles.revealItem}>アニメーションの実装</li>
              <li className={styles.revealItem}>レスポンシブ対応と実機での確認</li>
              <li className={styles.revealItem}>表示速度の改善</li>
            </ul>
          </div>
        </RevealPanel>

        <p className={styles.demoNote}>
          検索順位の保証だけはしていません。約束できる性質のものではないためです。
        </p>
      </section>

      {/* ═══ 納品のしかた ═══ */}
      <section className={styles.section}>
        <RevealHeading
          className={styles.sectionTitle}
          text="御社の開発フローに|戻しやすい形で|渡します"
        />
        <p className={styles.sectionLead}>
          自社のサイトは、ブランチと Pull Request で作っています。
          御社のリポジトリでの渡し方は、決まりを伺ってから合わせます。
        </p>

        <SourceNote
          title="この図が SVG である理由"
          lines={[
            "画像で作ると 40〜80KB、この SVG は約 2KB です。",
            "速度そのものを売りにしているページで、飾りに数十 KB は払えません。",
            "",
            "線は stroke-dasharray で引いています。線の長さと空白を同じ値にすると",
            "線が完全に消え、そこから空白を 0 へ動かすと左から引かれて見えます。",
            "全長は getTotalLength() で実物から測っています。手で数字を書くと、",
            "線の形を少し直しただけで動きが途中で止まります。",
            "",
            "SVG は折り返さないので、幅が半分になれば文字も半分になります。",
            "横一列のままスマホに出したら 13px の字が 4.4px まで潰れました。",
            "狭い画面用に縦組みの viewBox を別に用意して、CSS で出し分けています。",
          ]}
        />
        <ProcessDiagram />

        <RevealPanel className={`${styles.cols} ${styles.colsSpaced}`}>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>お渡しするもの</h3>
            <ul>
              <li className={styles.revealItem}>マージできる状態の Pull Request</li>
              <li className={styles.revealItem}>意図が分かる粒度に分けたコミット</li>
              <li className={styles.revealItem}>直した箇所と、なぜそうしたかの説明</li>
            </ul>
          </div>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>渡す前に必ず見ること</h3>
            <ul>
              <li className={styles.revealItem}>型チェックと Lint をエラー 0 で通す</li>
              <li className={styles.revealItem}>実機での表示確認（狭い端末を含む）</li>
              <li className={styles.revealItem}>
                PageSpeed Insights で速度を測る。単発では判定せず中央値で見る
              </li>
              <li className={styles.revealItem}>動きを切る設定での見え方</li>
            </ul>
          </div>
        </RevealPanel>
      </section>

      {/* ═══ AI の扱いと連絡 ═══ */}
      <section className={styles.section}>
        <RevealHeading
          className={styles.sectionTitle}
          text="AI の扱いと、|連絡のしかた"
        />

        <RevealPanel className={styles.cols}>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>AI の扱い</h3>
            <ul>
              <li className={styles.revealItem}>開発には Claude Code を使っています</li>
              <li className={styles.revealItem}>
                御社やエンドクライアント様の顧客データ、認証情報、個人情報は AI に渡しません
              </li>
              <li className={styles.revealItem}>
                AI の利用を認めていない案件では、使わずに書きます
              </li>
            </ul>
          </div>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>連絡</h3>
            <ul>
              <li className={styles.revealItem}>
                Slack や Chatwork など、御社の連絡手段に合わせます
              </li>
              <li className={styles.revealItem}>成果物は GitHub などのリポジトリで共有します</li>
              <li className={styles.revealItem}>
                不明点は抱えたまま進めず、着手前に確認します
              </li>
            </ul>
          </div>
        </RevealPanel>
      </section>

      {/* ═══ 料金 ═══ */}
      <section className={styles.section}>
        <RevealHeading className={styles.sectionTitle} text="料金" />

        <RevealPanel className={styles.cols}>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>金額</h3>
            <ul>
              <li className={styles.revealItem}>
                <b>1ページ分の実装 税込 ¥30,000〜</b>
              </li>
              <li className={styles.revealItem}>
                部品ひとつ、一画面だけの修正も承ります。1回のご依頼は税込 ¥30,000 からです
              </li>
              <li className={styles.revealItem}>
                打ち合わせやディレクションが入る場合も、範囲を整理して別途お見積り
              </li>
              <li className={styles.revealItem}>
                値引きはしていません。金額を動かす代わりに、渡す範囲を変えて調整します
              </li>
            </ul>
          </div>
          <div className={styles.panel}>
            <h3 className={styles.revealItem}>進め方</h3>
            <ul>
              <li className={styles.revealItem}>
                デザインか既存リポジトリを見せていただければ、範囲と金額をお返しします
              </li>
              <li className={styles.revealItem}>
                始める前に、やることと金額を書いてお渡しします
              </li>
              <li className={styles.revealItem}>
                途中で変更が入ったときは、金額が変わるかどうかを作業の前にお知らせします
              </li>
              <li className={styles.revealItem}>
                NDA・業務委託契約は御社の書式で構いません
              </li>
            </ul>
          </div>
        </RevealPanel>
      </section>

      {/* ═══ 佐藤について ═══ */}
      <section className={styles.section}>
        <RevealHeading className={styles.sectionTitle} text="私について" />

        <RevealPanel className={styles.about}>
          <p className={styles.revealItem}>
            はじめまして。Sonosaki Lab. の佐藤です。宮城県で、一人でやっています。
          </p>
          <p className={styles.revealItem}>
            制作会社さんからいただいたデザインを、ブラウザで動くところまで持っていく。
            それが仕事の中身です。再委託はしません。最初から最後まで私が、
            きちんとコードまでチェックしながら行います。
          </p>
          <p className={styles.revealItem}>
            屋号を立てたのは 2026 年 7 月なので、受託の数はまだ並べられません。
            そこは正直に書いておきます。代わりに、いま公開しているサイトと、実際に測った数字を
            見ていただけるようにしました。上の「作ったもの」が、そのまま手の内です。
          </p>
          <p className={styles.revealItem}>
            デザインは出来ているのに実装する人が足りない。案件が重なって、コーディングだけ
            外に出したい。そういうときの受け皿として、このページを作りました。
          </p>
        </RevealPanel>

        <p className={styles.ctaWrap}>
          <a className={styles.cta} href="mailto:yoshihirock0710@gmail.com">
            実装の相談をする
          </a>
        </p>

        <p className={styles.sourceLink}>
          <span className={styles.sourceLabel}>このページのソース：</span>
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
    </Phrased>
  );
}
