// TODO add fastrouter support
// TODO fix this to accommodate new layout

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
                BlazeLayout.render("mainLayout", {content: "invalidGame"});
            }
        });
    }
});
FlowRouter.route('/', {
    action: function() {
        FlowRouter.go("/dash");
    }
});
FlowRouter.route('/login', {
    triggersEnter: [function(context, redirect) {
        if(Meteor.loggingIn() || Meteor.user()) {
            redirect('/')
        }
    }],

    action: function() {
        BlazeLayout.render("mainLayout", {content: "atForm"});
    }
});

FlowRouter.route('/dash', {
    action: function() {
        BlazeLayout.render("dash");
    }
});

FlowRouter.route('/players', {
   action: function() {
       BlazeLayout.render("mainLayout", {content: "players"});
   }
});