/**
 * Created by Aashish on 2/25/2016.
 */
AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: false,
    lowercaseUsername: false,
    focusFirstInput: true,

    // Appearance
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: true,
    showResendVerificationEmailLink: false
});

var email = AccountsTemplates.removeField('email');
var pwd = AccountsTemplates.removeField('password');

AccountsTemplates.addField({
    _id: 'username',
    type: 'text',
    required: true,
    errStr: 'user does not exist',
    func: function(value) {
        if (Meteor.isClient) {
            console.log("Validating username...");
            var self = this;
            Meteor.call("userExists", value, function(err, userExists){
                if (!userExists) {
                    console.log("user does not exist");
                    self.setSuccess();
                }
                else {
                    console.log("user exist");
                    self.setError(userExists);
                    //self.setSuccess();
                }
                self.setValidating(false);
            });
            return;
        }
        // Server
        return Meteor.call("userExists", value);
    }
});

AccountsTemplates.addField(email);
AccountsTemplates.addField(pwd);