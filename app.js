// Load environment variables from .env file
require('dotenv').config()
// Load the path module for resolving file paths
const path = require('path')
const routes = require('./routes')

const express = require('express');


// Import the LTI provider module
const lti = require('ltijs').Provider


// Setup the LTI provider with the LTI key, MongoDB URL and options
lti.setup(process.env.LTI_KEY,
  {
    url: 'mongodb+srv://admin:PeaMTZuCL4UZSPEy@ilearncluster.3tc9lwg.mongodb.net/?retryWrites=true&w=majority'
  }, {
    staticPath: path.join(__dirname, './public'), // Path to static files
    cookies: {
      secure: true, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: 'None' // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true 
  })

// Define the LTI onConnect event handler
// This will handle successful LTI launches and redirect to the app
lti.onConnect(async (token, req, res) => {
  console.log('LTI connection successful.');
  console.log(res.locals.ltik);
  process.env.LTIK=res.locals.ltik;
  res.set({
    Authorization : 'Bearer ' + res.locals.ltik
  });
  // return res.send('LTI connection successful.');
  // console.log(lti.app.use(express.static(
  //   path.join(__dirname, './views'))));
  return res.sendFile(path.join(__dirname, './public/index.html'));
})

// Setting up routes
// lti.app.use(routes)
// lti.app.use(express.static('views', { extensions: ['html', 'js'] }));
// Define the setup function
const setup = async () => {
  // Deploy the LTI provider on the specified port
  await lti.deploy({ port: process.env.PORT })

  // Register the Brightspace platform with the LTI provider
  const platform = await lti.registerPlatform({
    url: 'https://ilearn.onlinelearningbc.com',
    name: 'Brightspace',
    clientId: '968a495d-9938-4c0a-a5e9-129383c3a2f9',
    authenticationEndpoint: 'https://ilearn.onlinelearningbc.com/d2l/lti/authenticate',
    accesstokenEndpoint: 'https://auth.brightspace.com/core/connect/token',
    authConfig: { method: 'JWK_SET', key: 'https://ilearn.onlinelearningbc.com/d2l/.well-known/jwks' }
  })

  // Get the platform authentication configuration
  const authConfig = await platform.platformAuthConfig()
  console.log(authConfig)
lti.app.use(routes);
// lti.app.use(express.static('views', { extensions: ['html', 'js'] }));


}



// Call the setup function
setup()
