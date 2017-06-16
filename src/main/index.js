import common from '../common.js';

import charaSerifPreview from './serif_preview/chara.js';
import skillSerifPreview from './serif_preview/skill.js';
import linkSerifPreview from './serif_preview/link.js';
import talkSerifPreview from './serif_preview/talk.js';

import skillSort from './sort/skill.js';

import partyLinkerSort from './linker_sort/party.js';
import storyLinkerSort from './linker_sort/story.js';

import partyLinkerDecoration from './linker_decoration/party.js';
import storyLinkerDecoration from './linker_decoration/story.js';

chrome.storage.sync.get(common.getOptionDefault(), (option) => {
    if (option.checkbox.enableSerifPreview) {
        if (common.path("/kk/a_chara.php")) 
            charaSerifPreview(option);
        else if (common.path("/kk/a_skill.php")) 
            skillSerifPreview(option);
        else if (common.path("/kk/a_party.php")) 
            linkSerifPreview(option);
        else if (common.path("/kk/a_talk.php")) 
            talkSerifPreview(option);
    }
    if (option.checkbox.enableSkillSort) {
        if (common.path("/kk/a_skill.php")) 
            skillSort(option);
    }

    if (option.checkbox.enableLinkerSort) {
        if (common.path("/kk/a_party.php")) 
            partyLinkerSort(option);
        else if (common.path("/kk/a_story.php")) 
            storyLinkerSort(option);
    }

    if (option.checkbox.enableLinkerDecoration) {
        if (common.path("/kk/a_party.php")) 
            partyLinkerDecoration(option);
        else if (common.path("/kk/a_story.php")) 
            storyLinkerDecoration(option);
    }
});