Template.dash.onRendered(function() {
    var pstyle = 'opacity: 0.2; padding: 5px;';
    $('#layout').w2layout({
        name: 'layout',
        padding: 5,
        resizer: 5,
        panels: [
            { type: 'main', size: 200, style: pstyle, content: 'main' },
            { type: 'right', resizable: true, style: pstyle, content: 'right' }
        ]
    });
});