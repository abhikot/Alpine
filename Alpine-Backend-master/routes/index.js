var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var _ = require('underscore');
var stripePackage = require('stripe')
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY)
//MONGOOSE MODELS
var models = require('../models/models');
var User = models.User;
var Payment = models.Payment;
var Product = models.Product

function hashPassword(password) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

//////GOOGLE CALENDER API//////////////GOOGLE CALENDER API//////////////GOOGLE CALENDER API////////
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const credentials = require('../credentials.json').installed

const scope = 'https://www.googleapis.com/auth/calendar'

// const url = oauth2Client.generateAuthUrl({
//   // 'online' (default) or 'offline' (gets refresh_token)
//   access_type: 'offline',
//
//   // If you only need one scope you can pass it as a string
//   scope: scope
// });
//
// const {tokens} = await oauth2Client.getToken(code)
// oauth2Client.setCredentials(tokens);
//
// oauth2client.on('tokens', (tokens) => {
//   if (tokens.refresh_token) {
//     // store the refresh_token in my database!
//     console.log(tokens.refresh_token);
//   }
//   console.log(tokens.access_token);
// });

  router.get('/scheduleSession', function(req, res, next) {
    res.render('scheduleSession', {
      user: req.user
    })
  })

  router.post('/scheduleSession', function(req, res, next) {
    const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
    const TOKEN_PATH = '../token.json';

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Calendar API.
      authorize(JSON.parse(content), createEvent);
    });

    /**
    * Create an OAuth2 client with the given credentials, and then execute the
    * given callback function.
    * @param {Object} credentials The authorization client credentials.
    * @param {function} callback The callback to call with the authorized client.
    */

    function authorize(credentials, callback) {
      const {client_secret, client_id, redirect_uris} = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
        console.log('credentials', credentials);
        console.log('credentials', oAuth2Client);


        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
          if (err) return getAccessToken(oAuth2Client, callback);
          oAuth2Client.setCredentials(JSON.parse(token));
          callback(oAuth2Client);
        });
      }

      function getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
        });
      }

      var event = {
        'summary': 'Google I/O 2015',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
          'dateTime': '2018-08-10T09:00:00-07:00',
          'timeZone': 'America/Los_Angeles',
        },
        'end': {
          'dateTime': '2015-08-1017:00:00-08:00',
          'timeZone': 'America/Los_Angeles',
        },
        'recurrence': [
          'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'attendees': [
          {'email': 'chrishemm@gmail.com'},
          {'email': 'apiaryad@gmail.com'},
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10},
          ],
        },
      };

      function createEvent(auth) {
        console.log('event being created')
        const calendar = google.calendar({version: 'v3', auth});
        calendar.events.insert({
          auth: auth,
          calendarId: 'o3i55kndm0ad3060lv7k230s28@group.calendar.google.com',
          resource: event,
        }, function(err, event) {
          if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
          }
          console.log('Event created: %s', event.htmlLink);
          res.send('successful event creation');
        });
      }
    })
    //////GOOGLE CALENDER API//////////////GOOGLE CALENDER API//////////////GOOGLE CALENDER API//////////////GOOGLE CALENDER API////////


    // Non-Login functionality
    router.get('/', function(req, res, next) {
      console.log(req.user)
      if (req.user) {
        res.render('index', {
          username: req.user.username,
          name: req.user.name,
          loggedIn: true
        });
      } else {
        res.render('index', {
          loggedIn: false
        })
      }
    });

    // Profile stuff
    router.get('/users/myProfile', function(req, res, next) {
      User.findOne({username: req.user.username})
      .exec()
      .then((user) => {
        console.log('user', user);
        res.render('profile', {
          user: user,
          logged: req.user.username,
          owner: true
        })
      })
      .catch((error)=> {
        res.send(error);
      })
    })

    //editing profile

    router.get('/users/edit', function(req, res, next) {
      User.findOne({username: req.user.username})
      .exec()
      .then((user) => {
        console.log('userSchool', user.school);
        res.render('editProfile', {
          user: user,
          firstName: user.name.split(" ")[0],
          lastName: user.name.split(" ")[1],
          logged: req.user.username,
          genderMale: req.user.gender === 'Male' ? 'checked' : null,
          genderFemale: req.user.gender === 'Female' ? 'checked' : null,
          genderOther: req.user.gender === 'Other' ? 'checked' : null,
        })
      })
      .catch((error)=> {
        res.send(error);
      })
    })

    router.post('/users/edit', function(req, res, next) {
      User.findOneAndUpdate({username: req.user.username}, {
        username: req.body.username,
        name: req.body.firstName + ' ' + req.body.lastName,
        school: req.body.school,
        email: req.body.email,
        gender: req.body.gender,
        biography: req.body.biography,
        imageUrl: req.body.imageUrl
      })
      .exec()
      .then((resp) => {
        console.log('User successfully updated', resp);
        res.redirect('/users/myProfile');
      })
      .catch((error)=> {
        console.log('Error', error);
        res.send(error);
      })
    })

    //Viewing other profiles
    //viewing all profiles
    router.get('/users/all', function(req, res, next) {
      User.find()
      .exec()
      .then((users) => {
        res.render('networkProfiles', {
          users: users,
          logged: req.user.username
        })
      })
      .catch((error)=> {
        console.log('Error', error)
        res.send(error);
      })
    })
    //view a single profile
    router.get('/users/:userid', function(req, res, next) {
      var userId = req.params.userid;
      User.findById(userId)
      .exec()
      .then((user) => {
        res.render('profile', {
          user: user,
          logged: req.user.username,
          owner: false
        })
      })
      .catch((error)=> {
        console.log('Error', error)
        res.send(error);
      })
    })
    ////////////////////////////////////////PERMISSIONS/////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    router.get('/admin', function(req, res, next) {
      if (req.user.userType !== 'admin') {
        res.redirect(404, '/')
        console.log("error: you don't have permissions to access this page")
      } else {
        User.find()
        .exec()
        .then((users) => {
          var filteredUsers = _.filter(users, (user)=> {
            console.log('user field', user);
            return user.userType !== 'admin'
          })
          res.render('admin', {
            users: filteredUsers,
            logged: req.user.username
          })
        })
      }
    })

    router.post('/admin/consultant/:userid', function(req, res, next) {
      if (req.user.userType !== 'admin') {
        res.redirect(404, '/')
        console.log("error: you don't have permissions to access this page")
      } else {
        User.findByIdAndUpdate(req.params.userid, {userType: 'consultant'})
        .exec()
        .then(function(resp) {
          console.log('user successfully has been made consultant')
          res.redirect('/admin')
        })
        .catch(function(err) {
          console.log('ERROR: error updating user status')
        })
      }
    })

    router.post('/admin/admin/:userid', function(req, res, next) {
      if (req.user.userType !== 'admin') {
        res.redirect(404, '/')
        console.log("error: you don't have permissions to access this page")
      } else {
        User.findByIdAndUpdate(req.params.userid, {userType: 'admin'})
        .exec()
        .then(function(resp) {
          console.log('user successfully has been made admin')
          res.redirect('/admin')
        })
        .catch(function(err) {
          console.log('ERROR: error updating user status')
        })
      }
    })

    router.post('/admin/client/:userid', function(req, res, next) {
      if (req.user.userType !== 'admin') {
        res.redirect(404, '/')
        console.log("error: you don't have permissions to access this page")
      } else {
        User.findByIdAndUpdate(req.params.userid, {userType: 'client'})
        .exec()
        .then(function(resp) {
          console.log('user successfully has been made client')
          res.redirect('/admin')
        })
        .catch(function(err) {
          console.log('ERROR: error updating user status')
        })
      }
    })

    router.post('/admin/user/:userid', function(req, res, next) {
      if (req.user.userType !== 'admin') {
        res.redirect(404, '/')
        console.log("error: you don't have permissions to access this page")
      } else {
        User.findByIdAndUpdate(req.params.userid, {userType: 'user'})
        .exec()
        .then(function(resp) {
          console.log('user successfully has been made user')
          res.redirect('/admin')
        })
        .catch(function(err) {
          console.log('ERROR: error updating user status')
        })
      }
    })
    ////////////////////////////////////////Payment Route/////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    router.get('/products', function(req, res, next) {
      res.render('products');
    })


    router.get('/checkout', function(req, res, next) {
      res.render('checkout', {
        cartSecret : process.env.STRIPE_SECRET_KEY,
        cartPublish : process.env.STRIPE_PUBLISH_KEY
      })
    })

    //Payment processing and saving
    router.post('/checkout', function(req, res, next) {
      console.log('checkout request initialized');
      var token = req.body.stripeToken;
      var email = req.body.stripeEmail;
      stripe.customers.create({
        email: email,
        source: token,
      }).then(function(customer) {
        // YOUR CODE: Save the customer ID and other info in a database for later.
        console.log('successfully created customer')
        var newCharge =  stripe.charges.create({
          amount: 300,
          currency: "usd",
          customer: customer.id,
        });
        return newCharge;
        console.log('charge successfully created');
      }).then(function(charge) {
        console.log('charge', charge)
        //Create new payment for database
        var newPayment = new Payment ({
          stripeBrand: charge.source.brand,
          stripeCustomerId: charge.customer,
          stripeExpMonth: charge.source.exp_month,
          paymentAmount: charge.amount,
          stripeExpYear: charge.source.exp_year,
          stripeLast4: charge.source.last4,
          stripeSource: charge.source.id,
          status: charge.status,
          _userid: req.user._id,
          name: req.user.name,
          email: req.user.email
        })
        newPayment.save(function(err, charge) {
          if (err) {
            console.log('error saving new payment');
          } else {
            res.render('payment', {
              charge: charge
            })
          }
        })
      });
    })
    ////////////////////////////////////////Consulting/////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    router.get('/users/consultants/:userid', function(req, res, next) {
      //consultant profile page
    })
    //sample consultant profile with google calendars API (maybe a skype API of some sort?)
    //test route for google calendar API
    router.get('/calendar', function(req, res, next) {
      res.render('calendar')
    })




    module.exports = router;
