'use strict';
var config = require('../../server/config.json');
var path = require('path');
module.exports = function (Usuario) {
    //send verification email after registration
    Usuario.afterRemote('create', function (context, userInstance, next) {
        console.log('> user.afterRemote triggered');

        var options = {
            type: 'email',
            to: userInstance.email,
            from: 'alumnosdaw2@iesdosmares.com',
            subject: 'Thanks for registering.',
            template: path.resolve(__dirname, '../../server/views/verify.ejs'),
            redirect: '/verified',
            user: Usuario
        };

        userInstance.verify(options, function (err, response, next) {
            if (err)
                return next(err);

            console.log('> verification email sent:', response);

            context.res.render('response', {
                title: 'Signed up successfully',
                content: 'Please check your email and click on the verification link ' -
                        'before logging in.',
                redirectTo: '/',
                redirectToLinkText: 'Log in'
            });
        });
    });
    //send password reset link when requested
    Usuario.on('resetPasswordRequest', function (info) {
        var url = 'http://' + config.host + ':' + config.port + '/reset-password';
        var html = 'Click <a href="' + url + '?access_token=' +
                info.accessToken.id + '">here</a> to reset your password';

        Usuario.app.models.Email.send({
            to: info.email,
            from: 'alumnosdaw2@iesdosmares.com',
            subject: 'Password reset',
            html: html
        }, function (err) {
            if (err)
                return console.log('> error sending password reset email');
            console.log('> sending password reset email to:', info.email);
        });
    });

    //render UI page after password change
    Usuario.afterRemote('changePassword', function (context, user, next) {
        context.res.render('response', {
            title: 'Password changed successfully',
            content: 'Please login again with new password',
            redirectTo: '/',
            redirectToLinkText: 'Log in'
        });
    });

    //render UI page after password reset
    Usuario.afterRemote('setPassword', function (context, user, next) {
        context.res.render('response', {
            title: 'Password reset success',
            content: 'Your password has been reset successfully',
            redirectTo: '/',
            redirectToLinkText: 'Log in'
        });
    });
};