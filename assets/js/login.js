window.addEventListener('load', function() {
    login();
    handleAuthentication(function () {
        window.location.replace('/');
    });
})