import serifPreview from './serif_preview.js';

export default option => {
    // セリフフォームを取得
    const $serifList = document.querySelectorAll("tr.LG");

    $serifList.forEach($tr => {
        const $parent = $tr.querySelector('td');
        const preview = new serifPreview($parent, option);
        
        let $table = document.createElement('table');
        $table.appendChild(preview.$previewToggle);
        $table.appendChild(preview.$previewBlock);
        $parent.appendChild($table);
    });
}