// Created by Aashish on 3/29/2016.

Template.accountDropdown.helpers({
    status: function() {
        if(Meteor.loggingIn()) {
            return "Logging In...";
        }
        if(!Meteor.user()) {
            return "Sign In"
        } else {
            return Meteor.user().profile.username;
        }
    },

    loggedOn: function() {
        return !!Meteor.user()
    },

    picture: function() {
        if(Meteor.user() && Meteor.user().profile.picture) {
            return Meteor.user().profile.picture;
        }
    }
});

Template.accountDropdown.events({
    "click #signout": function() {
        Meteor.logout();
    }
});