export default option => {
    const $container = document.getElementsByClassName("LST").item(0);
    $container.querySelectorAll("tr:not(.B2)").forEach($linker => {
        const $target = $linker.children[4];
        // 線グラフの高さ変更
        $target.querySelectorAll('img').forEach($img => { $img.setAttribute("height", "10"); });
        let html = $target.innerHTML;
        
        // ステータス文字に色付け
        html = html.replace(/ST:\d+/, '<span class="R2B">$&</span>');
        html = html.replace(/AG:\d+/, '<span class="Y2B">$&</span>');
        html = html.replace(/DX:\d+/, '<span class="G2B">$&</span>');
        html = html.replace(/IN:\d+/, '<span class="B2B">$&</span>');
        html = html.replace(/VT:\d+/, '<span class="P2B">$&</span>');
        html = html.replace(/MN:\d+/, '<span class="B2B">$&</span>');
        
        $target.innerHTML = html;
    });
}