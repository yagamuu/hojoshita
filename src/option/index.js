import common from '../common.js';

// 初期表示
chrome.storage.sync.get(common.getOptionDefault(), option => {
    for (let key of Object.keys(option.checkbox)) {
        if (option.checkbox[key]) document.getElementById(key).checked = true;
    }
});

// 更新
document.getElementById('put').addEventListener('click', () => {
    let option = common.getOptionDefault();
    document.querySelectorAll("input[type=checkbox]").forEach($element => {
        option.checkbox[$element.id] = $element.checked ? true : false;
    });
    
    common.setStorage(option);
});