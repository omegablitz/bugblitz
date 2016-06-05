/**
 * Created by Aashish on 3/29/2016.
 */
Template.loginButtons.onCreated(function() {
    this.googleStatus = new ReactiveVar("idle");
    this.facebookStatus = new ReactiveVar("idle");
});

Template.loginButtons.helpers({
    googleStatus: function() {
        switch(Template.instance().googleStatus.get()) {
            case "idle":
                return "/assets/google/web/1x/btn_google_signin_dark_normal_web.png";
            case "hover":
                return "/assets/google/web/1x/btn_google_signin_dark_focus_web.png";
            case "clicked":
                return "/assets/google/web/1x/btn_google_signin_dark_pressed_web.png";
        }
    },

    facebookStatus: function() {
        var fbButton = Template.instance().$('#facebookButton');
        switch(Template.instance().facebookStatus.get()) {
            case "idle":
                fbButton.css('border', '3px solid rgba(133, 153, 199, 0)');
                break;
            case "hover":
                fbButton.css('border', '3px solid rgba(133, 153, 199, 0.5)');
                break;
        }

        return "/assets/facebook/sign-in-resized-unbordered.png";
    }
});

Template.loginButtons.events({
    "mouseenter #googleButton": function() {
        Template.instance().googleStatus.set("hover")
    },

    "mouseleave #googleButton": function() {
        Template.instance().googleStatus.set("idle");
    },

    "mousedown #googleButton": function() {
        Template.instance().googleStatus.set("clicked");
    },

    "mouseup #googleButton": function() {
        Template.instance().googleStatus.set("hover")
    },

    "click #googleButton": function() {
        Template.instance().googleStatus.set("idle");
        Meteor.loginWithGoogle({loginStyle: "popup"});
    },

    "mouseenter #facebookButton": function() {
        Template.instance().facebookStatus.set("hover")
    },

    "mouseleave #facebookButton": function() {
        Template.instance().facebookStatus.set("idle");
    },

    "click #facebookButton": function() {
        Template.instance().facebookStatus.set("idle");
        Meteor.loginWithFacebook({loginStyle: "popup"});
    }
});