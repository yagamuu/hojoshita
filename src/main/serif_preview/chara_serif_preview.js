import serifPreview from './serif_preview.js';

export default option => {
    option = serifPreview.saveIconNameArray(option);
    // セリフフォームを取得
    const $serifList = document.querySelectorAll("input[name^='se']");

    $serifList.forEach($serif => {
        const $parent = $serif.parentNode.parentNode;
        const preview = new serifPreview($parent, option);
        
        // プレビュー用ブロックを挿入
        const $nextElement = $parent.nextElementSibling;
        if ($nextElement.querySelector('td').getAttribute('colspan') === "2") {
            $nextElement.parentNode.insertBefore(preview.$previewBlock, $nextElement.nextElementSibling);
            $nextElement.parentNode.insertBefore(preview.$previewToggle, $nextElement.nextElementSibling);
        }
        else {
            $parent.parentNode.insertBefore(preview.$previewToggle, $nextElement);
            $parent.parentNode.insertBefore(preview.$previewBlock, $nextElement);
        }
    });
}