layoutChanged = new Tracker.Dependency;
windowChanged = new Tracker.Dependency;
Template.dash.onRendered(function() {
    var pstyle = 'padding: 5px;';
    $('#layout').w2layout({
        name: 'layout',
        padding: 5,
        resizer: 5,
        panels: [
            { type: 'main', minSize: ($(window).width() * 0.5) | 0,size: 200, style: pstyle, content: "<div id='game-pane'></div>" },
            { type: 'right', minSize: 0, resizable: true, style: pstyle, content: "<div id='rightPane'></div>" }
        ]
    });

    $(window).resize(function() {
        windowChanged.changed();
    });
    startLayoutListener();
    this.autorun(function() {
        w2ui.layout.off('resize');
        layoutChanged.depend();
        var size = w2ui.layout.get('right').size;
        if(size < $(window).width() * 0.15 && size !== 0) {
            w2ui.layout.set('right', {size: 0});
        }
        startLayoutListener();
    });
    this.autorun(function() {
        windowChanged.depend();
        w2ui.layout.set('main', {minSize: ($(window).width() * 0.5) | 0});
    });
    w2ui.layout.on('resizing', _.throttle(function(event) {
        var size = w2ui.layout.get('right').size - event.diff_x;
        if(size < $(window).width() * 0.15 && size !== 0) {
            $('.w2ui-resizer').css('background-color', '#333333');
        } else {
            $('.w2ui-resizer').css('background-color', '');
        }
    }, 50));

    Meteor.subscribe('game', 'test', {
        onReady: function() {
            Blaze.renderWithData(Template.game, {gameId: 'test'}, $('#game-pane')[0]);
            // TODO need to unsubscribe
        }
    });
});

function startLayoutListener() {
    w2ui.layout.on('resize', function(event) {
        $('.w2ui-resizer').css('background-color', '');
        var size = w2ui.layout.get('right').size;
        if(size < $(window).width() * 0.15 && size !== 0) {
            w2ui.layout.set('right', {size: 0});
            return;
        }

        event.onComplete = function() {
            layoutChanged.changed();
        };
    });
}