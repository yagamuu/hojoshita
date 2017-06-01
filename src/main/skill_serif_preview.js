import serifPreview from './serif_preview.js';

export default option => {
    // 全プレビューオブジェクトで使いまわせるようにprototypeに諸々設定
    serifPreview.prototype.option = option;
    serifPreview.prototype.iconUrlList = serifPreview.getIconUrl();
    // セリフフォームを取得
    const $serifList = document.querySelectorAll("tr.SED");

    $serifList.forEach($tr => {
        const $container = $tr.querySelector('td');
        const $serif = $container.querySelector('input[name^="se"]');
        const $icon  = $container.querySelector('select[name^="ic"]');
        const $cutin = $container.querySelector('input[name^="en"]') || '';
        const preview = new serifPreview($serif, $icon, $cutin, 400);
        
        let $previewHtml = document.createElement('table');
        $previewHtml.appendChild(preview.$previewToggleHtml);
        $previewHtml.appendChild(preview.$previewHtml);
        $container.appendChild($previewHtml);
    });
}