"use strict";
var vocab;
var run = [{"trad":"鐵","simp":"铁","pinyin":"tiě","gcr":"tiet","definition":"iron"}]
var cur = 0;
var lastWrong = false;
var incorrect = [];
var charFormat = {primary:"trad",secondary:"simp"};
var hidden = {entry: false, hint: true, answer: true, "alt-pinyin": true, "alt-char": true};
var disabled = {"show": false, previous: true, show_hint: false, correct: true, incorrect: true};

var showAns = function () {
  hidden = {entry: false, hint: false, answer: false, "alt-pinyin": false, "alt-char": false};
  $("#hint").removeClass("invisible");
  $("#answer").removeClass("invisible");
  $("#alt-pinyin").removeClass("invisible");
  $("#alt-char").removeClass("invisible");
  disabled = {"show": true, previous: true, show_hint: true, correct: false, incorrect: false};
  $("#show").prop( "disabled", true );
  $("#show_hint").prop( "disabled", true );
  $("#previous").prop( "disabled", true );
  $("#correct").prop( "disabled", false );
  $("#incorrect").prop( "disabled", false );
};
var hideAns = function () {
  hidden = {entry: false, hint: true, answer: true, "alt-pinyin": true, "alt-char": true};
  $("#hint").addClass("invisible");
  $("#answer").addClass("invisible");
  $("#alt-pinyin").addClass("invisible");
  $("#alt-char").addClass("invisible");
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
}
var showLast = function () {
  if(cur > 0) cur--;
  displayItem(run[cur]);
  showAns();
  if(lastWrong) incorrect.pop();
}

var enableButtons = function () {
  $("#show").on("click", showAns);
  $("#show_hint").on("click", function () {
    hidden.hint = false
    $("#hint").removeClass("invisible");
    disabled.show_hint = true
    $(this).prop( "disabled", true );
  });
  $("#correct").on("click", function () {
    lastWrong = false;
    showNext();
  });
  $("#incorrect").on("click",function () {
    incorrect.push(run[cur]);
    lastWrong = true;
    showNext();
  });
  $("#previous").on("click",showLast);
  $("#toggle_format").on("click",function () {
    charFormat = {primary: charFormat.secondary, secondary: charFormat.primary};
    displayItem(run[cur]);
  });
  $("#review_all").on("click",function () {
    $("#summary").html("<p>Last run: " + run.length + " items, " + incorrect.length + " incorrect</p>" +
      "<p>Reviewing the entire list<p>"
    );
    run = _.shuffle(vocab);
    begin_run();
  });
  $("#review_incorrect").on("click",function () {
    $("#summary").html("<p>Last run: " + run.length + " items, " + incorrect.length + " incorrect</p>" +
      "<p>Reviewing those missed<p>"
    );
    run = _.shuffle(incorrect);
    begin_run();
  });
};

var respond = function(name) {
  if(!disabled[name]) {
    $("#" + name).trigger("click");
  }
}
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
  $("#answer").children("span").html(obj.pinyin);
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

});
