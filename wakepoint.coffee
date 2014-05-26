class window.wakepoint
  constructor: (options) ->
    @buffer = options.buffer || 10  # ten minute buffer
    @target = options.target || { hour: 12, minute: 0 }
    @events = options.events || []
    @streak = options.streak + @events.length

    # Nav ---------
    $('.show_settings').click () => @showSection('.settings')
    $('.show_stats').click () => @showSection('.stats')
    $('.show_main').click () => @showSection('.main')
    $('.sun').click () => $('section').slideUp('slow')

    # Check In --------
    $('.checkin .goal').click(() => @checkIn())

    # Settings --------
    $('.settings .save').click(() => @saveSettings())
    $('.settings .time').val(@decodeTarget())

    # Streak --------
    for event in @events.reverse()
      html = "<li>" + new Date(event.time) + "</li>"
      $('.streak ul').append html

    @checkProgress()
    @sun()

  saveSettings: =>
    @target = $('.settings .time').val()

    target = @target.split(':')
    minute = parseInt(target[1].substr(0,2), 10)
    hour = parseInt(target[0], 10)

    if target[1].toLowerCase().indexOf('pm') != -1
      hour = hour + 12
    else
      if hour == 12
        hour = 0

    if hour < 0 && hour > 23 # Validate hour
      hour = undefined
    if minute < 0 && minute > 59 # Validate minute
      minute = undefined

    if hour != undefined && minute != undefined
      localStorage['target'] = JSON.stringify(@target =
        hour: hour
        minute: minute
      )
    else
      console.log 'BAD BAD'

  decodeTarget: =>
    (if @target.hour > 12 then @target.hour - 12 else @target.hour) + ":" + (if @target.minute < 10 then "0" + @target.minute else @target.minute) + (if @target.hour > 12 then "pm" else "am")

  checkIn: =>
    today = @today()
    comment = $('.checkin .comment').val()
    event =
      datenum: today.datenum
      time: today.time
      dayofweek: today.date.getDay()
      day: today.day
      month: today.month
      year: today.year
      comment: comment

    @events.push event

    localStorage['events'] = JSON.stringify(@events)
    if localStorage['longest streak'] < @events.length
      localStorage['longest streak'] = @events.length

    $('.checkin').fadeOut 'slow', -> $('.winner').fadeIn()

  today: =>
    today = {}
    today.date = new Date()
    today.year = today.date.getFullYear()
    today.month = today.date.getMonth() + 1
    today.day = today.date.getDate()

    if today.month < 10
      today.month = "0" + today.month
    if today.day < 10
      today.day = "0" + today.day

    today.datenum = "" + today.year + today.month + today.day
    today.time = today.date.getTime()
    today

  checkProgress: =>
    today = @today()

    # Late
    if !@isWinner() && ( today.time > @targetTimeToday() + @timeBuffer() ) && @events.length > 0
      $('.late').fadeIn()
      @youLose()

    # It's your first day
    else if !@isWinner() && ( today.time > @targetTimeToday() + @timeBuffer() ) && @events.length == 0
      $('.firstday').fadeIn()

    # Early
    else if !@isWinner() && today.time < @targetTimeToday() - @timeBuffer()
      $('.early').fadeIn()

    # You won today
    else if @isWinner()
      $('.winner').fadeIn()
      console.log 'here'
      @youWon()

    # On Time
    else
      $('.checkin').fadeIn()

    @showSection('.main')

  isWinner: =>
    @events.length > 0 && ( @events[@events.length-1].datenum == @today().datenum)

  youLose: =>
    # Reset Events / Streak
    localStorage['events'] = JSON.stringify(@events = [])

  youWon: =>
    $('.winner img').addClass 'spin'
    console.log 'YOU WON'

  targetTimeToday: =>
    now = new Date()
    new Date((now.getMonth()+1) + "/" + now.getDate() + "/" + now.getFullYear()).getTime() + ( @target.hour * 3600000 ) + ( @target.minute * 60000 )

  timeBuffer: =>
    @buffer * 60000

  showSection: (section) =>
    $('section').not(section).slideUp('slow', () => $(section).slideDown('slow') )

  sun: =>
    for n in [0..25]
      $('.sun').append('<div id="s'+n+'" style="left:'+n*5+'0px" class="s"></div>')
      $('#s'+n).css({top:-600}).animate({ top: 0 }, 2000+n*20)
      @sAnim(n)

  sAnim: (n) =>
    s = 500 + Math.abs((@today().time - @targetTimeToday()) / 1000) + n *10 #/
    $('#s'+n).animate({ top: '-=100' }, s).animate({ top: '+=100' }, s, () => @sAnim(n) )


$(document).ready ->
  if localStorage['events']
    events = JSON.parse(localStorage['events'])
  if localStorage['target']
    target = JSON.parse(localStorage['target'])

  window.wakepoint = new window.wakepoint
    events: events
    target: target
