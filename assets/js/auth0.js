webAuth = new auth0.WebAuth({
    domain: 'slogans.auth0.com',
    clientID: 'KvRHjbjqF7kjvpm3jnXixUcazvGbVO7k',
    redirectUri: window.location.href,
    audience: 'https://slogans/',
    responseType: 'token id_token',
    scope: 'openid profile'
});

function login() {
    if (!isAuthenticated()) {
        webAuth.authorize();
    }
}

function setSession(authResult, callback) {
    // Set the time that the access token will expire at
    var expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('picture', authResult.idTokenPayload.picture);
    callback();
}

function logout() {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    location.reload();
}

function isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
}


function handleAuthentication(callback) {
    this.webAuth.parseHash(function (err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
            setSession(authResult, callback);
        } else if (err) {
            console.log(err);
            alert(
                'Error: ' + err.error + '. Check the console for further details.'
            );
        }
    });
}