AccountsTemplates.configure({
    onSubmitHook: function(error, state) {
        if(!error) {
            if(state === "signIn") {
                Materialize.toast('Successfully signed in!', 4000);
            } else if(state === "signUp") {
                Materialize.toast('Successfully signed up!', 4000)
            }
            $('#modalLogin').closeModal();
        }
    }
});