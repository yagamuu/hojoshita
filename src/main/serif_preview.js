import common from '../common.js';

export default class {
    /**
     * コンストラクタ
     * @param {Node}   $serif           セリフ入力フォームの要素
     * @param {Node}   $iconElement     アイコン選択フォームの要素
     * @param {Node}   $cutin           演出画像URL入力フォームの要素
     * @param {object} option           オプション
     * @param {number} serifLengthLimit セリフ文字数制限(戦闘400文字、トーク300文字)
     */
    constructor($serif, $iconElement, $cutin, option, serifLengthLimit = 400) {
        this.$serif = $serif;
        this.$icon  = $iconElement;
        this.$cutin = $cutin;
        this.option = option;
        this.serifLengthLimit = serifLengthLimit;
        this.iconUrlList = this.getIconUrl();

        this.settingPreviewElement();
        this.addEventListeners();
        this.render();
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
        const html = this.convertSeriftoHtml();
        this.$previewText.innerHTML = html;
    }

    /**
     * 入力されたセリフ情報の確認、加工
     * @return {String} プレビューブロックに反映させるHTML文
     */
    convertSeriftoHtml() {
        const serifLength = this.replaceLineBreakToHtml(this.$serif.value).length;
        const cutinList = this.$cutin.value !== undefined ? this.$cutin.value.split("###") : [];
        
        // セリフ、演出画像共に空白の場合
        if (serifLength === 0 && cutinList.length === 0) {
            return '<b class="B3">※セリフが設定されていません</b>';
        }
        // 文字数が規定数を上回っていた場合
        else if (serifLength > this.serifLengthLimit) {
            const count = serifLength - this.serifLengthLimit;
            return `<b class="B3">※セリフの文字数が制限を超えています。残り${count}字減らして下さい</b>`;
        }
        
        let   previewHtml = "";
        const speakerNameArray   = this.option.iconNameArray;
        const speakerNameDefault = this.option.serifNameDefault;
        
        const serifList = this.$serif.value.split("###");
        
        // セリフ、演出画像共に区切り文字のみの場合
        if (serifList.join("") === "" && cutinList.join("") === "") {
            return '<b class="B3">※セリフが設定されていません</b>';
        }

        // 演出画像の出力フラグ
        let enableCutinList = false;
        if (serifLength === 0 || cutinList.length !== serifList.length) enableCutinList = true;

        if (serifList.length > 1 ) previewHtml += common.createDecoratedHtml('セリフ一覧');

        serifList.forEach((text, index) => {
            if (serifList.length > 1 ) previewHtml += `<span class="LKT">■${index+1} / ${serifList.length}</span><br>`;
            if (text === "") return;
            
            // 連続セリフ対応
            const serifPlus = text.split("+++");
            serifPlus.forEach(text => { 
                previewHtml += this.buildPreviewHtml(text);
            });

            // 演出画像出力
            if (enableCutinList === false && cutinList[index].length !== 0) {
                previewHtml += this.createCutinHtml(cutinList[index]);
            }
        });

        // セリフと演出画像の区切り数が異なる場合は演出画像を一覧表示
        if (enableCutinList && cutinList.join("").length !== 0) {
            previewHtml += common.createDecoratedHtml('演出画像一覧');
            cutinList.forEach((cutin, index) => {
                previewHtml += `<span class="LKT">■${index+1} / ${cutinList.length}</span><br>`;
                previewHtml += this.createCutinHtml(cutin);
            });
        }
        
        return previewHtml;
    }

    /**
     * プレビューに反映させるHTML文の作成
     * @param  {String} text セリフ
     * @return {String} HTML
     */
    buildPreviewHtml(text) {
        // アイコン設定
        let iconIndex = this.$icon.value;
        const iconMatch = /^\/(\d+)\//.exec(text);
        if (iconMatch) {
            iconIndex = parseInt(iconMatch[1]);
            text      = text.substring(iconMatch[0].length);
        }
        const iconUrl = this.iconUrlList[iconIndex] || common.ICON_NOIMAGE;
        
        // 発言者設定
        let name = this.option.iconNameArray[iconIndex] || this.option.serifNameDefault;
        const nameMatch = /^@([^@]*?)@/.exec(text);
        if (nameMatch) {
            name = nameMatch[1];
            text = text.substring(nameMatch[0].length);
        }
        
        return this.createPreviewHtml(this.serifConvertToHtml(text), iconUrl, name);
    }

    /**
     * 各種文法の解釈
     * @param  {String} serif セリフ
     * @return {String} HTMLに変換したセリフ
     */
    serifConvertToHtml (serif) {
        const html = common.escapeHtml(serif);
        const decorationReg = new RegExp(common.escapeHtml("<(F(?=\\d)|I|S|U)([1-7])?>(.*?)</\\1\\2>"), "ig");
        const diceReg = new RegExp(common.escapeHtml("<(\\d{1,2})D(\\d{1,3})>"), "ig");
        let diceCnt = 0;
        
        const decorationReplacer = (match, tag, size, text, offset, string) => {
            tag = tag.toUpperCase();
            if (tag === 'F') {
                tag = 'B';
            }
            
            if (size) {
                return `<${tag} class="F${size}">${text}</${tag}>`;
            }
            return `<${tag}>${text}</${tag}>`;
        };

        const diceReplacer = (dices, faces) => {
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
            if(dices >= 2)
                html += ` = <b>${sum}</b>`
            html += `】</span>`;

            return html;
        };

        const throwDiceMultiple = (dices, faces) => {
            let results = [];

            for(let i=0; i < dices; i++) {
                results.push(throwDice(faces));
            }

            return results;
        }

        const throwDice = (faces) => {
            return Math.floor(Math.random() * faces) + 1;
        }
        
        return (html
            .replace(new RegExp(common.escapeHtml("<BR>"), "gi"), "<BR>")
            .replace(decorationReg, decorationReplacer)
            .replace(diceReg, (match, group1, group2, offset, string) => diceReplacer(group1, group2)));
    }

    /**
     * セリフ用ブロックHTML文出力
     * @param  {String} serif セリフ本文
     * @param  {String} icon  アイコンのURL
     * @param  {String} name  セリフの発言者
     * @return {String} 作成したセリフ文ブロック
     */
    createPreviewHtml (serif, icon, name) {
        let serifText = `${name}<br>「${serif}」`;
        if (name === "") serifText = serif;
        const previewHtml  = `
            <div class="SE">
                <table>
                <tbody>
                    <tr valign="TOP">
                        <td width="60"><img src="${icon}" class="IC"></td>
                        <td class="BG">${serifText}</b></td>
                    </tr>
                </tbody>
                </table>
            </div>
            <div class="CL"></div>
        `;

        return previewHtml;
    }

    /**
     * 演出画像用のHTML作成
     * @param  {String} cutin 演出画像のURL
     * @return {String} HTML
     */
    createCutinHtml(cutin) {
        let size = 200;
        const sizeMatch = /(.+)@(\d+)$/.exec(cutin);
        if (sizeMatch) {
            cutin = sizeMatch[1];
            if (sizeMatch[2] <= 600 && sizeMatch[2] > 0) {
                size = sizeMatch[2];
            }
        }
        return `<img src="${cutin}" width="600" height="${size}" class="lazy"><br>`;
    }

    /**
     * アイコンのURLを取得する
     * @return {object} アイコンのURL一覧
     */
    getIconUrl() {
        const $iconList = document.querySelectorAll("#CL1 td img");
        const iconUrlArray = [];
        $iconList.forEach(($icon, index) => {
            if ($icon.getAttribute('alt') !== "") {
                iconUrlArray[index] = $icon.getAttribute('src');
            }
        });

        return iconUrlArray;
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

    /**
     * 改行コードをBRタグに置換
     * @param  {string} html
     * @return {string} 置換後のHTML文字列
     */
    replaceLineBreakToHtml(html) {
        return html.replace(/(\r\n|\r|\n)/g, "<BR>");
    }

    /**
     * セリフプレビュー用HTMLエレメント準備
     */
    settingPreviewElement() {
        const previewToggleInnerHTML =  `
            <td colspan="4">
                <span class="ABO">
                    <a class="previewToggle">▽ セリフプレビュー（クリックで表示/非表示）</a>
                </span>
            </td>
        `;
        let previewToggleHtml = document.createElement('tr');
        previewToggleHtml.innerHTML = previewToggleInnerHTML;
        this.$previewToggleHtml = previewToggleHtml;

        const width = 670;
        const previewInnerHtml = `
            <td colspan="4">
                <IMG SRC="http://lisge.com/kk/p/w1hd.png" WIDTH="${width}" HEIGHT=21><BR>
                <TABLE cellspacing=0 class="FRL" style="width:${width}px;background-size:${width}px;">
                    <TR>
                        <TD CLASS="FRB2 kkex_serifblock">
                            <b class="B3">準備中</b>    
                        </TD>
                    </TR>
                </TABLE>
                <IMG SRC="http://lisge.com/kk/p/w1ft.png" WIDTH="${width}" HEIGHT=21><BR>
            </td>
        `;

        let previewHtml = document.createElement('tr');
        previewHtml.setAttribute('class', 'kkex_serif');
        previewHtml.setAttribute('style', 'display:none;opacity:0;');
        previewHtml.style.transition = 'opacity 0.3s';
        previewHtml.innerHTML = previewInnerHtml;
        this.$previewHtml = previewHtml;
        this.$previewText = previewHtml.getElementsByClassName('kkex_serifblock')[0];

        // トグルクリック時のイベント設定
        previewToggleHtml.getElementsByClassName('previewToggle')[0].addEventListener('click', () => {
            if (previewHtml.style.display === 'none') {
                previewHtml.style.display = '';
            }
            let { opacity } = previewHtml.ownerDocument.defaultView.getComputedStyle(previewHtml, null);
            if (opacity === '1') {
                previewHtml.style.opacity = '0';
            }
            else {
                previewHtml.style.opacity = '1';
            }
        });
        previewHtml.addEventListener('webkitTransitionEnd', function(e) {
            if (previewHtml.style.opacity == 0) {
                previewHtml.style.display = 'none';
            }
        });
    }
};