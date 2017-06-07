import serifPreview from './serif_preview.js';

export default option => {
    // セリフフォームを取得(メイン)
    const $serifList = document.querySelector("textarea.ARE");
    
    const $container = $textarea.parentNode.parentNode;
    const $icon  = $container.querySelector('select[name^="ic"]');
    const preview = new serifPreview($textarea, $icon, '', option, 300);
    let $previewHtml = document.createElement('table');
    $previewHtml.appendChild(preview.$previewToggleHtml);
    $previewHtml.appendChild(preview.$previewHtml);
    $container.appendChild($previewHtml);

    /** 
     * 返信ボタンクリック時のイベントハンドラにプレビュー要素追加のイベントを追加
     * ※返信用の入力フォームが用意されるエレメントは最初空で、返信ボタンをクリックした際にDOM挿入が行われる
     */
    const replyButtonEventListener = e => {
        let form = event.currentTarget.parentNode.parentNode.parentNode.nextSibling.nextSibling.querySelector('form');
        let talkPreview = new talkPreview(form, character);
        form.appendChild(talkPreview.previewArea);
        talkPreview.init();

        event.currentTarget.removeEventListener('click', eventListener);
    };

    document.querySelectorAll('a.RE').forEach($button => {
        $button.parentNode.addEventListener('click', replyButtonEventListener);
    });
}