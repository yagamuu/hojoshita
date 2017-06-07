import serifPreview from './serif_preview.js';

export default option => {
    option = serifPreview.saveIconNameArray(option);
    // セリフフォームを取得
    const $serifList = document.querySelectorAll("input[name^='se']");

    $serifList.forEach($serif => {
        const $container = $serif.parentNode.parentNode;
        const $icon = $container.querySelector('select[name^="sei"]');
        const $cutin = $container.nextElementSibling.querySelector('input[name^="en"]') || '';
        const preview = new serifPreview($serif, $icon, $cutin, option, 400);
        
        // プレビュー用ブロックを挿入
        const $nextElement = $container.nextElementSibling;
        if ($nextElement.querySelector('td').getAttribute('colspan') === "2") {
            $nextElement.parentNode.insertBefore(preview.$previewBlock, $nextElement.nextElementSibling);
            $nextElement.parentNode.insertBefore(preview.$previewToggle, $nextElement.nextElementSibling);
        }
        else {
            $container.parentNode.insertBefore(preview.$previewToggle, $nextElement);
            $container.parentNode.insertBefore(preview.$previewBlock, $nextElement);
        }
    });
}