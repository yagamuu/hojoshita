export default {
    // 画像未設定アイコンURL
    ICON_NOIMAGE: 'http://ktst.x0.to/p/np2.gif',

    /**
     * オプションのデフォルト値を返す
     * 
     * @return {object} デフォルトのオプション値
     */
    getOptionDefault: () => {
        return {
            enableSerifPreview: true,        // セリフプレビューを有効にするか
            serifNameDefault:   "名前未設定", // セリフを発するキャラのデフォ名
            iconNameArray:      []           // アイコンに設定されたキャラ名リスト
        };
    },

    /**
     * ストレージにデータ保存
     * 
     * @param {object} option オプション
     */
    setStorage: option => {
        chrome.storage.sync.set(option, function(){});
    },

    /**
     * HTMLのエスケープ
     * http://iwb.jp/jquery-javascript-html-escape/
     * 
     * @param  {string} String エスケープしたい文字列
     * @return {string} 変換した文字列
     */
    escapeHtml: ((String) => {
        const escapeMap = {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
        };
        let escapeReg = '[';
        for (const p of Object.keys(escapeMap)) {
            escapeReg += p;
        }
        escapeReg += ']';
        const reg = new RegExp(escapeReg, 'g');
        return str => {
            str = (str === null || str === undefined) ? '' : '' + str;
            return str.replace(reg, match => escapeMap[match]);
        };
    })(String),

    /**
     * GETパラメーターの取得
     * http://qiita.com/Evolutor_web/items/c9b940f752883676b35d
     * 
     * @return {object} GETパラメーターを列挙したオブジェクト
     */
    getUrlVars: () => {
        let vars = {}; 
        const param = location.search.substring(1).split('&');
        for(let i = 0; i < param.length; i++) {
            const keySearch = param[i].search(/=/);
            let key = '';
            if(keySearch != -1) key = param[i].slice(0, keySearch);
            const val = param[i].slice(param[i].indexOf('=', 0) + 1);
            if(key != '') vars[key] = decodeURI(val);
        } 
        return vars; 
    },

    /**
     * location.pathnameのラッパーメソッド
     * 
     * @param  {string} url 比較したいURL
     * @return {boolean} 現在のアクセス先とURLが一致しているか
     */
    path: url => location.pathname === url,

    /**
     * テキストをHTMLで装飾して返す
     * 
     * @param  {string} text 装飾したいテキスト
     * @param  {string} type 装飾のタイプ
     * @return {string} 装飾したテキストのHTML
     */
    createDecoratedHtml: (text, type = 'TTL') => {
        switch (type) {
            case 'TTL':
                return `
                    <div class="TTL">
                        <table>
                        <tbody>
                        <tr>
                            <td><img src="http://ktst.x0.to/p/t.png" width="20" height="20"></td>
                            <td class="F4">${text}</td>
                        </tr>
                        </tbody>
                        </table>
                    </div>
                    <br clear="ALL">
                `;
            default:
                return '';
        }
    }
}