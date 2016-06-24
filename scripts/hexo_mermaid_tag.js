/**
 * Created by whiledoing on 6/24/16.
 */

hexo.extend.tag.register('mermaid', function(args, content){
    var mermaid_part = '<div class="mermaid">' + content + '</div>';

    // first para for config, if is center, then center pic
    var config = args.shift();
    if(config == 'center') {
        mermaid_part = '<center>' + mermaid_part + '</center>';
    }

    return mermaid_part;
}, {async: true, ends: true});
