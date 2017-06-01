import common from '../common.js';
import charaSerifPreview from './chara_serif_preview.js';
import skillSerifPreview from './skill_serif_preview.js';

chrome.storage.sync.get(common.getOptionDefault(), (option) => {
    if (option.enableSerifPreview) {
        if (common.path("/kk/a_chara.php")) {
            charaSerifPreview(option);
        }
        else if (common.path("/kk/a_skill.php")) {
            skillSerifPreview(option);
        }
    }
});