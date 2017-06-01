import common from '../common.js';

//更新
document.getElementById('put').addEventListener('click', () => {
    let option = common.getOptionDefault();
    option.enableSerifPreview = document.getElementById('serif_preview').checked ? true : false;
    
    common.setStorage(option);
});