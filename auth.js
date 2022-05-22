//const express=require('express');
const {Issuer,generators}=require("openid-client");

//import { Issuer } from 'openid-client';
//import { generators } from 'openid-client';

//var app=express();
//const port=80;

var client = null;
var code_verifier = null;



async function retrieveConnectionURL(res) {
  const issuer = await Issuer.discover('https://keycloak.local.rezel.net/auth/realms/servers/');
    //console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);
    
    const client = new issuer.Client({
        client_id: 'sporticus',
        client_secret: 'VT5UPMZpjQ2FL7BLNa2e3QF7Xh3SnsX1',
        redirect_uris: ['http://localhost:80/cb'], // TODO : à changer !!! 
        //redirect_uris: ['https://sporticus.rezel.net/cb'], 
        response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
        // token_endpoint_auth_method (default "client_secret_basic")
      }); // => Client
    
    //console.log(client);
    
    
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    
    let url = client.authorizationUrl({
      scope: 'openid email profile',
      resource: 'https://my.api.example.com/resource/32178',
      code_challenge,
      code_challenge_method: 'S256',
    });
    
    res.redirect(url.toString());

    app.get('/cb', (req, res) => {
      console.log("Req received");
      const params = client.callbackParams(req);
      
      (async(params) => {
        const tokenSet = await client.callback('http://localhost:80/cb', params, { code_verifier });
        var access_token  = tokenSet.access_token;
        var refresh_token = tokenSet.refresh_token;
        const userinfo = await client.userinfo(access_token);
        console.log('userinfo %j', userinfo);
      })(params); 
      res.redirect('/')
    })
}

exports.retrieveConnectionURL = retrieveConnectionURL;
exports.code_verifier = code_verifier;
exports.client = client;


/*
(async()=>{


    const issuer = await Issuer.discover('https://keycloak.local.rezel.net/auth/realms/servers/');
    //console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);
    
    const client = new issuer.Client({
        client_id: 'sporticus',
        client_secret: 'VT5UPMZpjQ2FL7BLNa2e3QF7Xh3SnsX1',
        redirect_uris: ['http://localhost:80/cb'], // TODO : à changer !!! 
        //redirect_uris: ['https://sporticus.rezel.net/cb'], 
        response_types: ['code'],
        // id_token_signed_response_alg (default "RS256")
        // token_endpoint_auth_method (default "client_secret_basic")
      }); // => Client
    
    //console.log(client);
    
    
    code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    
    let url = client.authorizationUrl({
      scope: 'openid email profile',
      resource: 'https://my.api.example.com/resource/32178',
      code_challenge,
      code_challenge_method: 'S256',
    });
    
    opn(url);
    //console.log(url);

    



app.get('/cb', (req, res) => {
  console.log("Req received");
  const params = client.callbackParams(req);
  
  (async(params) => {
    const tokenSet = await client.callback('http://localhost:80/cb', params, { code_verifier });
    var access_token  = tokenSet.access_token;
    var refresh_token = tokenSet.refresh_token;
    const userinfo = await client.userinfo(access_token);
    console.log('userinfo %j', userinfo);
  })(params); 
  res.redirect('/')
})

})();
*/

/*
app.get('/', (req, res) => {
  res.send("HELLO");
})

app.listen(port, () => {

})
*/











