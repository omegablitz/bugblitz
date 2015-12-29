FlowRouter.route('/game/:gameId', {
    action: function(params, queryParams) {
        console.log("on game:", params.gameId);
        BlazeLayout.render("mainLayout", {content: "game"});
    }
});
FlowRouter.route('/', {
    action: function() {
        BlazeLayout.render("mainLayout", {content: "index"});
    }
});