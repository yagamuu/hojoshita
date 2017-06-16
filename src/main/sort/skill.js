import common from '../../common.js';
import h from 'hyperscript';

export default option => {
    // スキルソート実行用ボタンDOM生成
    const $target = document.getElementsByTagName("dl")[1];
    $target.parentNode.insertBefore(h(".NG", 
        h("input.BUT", {
            type: 'button',
            value: 'ソート(アクティブ優先)',
            style: "margin-right:20px;",
            onclick: () => { sortSkill('active'); }
        }),
        h("input.BUT", {
            type: 'button',
            value: 'ソート(パッシブ優先)',
            onclick: () => { sortSkill('passive'); },
        }),
    ), $target);

    // スキルソート実行
    const sortSkill = mode => {
        // 自分用スキルDOM
        const $skillForMyself = document.querySelectorAll("tr[dn='1']:not(.LG)");
        // 物語用スキルDOM
        const $skillForStory = document.querySelectorAll("tr[dn='2']:not(.LG)");

        // DOMとスキル内容を保持した配列を作成
        const skillForMyselfList = [];
        const skillForStoryList = [];

        const skillTimingList = mode === 'active' ? 
            common.getActiveSkillTiming().concat(common.getPassiveSkillTiming())
            :
            common.getPassiveSkillTiming().concat(common.getActiveSkillTiming());

        // DOMからスキルの内容、操作対象DOMを抽出し配列に挿入
        const getSkillData = $ => {
            /*
             * 1:発動タイミング
             * 2:スキル対象(先頭1文字のみ)
             * 3:スキル効果
             */
            const skillReg = /^【(.+?)(?::SP\d+)?】(.).*?:(.+)/;
            const skillMatch = skillReg.exec($.children[3].textContent);

            return {
                element: $.children[1].querySelector("input"),
                timing: skillTimingList.indexOf(skillMatch[1]),
                target: ['自','味','対','敵','他'].indexOf(skillMatch[2]),
                effect: skillMatch[3]
            };
        };
        $skillForMyself.forEach($ => {
            skillForMyselfList.push(getSkillData($));
        });
        $skillForStory.forEach($ => {
            skillForStoryList.push(getSkillData($));
        });

        /* 
         * 配列をソートし順番通りに並び順入力テキストボックスに入力
         * 発動タイミング＞スキル対象＞スキル効果の長さの順にソート
         */
        const sortSkillFunc = (a, b) => {
            if (a.timing < b.timing) return -1;
            if (a.timing > b.timing) return 1;
            if (a.target < b.target) return -1;
            if (a.target > b.target) return 1;
            if (a.effect.length < b.effect.length) return -1;
            if (a.effect.length > b.effect.length) return 1;
        };
        skillForMyselfList.sort(sortSkillFunc);
        skillForStoryList.sort(sortSkillFunc);

        skillForMyselfList.forEach((skill, index) => {
            skill.element.value = index;
        });

        skillForStoryList.forEach((skill, index) => {
            skill.element.value = index + 100;
        });
    };
}