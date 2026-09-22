import type { Viewport } from "next";

/**
 * /partner だけ、地の色を差し替えるためのレイアウト。
 *
 * 🔴 なぜ必要か＝サイト共通の body は珊瑚色の地（＋ノイズのテクスチャ）で塗られている。
 *    このページは暗い地なので、そのままだと
 *    ①慣性スクロールで端まで引っ張ったときに珊瑚色がのぞく
 *    ②スマホのアドレスバーが珊瑚色のまま
 *    の2つがちぐはぐになる。
 *
 * 🔴 なぜ globals.css に書かないのか＝あちらは全ページ共通。
 *    ここに置けば、**この経路を描画している間だけ**この style が DOM に載り、
 *    別ページへ移れば外れる。共通のファイルに `/partner のときは…` を
 *    足し始めると、ページが増えるたびに共通側が膨らむ。
 */
export const viewport: Viewport = {
  // スマホのアドレスバーの色。共通の珊瑚（#e4574a）をこのページだけ上書きする
  themeColor: "#14100e",
  maximumScale: 5,
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        // 中身はこのファイルの定数だけ（利用者の入力は入らない）
        dangerouslySetInnerHTML={{
          __html: `
/* /partner だけの地の色。共通の body（珊瑚＋ノイズ）を打ち消す。 */
body {
  background-color: #14100e;
  background-image: none;
  color: #ede4db;
}
/* 🔴 共通のフォーカスの輪は墨色（#191716）＝この暗い地では完全に見えなくなる。
   キーボードで操作する人が現在地を見失うので、明るい側へ差し替える。
   コントラスト比 15.06:1（対 地 #14100e・WCAG 2.1 相対輝度で実測）。 */
:focus-visible {
  outline: 3px solid #ede4db;
  outline-offset: 3px;
}
`,
        }}
      />
      {children}
    </>
  );
}
