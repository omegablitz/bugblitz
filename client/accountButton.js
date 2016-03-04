/**
 * Created by Aashish on 3/3/2016.
 */
Template.accountButton.helpers({
    text: function(){
        var key = Meteor.userId() ? AccountsTemplates.texts.navSignOut : AccountsTemplates.texts.navSignIn;
        return T9n.get(key, markIfMissing=false);
    }
});

Template.accountButton.events({
    'click #at-nav-button': function(event){
        event.preventDefault();
        if (Meteor.userId())
            AccountsTemplates.logout();
        else
            FlowRouter.go('/login');
    }
});