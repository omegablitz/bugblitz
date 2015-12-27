FlowRouter.route('/game/:gameId', {
    action: function(params, queryParams) {
        console.log("on game:", params.gameId);
    }
});