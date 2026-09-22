/**
 * 本番の View Source に「なぜそう作ったか」を残すための部品。
 *
 * 🔴 なぜ必要か＝**JSX の {/* *\/} は本番に1文字も残らない。**
 *    Next.js の本番ビルドは JSX コメントを構文木ごと落とし、CSS も minify する。
 *    手元のエディタでは読めるのに、実画面では消えている（＝「書いてある」と「動いている」は別物）。
 *    このページの読み手は**実装者を審査する側＝デベロッパーツールを開く**ので、
 *    ソースそのものがポートフォリオの一部になる。消えては困る。
 *
 * 🔴 なぜ dangerouslySetInnerHTML か＝**ここだけが minify を通り抜けるから。**
 *    中身はビルド時の構文木ではなく、**サーバが描画する瞬間に作る文字列**。
 *    minifier はビルド時にしか動かないので、この文字列には触れない。
 *    Next.js は SSR の HTML を圧縮し直さないため、そのまま View Source に出る。
 *
 * 🔴 なぜ <div> ではなく <span> でもなく、空の要素に載せるのか＝
 *    コメントだけを吐きたいのに、React は「テキストの入れ物」を必ず1つ要求する。
 *    display:contents の span にすることで、**枠にも行にも一切 影響しない**
 *    （CLS を1ミリも動かさない＝速度を売っている画面なので、飾りで崩さない）。
 *
 * 💰 コスト＝gzip 後で 1〜2KB。PSI の転送量には実質のらない。
 *    minify を切る案（数百KB増）を採らずに済むのは、この一点に絞っているため。
 */
export default function SourceNote({
  title,
  lines,
}: {
  /** 何についての覚え書きか（1行で） */
  title: string;
  /** 「なぜ」を説明する行。**何をしたか、ではなく、なぜそうしたか**を書く */
  lines: string[];
}) {
  // 🔴 `--` を含む文字列はコメントを途中で閉じてしまう（HTML の仕様）。
  //    人が書く日本語に紛れ込むと**そこから先が画面に露出する**ので、機械的に潰す。
  const safe = (s: string) => s.replace(/--+/g, "—");

  const body = [
    "",
    `  ${safe(title)}`,
    "  " + "─".repeat(58),
    ...lines.map((l) => `  ${safe(l)}`),
    "",
  ].join("\n");

  return (
    <span
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: `<!--\n${body}-->` }}
    />
  );
}
