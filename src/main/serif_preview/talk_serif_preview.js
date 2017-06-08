import talkPreview from './talk_class.js';

export default option => {
    // セリフフォームを取得(メイン)
    const $textArea = document.querySelector("textarea.ARE");
    
    const $parent = $textArea.parentNode.parentNode;
    const preview = new talkPreview($parent, option);
    $parent.parentNode.parentNode.appendChild(preview.$previewToggle);
    $parent.parentNode.parentNode.appendChild(preview.$previewBlock);

    /** 
     * 返信ボタンクリック時のイベントハンドラにプレビュー要素追加のイベントを追加
     * ※返信用の入力フォームが用意されるエレメントは最初空で、返信ボタンをクリックした際にDOM挿入が行われる
     */
    const replyButtonEventListener = e => {
        const messageNum = e.currentTarget.querySelector("a[nn]").getAttribute("nn");
        const $parent = document.getElementById("re" + messageNum);
        const preview = new talkPreview($parent, option);

        $parent.appendChild(preview.$previewToggle);
        $parent.appendChild(preview.$previewBlock);

        e.currentTarget.removeEventListener('click', replyButtonEventListener);
    };

    document.querySelectorAll('a.RE').forEach($button => {
        $button.parentNode.addEventListener('click', replyButtonEventListener);
    });
}