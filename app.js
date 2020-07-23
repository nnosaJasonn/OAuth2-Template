const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');
var cookieParser = require('cookie-parser');
dotenv.config();
const client_id = process.env.client_id;
const client_secret = process.env.client_secret;
const auth_endpoint = process.env.auth_endpoint;
const scopes = process.env.scopes;
const redirect_uri = process.env.redirect_uri;
const refresh_endpoint = process.env.refresh_endpoint;
console.log('client-id => ' +client_id);
const port = process.env.PORT || 8888;


const app = express();


let stateKey = 'auth_state';

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

app.get('/login', (req, res) => {
    let state = 'abcdefghijklmnop';
    res.cookie(stateKey, state);
    res.redirect(auth_endpoint +
    querystring.stringify({
        response_type: 'code',
        client_id:client_id, 
        scope: scopes,
        redirect_uri: redirect_uri,
        state: state
    }))
});

app.get('/callback', (req,res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null
    let access_token;
    let refresh_token;
    if(state === null || state != storedState) {
        res.redirect('/#' + querystring.stringify({
            error: 'state_mismatch'
        }));
    } else {
        res.clearCookie(stateKey);
          const data = {
            code,
            redirect_uri,
            grant_type: 'authorization_code',
            client_id: client_id,
            client_secret: client_secret
          };
        
          try {
             axios.post(
              refresh_endpoint,
              querystring.stringify(data),
            )
            .then((response) => {
                access_token = response.data.access_token;
                refresh_token = response.data.refresh_token;
                res.redirect('http://localhost:8888/#' + 
                querystring.stringify({
                    access_token,
                    refresh_token
                }))
            })
            .catch((error))
            {
                console.log('error!!!'+error);
                res.redirect('http://localhost:8888/#' + 
                    querystring.stringify({
                        error: 'invalid_token'
                    }))
            }
          } catch (error) {
            
          }
    }
});





app.listen(port);
