FlowRouter.route('/game/:gameId', {
    action: function(params, queryParams) {
        BlazeLayout.render("mainLayout", {content: "loading"});
        Meteor.call("gameExists", params.gameId, function(error, exists) {
            if(exists) {
                Meteor.subscribe("game", FlowRouter.getParam("gameId"), function() {
                    BlazeLayout.render("mainLayout", {content: "game"});
                });
                //Meteor.call("newGame", params.gameId);
            } else {
                BlazeLayout.render("mainLayout", {content: "invalid_game"});
            }
        });
    }
});
FlowRouter.route('/', {
    action: function() {
        BlazeLayout.render("mainLayout", {content: "index"});
    }
});
FlowRouter.route('/login', {
    action: function() {
        BlazeLayout.render("mainLayout", {content: "atForm"})
    }
});