const router = require("express").Router();
// Requiring Ltijs
const lti = require("ltijs").Provider;

router.get('/flutter.js', (req, res) => {
        console.log('LTIK from route: '+process.env.LTIK);
        return res.send('Went to flutter.js.');
        // return res.sendFile(path.join(__dirname, './views/index.html'));
});

// Wildcard route to deal with redirecting to React routes
router.get('*', (req, res) => res.sendFile(path.join(__dirname, './views/index.html')));
module.exports = router;
