import "server-only";
import { Children, Fragment, cloneElement, isValidElement, type Key, type ReactElement, type ReactNode } from "react";
import { loadDefaultJapaneseParser } from "budoux";

/**
 * 日本語の文を「語のまとまり」の境目でだけ折れるようにする（2026-09-30）。
 *
 * 🔴 なぜ要るか＝globals.css の `word-break: auto-phrase` は **Chrome だけ**。Safari・Firefox では
 *    「少し待／たされる」「押／してみてください」と語の途中で折れていた（Playwright の3ブラウザで実測・
 *    トップだけで約40ブロック）。
 * 🔧 やり方＝**ビルド時（サーバ）に** BudouX で文を区切り、境目に `<wbr>` を入れる。
 *    Safari・Firefox 側は globals.css の `@supports not (word-break: auto-phrase)` で
 *    `word-break: keep-all` を当てる＝`<wbr>` と空白・句読点でだけ折れる。Chrome は今までどおり auto-phrase。
 *    ⇒ **ブラウザに送る JS は 0 バイト増えない**（`server-only`＝クライアント部品から読むとビルドで落ちる）。
 * ⚠️ 文字は1字も変えない（`<wbr>` は読み上げ・コピー・検索に影響しない）。
 * ⚠️ 属性（aria-label・href など）には触らない。触るのは children の文字列だけ。
 */
const parser = loadDefaultJapaneseParser();
const JA = /[぀-ヿ一-鿿]/;

function phraseText(text: string, keyBase: string): ReactNode {
  if (!JA.test(text)) return text;
  const parts = parser.parse(text);
  if (parts.length < 2) return text;
  const out: ReactNode[] = [];
  parts.forEach((p, i) => {
    if (i > 0) out.push(<wbr key={`${keyBase}w${i}`} />);
    out.push(p);
  });
  // 🔴 必ず <span> 1つで包む＝flex・grid の箱の直下に <wbr> を置くと、まとまりが1つずつ別の
  //    部品になって横に並ぶ（/partner の案内が Firefox で 543px はみ出した・2026-09-30）。
  //    包めば、元の「文字のかたまり1つ」のまま。
  return <span key={keyBase}>{out}</span>;
}

// 中身に手を入れない要素（コード・入力欄・自分で折り方を決めている箱）
const SKIP = new Set(["script", "style", "code", "pre", "textarea", "option", "svg"]);

function walk(node: ReactNode, key: string): ReactNode {
  if (typeof node === "string") return phraseText(node, key);
  if (Array.isArray(node)) return node.map((n, i) => walk(n, `${key}.${i}`));
  if (!isValidElement(node)) return node;
  const el = node as ReactElement<{ children?: ReactNode; "data-nophrase"?: boolean }>;
  if (typeof el.type === "string" && SKIP.has(el.type)) return el;
  if (el.props["data-nophrase"]) return el;
  if (el.props.children === undefined) return el;
  const kids = Children.toArray(el.props.children).map((c, i) => walk(c, `${key}.${i}`));
  return cloneElement(el, undefined, ...kids);
}

/** 囲んだ中の日本語の文字列すべてに、語の境目の `<wbr>` を入れる（サーバ部品の中でだけ使う）。 */
export function Phrased({ children }: { children: ReactNode }) {
  return <>{walk(children, "p")}</>;
}

/** 1本の文字列を区切る（クライアント部品へ props で渡す文を、サーバ側で先に区切るとき用）。 */
export function phrase(text: string, key?: Key): ReactNode {
  // key＝配列に入れて渡すとき用（無いと React が「リストに key が無い」と警告する）
  return <Fragment key={key}>{phraseText(text, "t")}</Fragment>;
}
