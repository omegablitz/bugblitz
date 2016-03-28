Template.dash.onRendered(function() {
    var pstyle = 'padding: 5px;';
    $('#layout').w2layout({
        name: 'layout',
        padding: 5,
        resizer: 5,
        panels: [
            { type: 'main', size: 200, style: pstyle, content: "<div id='game-pane'></div>" },
            { type: 'right', resizable: true, style: pstyle, content: "<div id='rightPane'></div>" }
        ]
    });
    Meteor.subscribe('game', '1', {
        onReady: function() {
            console.log("subscribed, attempting to add listener to w2");
            Blaze.renderWithData(Template.game, {gameId: '1'}, $('#game-pane')[0]);
            // TODO need to unsubscribe
        }
    });

});