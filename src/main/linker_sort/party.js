import common from '../../common.js';
import h from 'hyperscript';

export default option => {
    const $container = document.getElementsByClassName("LST").item(0);
    const sort = new linkerSort($container, option);
}

class linkerSort {
    /**
     * コンストラクタ
     * @param {Node}   $parent 各種入力フォームの親要素
     * @param {object} option オプション
     */
    constructor($parent, option) {
        this.$parent = $parent;
        this.option  = option;

        this.sortConditionsList = this.getSortConditionsList();
        this.createSortSelectBoxDOM();
        this.linker = this.getLinkerData();
    }

    /**
     * ページに挿入するソート条件選択DOMを生成
     */
    createSortSelectBoxDOM () {
        // 条件選択用DOM生成
        const createConditionsSelectDOM = n => h("select .ARE", { 
            name: `hjst-sort-conditions${n}`,
            onchange: e => { this.executeSortDOM(); },
            style: "margin-right:10px;",
        },
            Object.keys(this.sortConditionsList).map(key => {
                return h("option", { value: key }, this.sortConditionsList[key].label);
            })
        );
        this.$conditions1 = createConditionsSelectDOM(1);
        this.$conditions2 = createConditionsSelectDOM(2);

        // 並び順選択用DOM生成
        const createOrderSelectDOM = n => h("select .ARE", { 
            name: `hjst-sort-order${n}`,
            onchange: e => { this.executeSortDOM(); },
            style: "margin-right:10px;",
        },
            h("option", { value: 'asc' },  '昇順'),
            h("option", { value: 'desc' }, '降順')
        );
        this.$order1 = createOrderSelectDOM(1);
        this.$order2 = createOrderSelectDOM(2);
        
        this.$parent.parentNode.insertBefore(h(".hjst-linker-sort", { style: "margin:10px;"},
            h("span .LKT", 'ソート機能'),
            h("br"),
            h("span .F3", '第1条件:'),
            this.$conditions1,
            this.$order1,
            h("span .F3", '第2条件:'),
            this.$conditions2,
            this.$order2
        ), this.$parent);
    }

    /**
     * リンクしているキャラクターテーブルから各種情報を抽出
     * @return {object} リンクしているキャラ情報
     */
    getLinkerData() {
        return [].slice.call(this.$parent.querySelectorAll("tr[dn='1'][align='center']")).map($linker => {
            const $linkerStatus = $linker.nextElementSibling;
            const linkerStatusText = $linkerStatus.children[0].textContent;
            const conquer = /討\[(\d)(\d)\]/.exec(linkerStatusText);
            const practice = /練\[(\d)(\d)\]/.exec(linkerStatusText);

            const $domList = [$linker, $linkerStatus];
            if ($linkerStatus.nextElementSibling.className === 'LG') $domList.push($linkerStatus.nextElementSibling);

            return {
                dom: $domList,
                data: {
                    eno: ~~/^.*?\((\d+)\)$/.exec($linker.children[6].textContent)[1],
                    st:  ~~/ST:(\d+)/.exec(linkerStatusText)[1],
                    ag:  ~~/AG:(\d+)/.exec(linkerStatusText)[1],
                    dx:  ~~/DX:(\d+)/.exec(linkerStatusText)[1],
                    in:  ~~/IN:(\d+)/.exec(linkerStatusText)[1],
                    vt:  ~~/VT:(\d+)/.exec(linkerStatusText)[1],
                    mn:  ~~/MN:(\d+)/.exec(linkerStatusText)[1],
                    rowConquer: ~~conquer[1],
                    rowPractice: ~~practice[1],
                    rangeConquer: ~~conquer[2],
                    rangePractice: ~~practice[2],
                    dearConquer: ~~$linker.children[2].textContent,
                    dearPractice: ~~$linker.children[4].textContent
                }
            };
        });
    }

    /**
     * ソート処理を実行しキャラクター表DOMを更新
     */
    executeSortDOM() {
        const fragment = document.createDocumentFragment();
        this.linker.sort(this.sortLinkerData.bind(this)).forEach($linker => {
            $linker.dom.map($ => { fragment.appendChild($); });
        });
        this.$parent.appendChild(fragment);
    }

    /**
     * キャラ情報のソート処理用メソッド
     * @param {object} a 比較対象のキャラデータA
     * @param {object} b 比較対象のキャラデータB
     * @return {any} 比較結果
     */
    sortLinkerData(a, b) {
        const sortFunc = (index, order) => {
            const target = this.sortConditionsList[index].target;

            if (target === null) return;
            if (order === 'asc') return a.data[target] - b.data[target];
            return b.data[target] - a.data[target];
        };

        return sortFunc(this.$conditions1.value, this.$order1.value) || sortFunc(this.$conditions2.value, this.$order2.value);
    }

    /**
     * セレクトボックスに使用するソート条件の一覧配列を取得
     * label: セレクトボックスに表示される文字列
     * target: 対象となる値
     * 
     * @return {object} ソート条件の一覧配列
     */
    getSortConditionsList() {
        return [
            { label: '－', target: null },
            { label: 'ENo', target: 'eno' },
            { label: 'ST', target: 'st' },
            { label: 'AG', target: 'ag' },
            { label: 'DX', target: 'dx' },
            { label: 'IN', target: 'in' },
            { label: 'VT', target: 'vt' },
            { label: 'MN', target: 'mn' },
            { label: '隊列[討伐戦]', target: 'rowConquer' },
            { label: '隊列[練習戦]', target: 'rowPractice' },
            { label: '射程[討伐戦]', target: 'rangeConquer' },
            { label: '射程[練習戦]', target: 'rangePractice' },
            { label: '連れ出し回数[討伐戦]', target: 'dearConquer' },
            { label: '連れ出し回数[練習戦]', target: 'dearPractice' },
        ]
    }
}