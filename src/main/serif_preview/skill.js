import serifPreview from './class/serif_preview_class.js';

export default option => {
    // セリフフォームを取得
    const $serifList = document.querySelectorAll("tr.SED");

    $serifList.forEach($tr => {
        const $parent = $tr.querySelector('td');
        const preview = new serifPreview($parent, option);
        
        let $table = document.createElement('table');
        $table.appendChild(preview.$previewToggle);
        $table.appendChild(preview.$previewBlock);
        $parent.appendChild($table);
    });
}