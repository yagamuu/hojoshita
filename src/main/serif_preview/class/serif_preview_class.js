import common from '../../../common.js';
import serifClass from './serif_data_class.js';
import cutinClass from './cutin_data_class.js';
import h from 'hyperscript';

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

        this.$serif = this.$parent.querySelector('input[name^="se"]');
        this.$icon  = this.$parent.getElementsByTagName('select')[0];
        this.$cutin = this.$parent.querySelector('input[name^="en"]') || '';
        if (common.path("/kk/a_chara.php")) this.$cutin = this.$parent.nextElementSibling.querySelector('input[name^="en"]') || '';

        this.createPreviewAreaDOM();
        this.addEventListeners();
        this.render();
    }

    /**
     * ページに挿入するプレビュー領域DOMを生成
     */
    createPreviewAreaDOM () {
        // プレビューを反映させる要素
        this.$preview = h("td.FRB2", { style: "border:none;" }, h("b.B3", '準備中'));

        // $previewの親ブロック要素
        const $previewBlock = h("tr", { style: "opacity: 0; transition: opacity 0.3s; display: none;" },
            h("td", {
                colSpan: "4",
                style: "border:none;",
            }, 
                h("img", {
                    src: "http://lisge.com/kk/p/w1hd.png",
                    width: "670",
                    height: "21"
                }),
                h("br"),
                h("table.FRL", {
                    colSpan: "4",
                    style: "width:670px;background-size:670px;"
                },
                    h("tbody", 
                        h("tr", this.$preview)
                    )
                ),
                h("img", {
                    src: "http://lisge.com/kk/p/w1ft.png",
                    width: "670",
                    height: "21"
                }),
            ));
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
        if (this.$cutin) {
            this.$cutin.addEventListener('blur', this.render.bind(this));
        }
    }

    /**
     * プレビューブロックへの反映
     */
    render() {
        // プレビューブロックの初期化
        while (this.$preview.firstChild) this.$preview.removeChild(this.$preview.firstChild);

        const serifData = this.convertSerifText(this.$serif.value);
        let cutinData = [];

        // 演出画像を設定できるセリフの場合のみ演出画像のデータを生成
        if (this.$cutin.value !== undefined) cutinData = this.convertCutinText(this.$cutin.value);

        this.createPreviewDOM(serifData, cutinData);
    }

    /**
     * 入力されたセリフをオブジェクト配列に変換
     * @param  {string} serifText フォームに入力されたセリフ文字列
     * @return {object} オブジェクト型に変換したセリフの配列
     */
    convertSerifText(serifText) {
        if (!serifText) return [];
        if (serifText.length > 400) {
            const count = serifText.length - 400;
            return { error: `※セリフの文字数が制限を超えています。残り${count}字減らして下さい` };
        }

        let serifData = [];
        // ＞###で区切られた中からランダムに１つだけ発します。
        serifText.split('###').forEach((text, i) => {
            serifData[i] = [];
            // ＞+++で区切られたセリフを連続で発します。処理は###での区切りが先です。
            text.split('+++').forEach((text, j) => {
                serifData[i][j] = this.buildSerifObject(text);
            });
        });

        return serifData;
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
        // ＞セリフのアイコンを変更します。発言者変更と同時に使う場合にはアイコン変更のほうを先に書きます。
　      // ＞ランダムセリフや連続セリフでアイコンを変えたい際にどうぞ。
        serif.icon = this.$icon.value;
        const iconMatch = /^\/(\d+)\//.exec(serif.text);
        if (iconMatch) {
            serif.icon = parseInt(iconMatch[1]);
            serif.text = serif.text.substring(iconMatch[0].length);
        }
        
        // 発言者設定
        // ＞セリフの発言者名を変更します。@@とすると発言者名が消えて「」も消えます。
        serif.speaker = this.option.iconNameArray[serif.icon] || this.option.serifNameDefault;
        const speakerMatch = /^@([^@]*?)@/.exec(serif.text);
        if (speakerMatch) {
            serif.speaker = speakerMatch[1];
            serif.text    = serif.text.substring(speakerMatch[0].length);
        }

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
        const fontReg = new RegExp(common.escapeHtml("<(F(?=\\d)|I|S|U|B)([1-7])?>(.*?)</\\1\\2>"), "ig");
        const diceReg = new RegExp(common.escapeHtml("<(\\d{1,2})D(\\d{1,3})>"), "ig");
        let diceCnt = 0;
        
        // タグ装飾置換処理
        const fontReplacer = (match, tag, size, text) => {
            if (fontReg.test(text)) {
                text = text.replace(fontReg, fontReplacer);
            }
            tag = tag.toUpperCase();
            if (tag === 'F') {
                tag = 'span';
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
     * 演出画像フォームの値を読み込みオブジェクト配列に変換
     * @param  {string} text 演出画像フォームに入力された演出画像のURL文字列
     * @return {object} オブジェクト型に変換した演出画像データの配列
     */
    convertCutinText(cutinText) {
        if (!cutinText) return [];

        let cutinData = [];
        // ＞各演出画像の設定はURLを複数設定できます。複数設定する場合は ### で区切ってください。
        cutinText.split('###').forEach((text, index) => {
            cutinData[index] = this.buildCutinObject(text);
        });

        return cutinData;
    }

    /**
     * 演出画像フォームの値を読み込みオブジェクト化
     * @param  {string} text 分解した演出画像フォームに入力された演出画像のURL文字列
     * @return {object} オブジェクト型に変換した演出画像のURL
     */
    buildCutinObject(text) {
        let cutin = new cutinClass();
        cutin.src = text;

        const sizeMatch = /(.+)@(\d+)$/.exec(text);
        if (!sizeMatch) return cutin;

        cutin.src = sizeMatch[1];
        if (sizeMatch[2] > 0 && sizeMatch[2] <= 600) cutin.size = sizeMatch[2];
        
        return cutin;
    }

    /**
     * セリフのデータを読み込みプレビュー領域に反映するDOMを生成
     * @param  {object} serifData セリフ内容をデータ化したオブジェクト
     * @param  {object} cutinData 演出画像内容をデータ化したオブジェクト
     */
    createPreviewDOM (serifData, cutinData) {
        if (serifData.length === 0 && cutinData.length === 0) {
            this.$preview.appendChild(h("b.B3", "※セリフが設定されていません"));
            return;
        }
        if (serifData.error) {
            this.$preview.appendChild(h("b.B3", serifData.error));
            return;
        }

        let enableCutinList = false;
        // セリフと演出画像の区切り数が異なる場合は個別で演出画像を一覧表示
        if (serifData.length !== cutinData.length) enableCutinList = true;

        if (serifData.length > 1 ) {
            this.$preview.appendChild(common.createDecoratedDOM('セリフ一覧'));
            this.$preview.appendChild(h("br", {clear: "ALL"}));
        }
        serifData.forEach((serif, index) => {
            this.$preview.appendChild(h("span.LKT", `■${index+1} / ${serifData.length}`));
            this.$preview.appendChild(h("br"));
            // +++で区切られた連続セリフを考慮
            serif.forEach(serif => {
                if (!serif) return;

                // ＞@@とすると発言者名が消えて「」も消えます。
                let serifHTML = `${serif.speaker}<br>「${serif.text}」`;
                if (serif.speaker === "") serifHTML = serif.text;

                let $serifBody = h("td.BG");
                $serifBody.innerHTML = serifHTML;

                // セリフ本文
                this.$preview.appendChild(h(".SE",
                    h("table", 
                        h("tbody", 
                            h("tr", { valign: "TOP" }, 
                                h("td", { width: "60" },
                                    h("img.IC", { src: this.iconUrlList[serif.icon] || common.ICON_NOIMAGE })
                                ),
                                $serifBody
                            )))));
                this.$preview.appendChild(h(".CL"));
            });
            // 演出画像
            if (cutinData.length !== 0 && !enableCutinList && cutinData[index].src !== "") {
                this.$preview.appendChild(h("img.lazy", {
                    src: cutinData[index].src,
                    width: "600",
                    height: cutinData[index].size
                }));
            }
        });

        // セリフと演出画像の区切り数が異なる場合は個別で演出画像を一覧表示
        if (cutinData.length !== 0 && enableCutinList) {
            this.$preview.appendChild(common.createDecoratedDOM('演出画像一覧'));
            this.$preview.appendChild(h("br", {clear: "ALL"}));
            cutinData.forEach((cutin, index) => {
                this.$preview.appendChild(h("span.LKT", `■${index+1} / ${cutinData.length}`));
                this.$preview.appendChild(h("br"));
                this.$preview.appendChild(h("img.lazy", {
                    src: cutin.src,
                    width: "600",
                    height: cutin.size
                }));
            });
        }

    }
    
    /**
     * アイコンのキャラ名を取得してストレージに保存する
     * @param  {object} option 
     * @return {object} 保存後のオプション
     */
    static saveIconNameArray(option) {
        const $iconName = document.querySelectorAll("input[name^='icai']");
        let iconNameArray = [];
        $iconName.forEach(($name, index) => {
            iconNameArray[index] = $name.value;
        });
        const defaultName = document.querySelector("input[name='ai']").value || option.serifNameDefault;
        option.serifNameDefault = defaultName;
        option.iconNameArray = iconNameArray;
        common.setStorage(option);
        return option;
    }
};