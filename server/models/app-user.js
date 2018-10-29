'use strict';
const app = require('../server');
const path = require('path');

module.exports = function (Appuser) {
    const Mail = app.models.Mail;
    Appuser.afterRemote('create', function (context, userInstance, next) {
      console.log('> user.afterRemote triggered');

      var options = {
        type: 'email',
        to: userInstance.email,
        from: 'noreply@loopback.com',
        subject: 'Thanks for registering.',
        template: path.resolve(__dirname, '../views/verify.ejs'),
        redirect: '/verified',
        user: Appuser

      };

      userInstance.verify(options, function (err, response) {
        if (err) return next(err);

        console.log('> verification email sent:', response);

        context.res.render('response', {
          title: 'Signed up successfully',
          content: 'Please check your email and click on the verification link before logging in.',
          redirectTo: '/',
          redirectToLinkText: 'Log in'
        });
      });

    });
};
