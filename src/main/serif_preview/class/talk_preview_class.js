import common from '../../../common.js';
import serifClass from './serif_data_class.js';
import h from 'hyperscript';

/*
 * トーク用クラス
 */
export default class {
    /**
     * コンストラクタ
     * @param {Node}   $parent 各種入力フォームの親要素
     * @param {object} option オプション
     */
    constructor($parent, option) {
        this.$parent = $parent;
        this.option  = option;
        this.iconUrlList = common.getIconUrl();

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
        const previewBlockClass = this.$parent.parentNode.className === "SY" ? ".SY1" : ".SY";
        const $previewBlock = h(previewBlockClass, { style: "opacity: 0; transition: opacity 0.3s; display: none;" },
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
     * 入力されたセリフをオブジェクトに変換
     * @param  {string} serifText フォームに入力されたセリフ文字列
     * @return {object} オブジェクト型に変換したセリフ
     */
    convertSerifText(serifText) {
        if (!serifText) return ;
        if (serifText.length > 300) {
            const count = serifText.length - 300;
            return { error: `※セリフの文字数が制限を超えています。残り${count}字減らして下さい` };
        }

        let serif = new serifClass();
        serif.text = common.escapeHtml(serifText);

        // アイコン番号設定
        serif.icon = this.$icon.value;

        // テキストの装飾
        serif.text = this.decorationText(serif.text);

        return serif;
    }

    /**
     * 文字列を特殊文法に基づき装飾
     * 
     * 以下ルールブックより抜粋
     * <F5>文字変更</F5>
     * 囲んだ部分の文字サイズを変更します。
     * 数字は1～7で、省略すると通常サイズ（セリフ：3、発言：2）になります。
     * F を I にすると 斜体 、S にすると 取消線 、U にすると 下線 になります。
     * 
     * < [ダイス数] D [ダイス面数] >
     * ダイスロールができます。1セリフ内に2回まで有効です。
     * ダイス数は1～99、ダイス面数は1～999の半角数字で指定します。
     * 
     * @param  {string} text セリフ文字列
     * @return {string} 装飾したセリフ文字列
     */
    decorationText(text) {
        const fontReg = new RegExp(common.escapeHtml("<(F(?=\\d)|I|S|U)([1-7])?>(.*?)</\\1\\2>"), "ig");
        const diceReg = new RegExp(common.escapeHtml("<(\\d{1,2})D(\\d{1,3})>"), "ig");
        let diceCnt = 0;
        
        // タグ装飾置換処理
        const fontReplacer = (match, tag, size, text) => {
            tag = tag.toUpperCase();
            if (tag === 'F') {
                tag = 'B';
            }
            
            if (size) return `<${tag} class="F${size}">${text}</${tag}>`;
            
            return `<${tag}>${text}</${tag}>`;
        };

        // ダイスロール置換処理
        const diceReplacer = (dices, faces, match) => {
            // 1回のセリフでダイスロール出来るのは2回まで
            if (++diceCnt > 2) return match;

            dices = Number(dices);
            faces = Number(faces);

            // 9面体以下専用スタイルを有効にするかどうか
            const enableD6 = (faces <= 9);
            const diceResults = throwDiceMultiple(dices, faces);

            // ダイスの合計
            const sum = diceResults.reduce((a,b) => a+b);

            // 各ダイスの目の文字列表現を結合したもの
            const diceStrings = diceResults.map(n => {
                if (enableD6 && n === 1)
                    return `<span class="R4">1</span>`;
                if (enableD6) 
                    return `${n}`;
                return `[${n}]`;
            }).join('');

            let html = '<span class="DX">';
            html += `【${dices}D${faces}：`;
            html += (enableD6
                ? `<span class='D6'>${diceStrings}</span>`
                : diceStrings);
            if (dices >= 2)
                html += ` = <b>${sum}</b>`
            html += `】</span>`;

            return html;
        };

        const throwDiceMultiple = (dices, faces) => {
            let results = [];

            for (let i=0; i < dices; i++) {
                results.push(throwDice(faces));
            }

            return results;
        }

        const throwDice = faces => Math.floor(Math.random() * faces) + 1;
        
        return (common.replaceLineBreakToHtml(text)
            .replace(new RegExp(common.escapeHtml("<BR>"), "gi"), "<BR>")
            .replace(fontReg, fontReplacer)
            .replace(diceReg, (match, group1, group2, offset, string) => diceReplacer(group1, group2, match)));
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