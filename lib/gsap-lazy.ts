/**
 * GSAP（本体 + Flip）を「最初の描画が終わって、手が空いてから」読み込む。
 *
 * 🔴 クリック時に読み込みを始めない。
 *    本体が無いと Flip が始められず、押した直後に無音の間ができる。
 * 🔴 静的 import にもしない。PSI は操作をしないので初期表示だけを測る＝
 *    待機時間に読めば「PSI モバイル90」と「押した瞬間に動く」を両立できる。
 * 🔴 動きが苦手な設定の人には、そもそも読み込まない（0KB）。
 *
 * ✅ 2026-09-04＝**SplitText をやめた。**
 *    ①見出しの立ち上がりは「行ごとの `overflow:hidden` ＋ `translateY(118%)`」で足りる
 *      （この作りで足りる）。
 *    ②SplitText は見出しの中身を作り替えるので、**React が自分の書き込み先を見失う**恐れがある。
 *      拡張のタブでは `document.hidden` で rAF が止まり、**起きているかを実機で確かめられなかった**
 *      ＝**危険が残る作りを、確かめられないまま抱えない。**
 *    ③プラグインが1つ減る（速度を売っている画面なので、使わないものは載せない）。
 *
 * 🆕 2026-09-07＝**ScrollTrigger を足した**（スクロール連動とテキストの動きのため）。**SplitText は入れないまま**＝
 *    上の②の危険（React の管理下の DOM を作り替える）は解決していないので、
 *    テキストの動きは行マスクで作る。**プラグインは2つまで。**
 *
 * 使う側は `loadGsap()` を await する。すでに読み終わっていれば即座に返る。
 */

type Gsap = typeof import("gsap")["gsap"];
type FlipPlugin = typeof import("gsap/Flip")["Flip"];
type ScrollTriggerPlugin = typeof import("gsap/ScrollTrigger")["ScrollTrigger"];

export type GsapBundle = {
  gsap: Gsap;
  Flip: FlipPlugin;
  ScrollTrigger: ScrollTriggerPlugin;
};

let pending: Promise<GsapBundle> | null = null;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function importBundle(): Promise<GsapBundle> {
  const [{ gsap }, { Flip }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/Flip"),
    import("gsap/ScrollTrigger"),
  ]);
  // registerPlugin は何度呼んでも安全（GSAP 側で重複登録を弾く）
  gsap.registerPlugin(Flip, ScrollTrigger);
  return { gsap, Flip, ScrollTrigger };
}

/**
 * 読み込みを開始する（まだなら）。返り値は共有の Promise。
 *
 * 🔴 失敗したら覚えを捨てる。捨てないと、一度 通信が切れただけで
 *    「失敗した Promise」を握り続け、電波が戻っても二度と動かなくなる
 *    ＝看板のアニメーションがそのセッション中ずっと死ぬ。
 */
export function loadGsap(): Promise<GsapBundle> {
  pending ??= importBundle().catch((err) => {
    pending = null;
    throw err;
  });
  return pending;
}

/**
 * 待機時間に読み込みを始める。返り値は「予約を取り消す関数」。
 * requestIdleCallback が無いブラウザでも必ず走るよう setTimeout に落とす。
 */
export function preloadGsapWhenIdle(): () => void {
  if (typeof window === "undefined") return () => {};
  if (prefersReducedMotion()) return () => {};

  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(() => void loadGsap(), {
      timeout: 2500,
    });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(() => void loadGsap(), 400);
  return () => window.clearTimeout(id);
}
