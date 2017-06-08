import common from '../../common.js';
import serifPreview from './serif_preview.js';
import serifClass from './serif_class.js';
import h from 'hyperscript';

/*
 * トーク用クラス
 */
export default class extends serifPreview {
    /*
     * インスタンス生成した際に実行する処理
     */
    execute() {
        this.$serif   = this.$parent.getElementsByTagName('textarea')[0];
        this.$icon    = this.$parent.getElementsByTagName('select')[0];
        this.$speaker = this.$parent.querySelector('input');

        this.createPreviewAreaDOM();
        this.addEventListeners();
        this.render();
    }

    /**
     * ページに挿入するプレビュー領域DOMを生成
     */
    createPreviewAreaDOM () {
        // プレビューを反映させる要素
        this.$preview = h("tr", { valign: "TOP" },'準備中');

        // $previewの親ブロック要素
        const previewBlockClass = this.$parent.parentNode.className === "SY" ? "SY1" : "SY";
        const $previewBlock = h("." + previewBlockClass, { style: "opacity: 0; transition: opacity 0.3s; display: none;" },
            h("table", { 
                width: "364",
                cellPadding: "0",
                cellSpacing: "0"
            },
                h("tbody", this.$preview)
            )
        );

        $previewBlock.addEventListener('webkitTransitionEnd', e => {
            if ($previewBlock.style.opacity == 0) $previewBlock.style.display = 'none';
        });

        this.$previewBlock = $previewBlock;
        
        // プレビューブロック要素の表示･非表示を切り替えるトグル
        this.$previewToggle = h("tr", 
            h("td", {
                colSpan: "4",
                style: "border:none"
            },
                h("span.ABO", h("a.previewToggle", {
                    onclick: () => {
                        if (this.$previewBlock.style.display === 'none') this.$previewBlock.style.display = '';
                        let { opacity } = this.$previewBlock.ownerDocument.defaultView.getComputedStyle(this.$previewBlock, null);
                        this.$previewBlock.style.opacity = opacity === '1' ? '0' : '1';
                    }
                }, `▽ セリフプレビュー（クリックで表示/非表示）`))));
    }

    /**
     * イベントリスナーの追加
     */
    addEventListeners() {
        this.$serif.addEventListener('keyup', this.render.bind(this));
        this.$icon.addEventListener('change', this.render.bind(this));
        this.$speaker.addEventListener('keyup', this.render.bind(this));
    }

    /**
     * プレビューブロックへの反映
     */
    render() {
        // プレビューブロックの初期化
        while (this.$preview.firstChild) this.$preview.removeChild(this.$preview.firstChild);

        const serifData = this.convertSerifText(this.$serif.value);
        this.createPreviewDOM(serifData);
    }

    /**
     * 入力されたセリフをオブジェクト配列に変換
     * @param  {string} serifText フォームに入力されたセリフ文字列
     * @return {object} オブジェクト型に変換したセリフ
     */
    convertSerifText(serifText) {
        if (!serifText) return ;
        if (serifText.length > 300) {
            const count = serifText.length - 300;
            return { error: `※セリフの文字数が制限を超えています。残り${count}字減らして下さい` };
        }
        return this.buildSerifObject(serifText);
    }

    /**
     * セリフ文字列を読み込みオブジェクト化
     * @param  {string} text 分解したフォームに入力されたセリフ文字列
     * @return {object} オブジェクト型に変換したセリフ
     */
    buildSerifObject(text) {
        let serif = new serifClass();
        serif.text = common.escapeHtml(text);

        // アイコン番号設定
        serif.icon = this.$icon.value;

        // テキストの装飾
        serif.text = this.decorationText(serif.text);

        return serif;
    }

    /**
     * セリフのデータを読み込みプレビュー領域に反映するDOMを生成
     * @param  {object} serifData セリフ内容をデータ化したオブジェクト
     */
    createPreviewDOM (serifData) {
        if (!serifData) {
            this.$preview.appendChild(h("b.B3", "※セリフが設定されていません"));
            return;
        }
        if (serifData.error) {
            this.$preview.appendChild(h("b.B3", serifData.error));
            return;
        }

        this.$preview.appendChild(h("td", {
            width: "70",
            rowSpan: "2"
        }, h("img.RE2", { src: this.iconUrlList[serifData.icon] || common.ICON_NOIMAGE })));

        let $serifBody = h("td.B2");
        $serifBody.innerHTML = `<span class="B2">${this.$speaker.value}</span><br>「${serifData.text}」`;

        // セリフ本文
        this.$preview.appendChild($serifBody);
    }
}