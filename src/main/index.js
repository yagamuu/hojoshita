import common from '../common.js';
import charaSerifPreview from './chara_serif_preview.js';
import skillSerifPreview from './skill_serif_preview.js';
import linkSerifPreview from './link_serif_preview.js';
import talkSerifPreview from './talk_serif_preview.js';

chrome.storage.sync.get(common.getOptionDefault(), (option) => {
    if (option.enableSerifPreview) {
        if (common.path("/kk/a_chara.php")) 
            charaSerifPreview(option);
        else if (common.path("/kk/a_skill.php")) 
            skillSerifPreview(option);
        else if (common.path("/kk/a_party.php")) 
            linkSerifPreview(option);
        else if (common.path("/kk/a_talk.php")) 
            talkSerifPreview(option);
    }
});