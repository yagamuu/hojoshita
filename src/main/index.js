import common from '../common.js';
import charaSerifPreview from './serif_preview/chara_serif_preview.js';
import skillSerifPreview from './serif_preview/skill_serif_preview.js';
import linkSerifPreview from './serif_preview/link_serif_preview.js';
import talkSerifPreview from './serif_preview/talk_serif_preview.js';

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