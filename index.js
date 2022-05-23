const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const {Issuer,generators}=require("openid-client")
const upload = require('express-fileupload')
const fs = require('fs')
const path = require('path')

const event_images = require('./views/event_images')
const sport_images = require('./views/sport_images')



const app = express()
const port = 80
const images = require('./views/images')



// Middlewares
app.use(cookieParser());
app.use(expressLayouts)
app.use(upload())

// Fichiers statics
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/views')))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/scripts', express.static(__dirname +'public/scripts'))
app.use('/jsons', express.static(__dirname + 'public/jsons'))
app.use('/uploads', express.static(__dirname + 'public/uploads'))



app.set('view engine', 'ejs')
app.set('layout', './layouts/main-layout')

// Page principale
app.get('/', (req, res) => {
    res.render('home', { title:'Homo Sporticus', imagess:images})
})

// Liste des sports proposés
app.get('/sports', (req, res) => {
    res.render('sports', { title:'Sports',  sport_imagess: sport_images})
    
})


// Programme de liste
app.get('/programme', (req, res) => {
    res.render('program', { title:'Programme'})
})


// Evenements organises par la liste
app.get('/events', (req, res) => {
    res.render('events', {title: 'Events', event_imagess:event_images})
})

// Route de connexion
app.get('/connection', (req, res) => {

    retrieveConnectionURL(res);
})


// Page d'accès au profile utilisateur
app.get('/profile', (req, res) => {
    if(typeof req.cookies.SPORTICUS_CONNECTED === 'undefined'){
        res.redirect('/')
    } else {
        res.render('profile', {title: 'Profile'})
    }
    

})

// Upload du certificat
app.post('/profile' ,(req, res) => {
    if(req.files) {
        var file = req.files.file
        var filename = file.name.split(".")
        var username = req.cookies.SPORTICUS_CONNECTED;

        // Modification du fichier JSON
        var usersjson = fs.readFileSync("./public/jsons/accounts.json","utf-8")
        var users = JSON.parse(usersjson)
        
        users.forEach(user => {
            if(user.name === username) {
                user.certif = true;
            }
        });
        usersjson = JSON.stringify(users)
        fs.writeFileSync("./public/jsons/accounts.json",usersjson,"utf-8") 

        // Déplace le certificat et le renomme
        var path = './public/uploads/' + username + "." + filename[1];
        // Véfrifie si un certificat a deja ete televerse
        if(fs.existsSync(path)) {
            try {
                fs.unlinkSync(path)
                file.mv(path, (err) => {
                    if(err) {
                        console.log(err);
                    } else {
                        res.redirect('/profile')
                    }
                })
            } catch(err) {

            }
           
        } else {
            file.mv(path, (err) => {
                if(err) {
                    console.log(err);
                } else {
                    res.redirect('/profile')
                }
            })
        }

        res.clearCookie("SPORTICUS_CERTIF");
        res.cookie("SPORTICUS_CERTIF", 'true');
        
    }
})

app.get('/download', (req, res) => {
    
    username = req.cookies.SPORTICUS_CONNECTED
    var path = './public/uploads/' + username + ".pdf";
    if(fs.existsSync(path)) {

        res.download(path)
    } else {
        res.redirect('/profile')
    }
})

app.get('/disconnect', (req, res) => {
    res.clearCookie("SPORTICUS_CERTIF");
    res.clearCookie("SPORTICUS_CONNECTED");
    res.redirect('/')
})




/* ==================================== CONNEXION A REZEL ===================================================*/

async function retrieveConnectionURL(res) {
    //const issuer = await Issuer.discover('https://keycloak.local.rezel.net/auth/realms/servers/');
    const issuer = await Issuer.discover('https://garezeldap.rezel.net/keycloak/auth/realms/master/');
      //console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);
      
      const client = new issuer.Client({
          client_id: 'sporticus',
          //client_secret: 'VT5UPMZpjQ2FL7BLNa2e3QF7Xh3SnsX1',
          client_secret: '96519c5d-e497-4e75-9e0a-9b4f3d226c50',
          //redirect_uris: ['http://localhost:80/cb'], // TODO : à changer !!! 
          redirect_uris: ['https://sporticus.rezel.net/cb'], 
          response_types: ['code'],
          // id_token_signed_response_alg (default "RS256")
          // token_endpoint_auth_method (default "client_secret_basic")
        }); // => Client
      
      //console.log(client);
      
      
      const code_verifier = generators.codeVerifier();
      //const code_challenge = generators.codeChallenge(code_verifier);
      
      let url = client.authorizationUrl({
        scope: 'openid email profile',
        resource: 'https://my.api.example.com/resource/32178',
        /*code_challenge,
        code_challenge_method: 'S256',*/
      });
      
      res.redirect(url.toString());
  
      app.get('/cb', (req, res) => {
        console.log("Req received");
        const params = client.callbackParams(req);
        var userinfo = null;

        (async(params) => {
          //const tokenSet = await client.callback('http://localhost:80/cb', params, { code_verifier });
          var tokenSet = null;
          var access_token = null;

          try {
            tokenSet = await client.callback('https://sporticus.rezel.net/cb', params, { code_verifier });
            //tokenSet = await client.callback('http://localhost:80/cb', params, { code_verifier });
            access_token  = tokenSet.access_token;
          } catch(err) {
            console.error(err);
          }
          
          //var refresh_token = tokenSet.refresh_token;
          try {
            userinfo = await client.userinfo(access_token);
          } catch(err) {
              console.error(err)
          }
          
          console.log('userinfo %j', userinfo);
            
          // Ajout de l'utilisateur dans le json
          var usersjson = fs.readFileSync("./public/jsons/accounts.json","utf-8");
          var users = JSON.parse(usersjson);
          var userexists = false;
          users.forEach(user => {
            if(user.name === userinfo.preferred_username){
                userexists=true;
            }
          })
          if(!userexists) {
            var newuser = {
                "name" : userinfo.preferred_username,
                "certif" : false,
            }

            users.push(newuser);
            
          }
          usersjson = JSON.stringify(users)
            fs.writeFileSync("./public/jsons/accounts.json",usersjson,"utf-8")
          

          res.cookie('SPORTICUS_CONNECTED', userinfo.preferred_username);
          res.cookie('SPORTICUS_CERTIF', 'false')
          res.redirect('/profile');
        })(params);
       
      })

  }



app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})