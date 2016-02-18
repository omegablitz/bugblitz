Template.game.onCreated(function() {
    var self = this;
    self.autorun(function() {
        var gameId = FlowRouter.getParam('gameId');
        self.subscribe('games', gameId);
    });
});