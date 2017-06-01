import serifPreview from './serif_preview.js';

export default option => {
    option = serifPreview.saveIconNameArray(option);

    // 全プレビューオブジェクトで使いまわせるようにprototypeに諸々設定
    serifPreview.prototype.option = option;
    serifPreview.prototype.iconUrlList = serifPreview.getIconUrl();
    // セリフフォームを取得
    const $serifList = document.querySelectorAll("input[name^='se']");

    $serifList.forEach($serif => {
        const $container = $serif.parentNode.parentNode;
        const $icon = $container.querySelector('select[name^="sei"]');
        const $cutin = $container.nextElementSibling.querySelector('input[name^="en"]') || '';
        const preview = new serifPreview($serif, $icon, $cutin, 400);
        
        // プレビュー用ブロックを生成
        const $nextElement = $container.nextElementSibling;
        if ($nextElement.querySelector('td').getAttribute('colspan') === "2") {
            $nextElement.parentNode.insertBefore(preview.$previewHtml, $nextElement.nextElementSibling);
            $nextElement.parentNode.insertBefore(preview.$previewToggleHtml, $nextElement.nextElementSibling);
        }
        else {
            $container.parentNode.insertBefore(preview.$previewToggleHtml, $nextElement);
            $container.parentNode.insertBefore(preview.$previewHtml, $nextElement);
        }
    });
}