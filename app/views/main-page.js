var frameModule = require('tns-core-modules/ui/frame');

exports.loaded = function(args) {
    page = args.object;
    page.actionBarHidden = true;
}

exports.play = function() {
    var nav = {
        moduleName: "views/players/player",
        transition: {
            name: "slideBottom"
        }
    };
    frameModule.Frame.topmost().navigate(nav);
}