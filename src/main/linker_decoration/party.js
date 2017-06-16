export default option => {
    const $container = document.getElementsByClassName("LST").item(0);
    $container.querySelectorAll("tr[dn='1'][align='center']").forEach($linker => {
        const $target = $linker.nextElementSibling.children[0];
        // 線グラフの高さ変更
        $target.querySelectorAll('img').forEach($img => { $img.setAttribute("height", "10"); });
        let html = $target.innerHTML;
        
        // ステータス文字に色付け
        html = html.replace(/ST:\d+/, '<span class="hjst-status-decoration-st">$&</span>');
        html = html.replace(/AG:\d+/, '<span class="hjst-status-decoration-ag">$&</span>');
        html = html.replace(/DX:\d+/, '<span class="hjst-status-decoration-dx">$&</span>');
        html = html.replace(/IN:\d+/, '<span class="hjst-status-decoration-in">$&</span>');
        html = html.replace(/VT:\d+/, '<span class="hjst-status-decoration-vt">$&</span>');
        html = html.replace(/MN:\d+/, '<span class="hjst-status-decoration-mn">$&</span>');
        
        $target.innerHTML = html;
    });
}