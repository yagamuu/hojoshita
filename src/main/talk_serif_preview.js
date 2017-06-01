import serifPreview from './serif_preview.js';

export default option => {
    // セリフフォームを取得
    const $serifList = document.querySelectorAll("textarea");

    $serifList.forEach($textarea => {
        const $container = $textarea.parentNode.parentNode;
        const $icon  = $container.querySelector('select[name^="ic"]');
        const preview = new serifPreview($textarea, $icon, '', option, 300);
        
        let $previewHtml = document.createElement('table');
        $previewHtml.appendChild(preview.$previewToggleHtml);
        $previewHtml.appendChild(preview.$previewHtml);
        $container.appendChild($previewHtml);
    });
}