"use strict";
var _ = window._;
var $ = window.$;
var vocab;
var run = [{"trad":"鐵","simp":"铁","pinyin":"tiě","gcr":"tiet","definition":"iron"}];
var cur = 0;
var lastWrong = false;
var incorrect = [];
var charFormat = {primary:"trad",secondary:"simp"};
var hidden = {entry: false, hint: true, answer: true, "alt-pinyin": true, "alt-char": true};
var disabled = {"show": false, previous: true, show_hint: false, correct: true, incorrect: true};

var showAns = function () {
  hidden = {entry: false, hint: false, answer: false, "alt-pinyin": false, "alt-char": false};
  $(".hint").removeClass("invisible");
  $(".answer").removeClass("invisible");
  disabled = {"show": true, previous: true, show_hint: true, correct: false, incorrect: false};
  $("#show").prop( "disabled", true );
  $("#show_hint").prop( "disabled", true );
  $("#previous").prop( "disabled", true );
  $("#correct").prop( "disabled", false );
  $("#incorrect").prop( "disabled", false );
};
var hideAns = function () {
  hidden = {entry: false, hint: true, answer: true, "alt-pinyin": true, "alt-char": true};
  $(".hint").addClass("invisible");
  $(".answer").addClass("invisible");
  disabled = {"show": false, show_hint: false,previous: false,  correct: true, incorrect: true};
  $("#show").prop( "disabled", false );
  $("#show_hint").prop( "disabled", false );
  $("#previous").prop( "disabled", false );
  $("#correct").prop( "disabled", true );
  $("#incorrect").prop( "disabled", true );
};
var showNext = function () {
  if(++cur < run.length){
    hideAns();
    displayItem(run[cur]);
  } else {
    $("#summary").html(run.length + " items, " + incorrect.length + " incorrect");
    $("#restart").removeClass("latent");
  }
};
var showLast = function () {
  if(cur > 0) cur--;
  displayItem(run[cur]);
  showAns();
  if(lastWrong) incorrect.pop();
};

var enableButtons = function () {
  $("#container").delegate("button", "click", function(e){
    buttonHandlers[this.id]();
  });
};

var altDisplay;
var listing = {
  stimulus: "characters",
  response: "pinyin"
};
var switchDisplay = function () {
  var oldDisplay = $("#display").html();
  $("#display").html(altDisplay);
  altDisplay = oldDisplay;
  listing = {
    stimulus: listing.response,
    response: listing.stimulus
  };
  $("#toggle_display").html("Prompt with " + listing.response);
  displayItem(run[cur]);
  showAns();
};

var buttonHandlers = {
  show: showAns,
  show_hint: function () {
    hidden.hint = false;
    $(".hint").removeClass("invisible");
    disabled.show_hint = true;
    $("#show_hint").prop( "disabled", true );
  },
  correct: function () {
    lastWrong = false;
    showNext();
  },
  incorrect: function () {
    incorrect.push(run[cur]);
    lastWrong = true;
    showNext();
  },
  previous: showLast,
  toggle_format: function () {
    charFormat = {primary: charFormat.secondary, secondary: charFormat.primary};
    var secondaryName =
      charFormat.secondary === "trad" ?
      "traditional" : "simplified";
    $("#toggle_format").html(
      "Switch to " + secondaryName + " characters"
    );
    displayItem(run[cur]);
  },
  review_all: function () {
    $("#summary").html("<p>Last run: " + run.length + " items, " + incorrect.length + " incorrect</p>" +
      "<p>Reviewing the entire list<p>"
    );
    run = _.shuffle(vocab);
    begin_run();
  },
  review_incorrect: function () {
    $("#summary").html("<p>Last run: " + run.length + " items, " + incorrect.length + " incorrect</p>" +
      "<p>Reviewing those missed<p>"
    );
    run = _.shuffle(incorrect);
    begin_run();
  },
  toggle_display: switchDisplay
};

var respond = function(name) {
  if(!disabled[name]) {
    $("#" + name).trigger("click");
  }
};
var enableKeyShortcuts = function () {
    $(document).keydown(function (e) {
    switch(e.which){
    case 32:
      e.preventDefault();
      respond("show");
    break;
    case 66:
    case 98:
      e.preventDefault();
      respond("show_hint");
    break;
    case 8:
      e.preventDefault();
      respond("previous");
    break;
    case 86:
    case 118:
      e.preventDefault();
      respond("correct");
    break;
    case 78:
      e.preventDefault();
      respond("incorrect");
    break;
    }
  });
};

var displayItem = function (obj) {
  $("#entry").children("span").html(obj[charFormat.primary]);
  $("#hint").children("span").html(obj.definition);
  $("#pinyin").children("span").html(obj.pinyin);
  $("#alt-pinyin").children("span").html(obj.gcr);
  $("#alt-char").children("span").html(obj[charFormat.secondary]);
};

var begin_run = function () {
  cur = 0;
  incorrect = [];
  hideAns();
  $("#previous").prop( "disabled", true );
  disabled.previous = true;
  $("#restart").addClass("latent");
  displayItem(run[cur]);
}

var loadList =  $.get("assets/js/imb_v.json", function (data) {
  vocab = $.parseJSON(data);
});

var doc_ready = $.Deferred();
$(doc_ready.resolve);

$.when(loadList, doc_ready)
.then(function () {
  run = _.shuffle(vocab);
  begin_run();

  enableButtons();
  enableKeyShortcuts();
  altDisplay = $("#prompt-pinyin").html();
});
