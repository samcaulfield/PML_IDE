
define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var HighlightRules = require("./pml_highlight_rules").HighlightRules;
var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
var FoldMode = require("./folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = HighlightRules;
    this.foldingRules = new FoldMode();
    this.$behaviour = new CstyleBehaviour();
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "//";
    this.blockComment = {start: "/*", end: "*/", nestable: true};
    
    this.$id = "ace/mode/pml"
}).call(Mode.prototype);

exports.Mode = Mode;
});
