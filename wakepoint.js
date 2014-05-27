var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

window.wakepoint = (function() {
  function wakepoint(options) {
    this.sAnim = __bind(this.sAnim, this);
    this.sun = __bind(this.sun, this);
    this.showSection = __bind(this.showSection, this);
    this.timeBuffer = __bind(this.timeBuffer, this);
    this.targetTimeToday = __bind(this.targetTimeToday, this);
    this.youWon = __bind(this.youWon, this);
    this.youLose = __bind(this.youLose, this);
    this.isWinner = __bind(this.isWinner, this);
    this.checkProgress = __bind(this.checkProgress, this);
    this.today = __bind(this.today, this);
    this.checkIn = __bind(this.checkIn, this);
    this.decodeTarget = __bind(this.decodeTarget, this);
    this.saveSettings = __bind(this.saveSettings, this);
    this.updateUI = __bind(this.updateUI, this);
    this.buffer = options.buffer || 10;
    this.target = options.target || {
      hour: 12,
      minute: 0
    };
    this.events = options.events || [];
    this.streak = options.streak || this.events.length;
    $('.show_settings').click((function(_this) {
      return function() {
        return _this.showSection('.settings');
      };
    })(this));
    $('.show_stats').click((function(_this) {
      return function() {
        return _this.showSection('.stats');
      };
    })(this));
    $('.show_main').click((function(_this) {
      return function() {
        return _this.showSection('.main');
      };
    })(this));
    $('.sun').click((function(_this) {
      return function() {
        return $('section').slideUp('slow');
      };
    })(this));
    $('.checkin .goal').click((function(_this) {
      return function() {
        return _this.checkIn();
      };
    })(this));
    $('.settings .save').click((function(_this) {
      return function() {
        _this.saveSettings();
        return _this.showSection('.main');
      };
    })(this));
    this.checkProgress();
    this.updateUI();
    this.sun();
  }

  wakepoint.prototype.updateUI = function() {
    var event, html, target_time, _i, _len, _ref;
    target_time = this.decodeTarget();
    $('span.target_time').text(" " + target_time + " ");
    $('.settings input.target_time').val(target_time);
    _ref = this.events.reverse();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      event = _ref[_i];
      $('.stats ul').empty();
      html = "<li>" + new Date(event.time) + "</li>";
      $('.stats ul').append(html);
    }
    return $('.streak_count').text(this.streak + ' day streak');
  };

  wakepoint.prototype.saveSettings = function() {
    var hour, minute, target;
    this.target = $('.settings input.target_time').val();
    target = this.target.split(':');
    minute = parseInt(target[1].substr(0, 2), 10);
    hour = parseInt(target[0], 10);
    if (target[1].toLowerCase().indexOf('pm') !== -1) {
      hour = hour + 12;
    } else {
      if (hour === 12) {
        hour = 0;
      }
    }
    if (hour < 0 && hour > 23) {
      hour = void 0;
    }
    if (minute < 0 && minute > 59) {
      minute = void 0;
    }
    if (hour !== void 0 && minute !== void 0) {
      localStorage['target'] = JSON.stringify(this.target = {
        hour: hour,
        minute: minute
      });
    } else {
      console.log('BAD BAD');
    }
    this.checkProgress();
    return this.updateUI();
  };

  wakepoint.prototype.decodeTarget = function() {
    return (this.target.hour > 12 ? this.target.hour - 12 : this.target.hour) + ":" + (this.target.minute < 10 ? "0" + this.target.minute : this.target.minute) + (this.target.hour > 12 ? "pm" : "am");
  };

  wakepoint.prototype.checkIn = function() {
    var comment, event, today;
    today = this.today();
    comment = $('.checkin .comment').val();
    event = {
      datenum: today.datenum,
      time: today.time,
      dayofweek: today.date.getDay(),
      day: today.day,
      month: today.month,
      year: today.year,
      comment: comment
    };
    this.events.push(event);
    localStorage['events'] = JSON.stringify(this.events);
    if (localStorage['longest streak'] < this.events.length) {
      localStorage['longest streak'] = this.events.length;
    }
    return $('.checkin').fadeOut('slow', function() {
      return $('.winner').fadeIn();
    });
  };

  wakepoint.prototype.today = function() {
    var today;
    today = {};
    today.date = new Date();
    today.year = today.date.getFullYear();
    today.month = today.date.getMonth() + 1;
    today.day = today.date.getDate();
    if (today.month < 10) {
      today.month = "0" + today.month;
    }
    if (today.day < 10) {
      today.day = "0" + today.day;
    }
    today.datenum = "" + today.year + today.month + today.day;
    today.time = today.date.getTime();
    return today;
  };

  wakepoint.prototype.checkProgress = function() {
    var today;
    today = this.today();
    if (!this.isWinner() && (today.time > this.targetTimeToday() + this.timeBuffer()) && this.events.length > 0) {
      $('.late').fadeIn();
      this.youLose();
    } else if (!this.isWinner() && (today.time > this.targetTimeToday() + this.timeBuffer()) && this.events.length === 0) {
      $('.firstday').fadeIn();
    } else if (!this.isWinner() && today.time < this.targetTimeToday() - this.timeBuffer()) {
      $('.early').fadeIn();
    } else if (this.isWinner()) {
      $('.winner').fadeIn();
      this.youWon();
    } else {
      $('.checkin').fadeIn();
    }
    return this.showSection('.main');
  };

  wakepoint.prototype.isWinner = function() {
    return this.events.length > 0 && (this.events[this.events.length - 1].datenum === this.today().datenum);
  };

  wakepoint.prototype.youLose = function() {
    return localStorage['events'] = JSON.stringify(this.events = []);
  };

  wakepoint.prototype.youWon = function() {
    return $('.winner img').addClass('spin');
  };

  wakepoint.prototype.targetTimeToday = function() {
    var now;
    now = new Date();
    return new Date((now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear()).getTime() + (this.target.hour * 3600000) + (this.target.minute * 60000);
  };

  wakepoint.prototype.timeBuffer = function() {
    return this.buffer * 60000;
  };

  wakepoint.prototype.showSection = function(section) {
    return $('section').not(section).slideUp('slow', (function(_this) {
      return function() {
        return $(section).slideDown('slow');
      };
    })(this));
  };

  wakepoint.prototype.sun = function() {
    var n, _i, _results;
    _results = [];
    for (n = _i = 0; _i <= 25; n = ++_i) {
      $('.sun').append('<div id="s' + n + '" style="left:' + n * 5 + '0px" class="s"></div>');
      $('#s' + n).css({
        top: -600
      }).animate({
        top: 0
      }, 2000 + n * 20);
      _results.push(this.sAnim(n));
    }
    return _results;
  };

  wakepoint.prototype.sAnim = function(n) {
    var s;
    s = 500 + Math.abs((this.today().time - this.targetTimeToday()) / 1000) + n * 10;
    return $('#s' + n).animate({
      top: '-=100'
    }, s).animate({
      top: '+=100'
    }, s, (function(_this) {
      return function() {
        return _this.sAnim(n);
      };
    })(this));
  };

  return wakepoint;

})();

$(document).ready(function() {
  var events, target;
  if (localStorage['events']) {
    events = JSON.parse(localStorage['events']);
  }
  if (localStorage['target']) {
    target = JSON.parse(localStorage['target']);
  }
  return window.wakepoint = new window.wakepoint({
    events: events,
    target: target
  });
});
