/**
 * Created by Aashish on 3/2/2016.
 */
Meteor.methods({
    "userExists": function(username){
        return !!Meteor.users.findOne({username: username});
    }
});

Accounts.onCreateUser(function(options, user) {
    user.profile = {};
    if(user.services.google) {
        user.email = user.services.google.email;
        user.profile.username = user.services.google.name;
        return user;
    }

    if(user.services.facebook) {
        user.email = user.services.facebook.email;
        user.profile.username = user.services.facebook.name;
        return user;
    }
    user.email = user.emails[0].address;

    Accounts.emailTemplates.from = 'Omegablitz Support <support@omegablitz.com>';

    // The public name of your application. Defaults to the DNS name of the application (eg: awesome.meteor.com).
    Accounts.emailTemplates.siteName = 'Omegablitz';

    // A Function that takes a user object and returns a String for the subject line of the email.
    Accounts.emailTemplates.verifyEmail.subject = function(user) {
        return 'Confirm Your Email Address';
    };

    // A Function that takes a user object and a url, and returns the body text for the email.
    // Note: if you need to return HTML instead, use Accounts.emailTemplates.verifyEmail.html
    Accounts.emailTemplates.verifyEmail.text = function(user, url) {
        return 'Click on the following link to verify your email address: ' + url;
    };
    // we wait for Meteor to create the user before sending an email
    Meteor.setTimeout(function() {
        Accounts.sendVerificationEmail(user._id);
    }, 10 * 1000);

    return user;
});