'use strict';

module.exports = function (Centro) {
    
    Centro.validatesNumericalityOf('codigocentro', {int: true, message: 'Debe ser un número sin decimales'});
    Centro.validatesUniquenessOf('codigocentro', {message: 'Ese centro ya existe'});
    
    Centro.beforeRemote('create',function (context, centro, next) {
        centro.verificado = 0;
        context.verificado = 0;
        next();
    });
    
    Centro.afterRemote('create', function (context, centro, next) {
        
        var html = 'Nuevo registro de centro '+centro.nombre+"  con id "+centro.codigocentro+" en la localidad de "+centro.localidad ;
        centro.verificado = false;
        Centro.app.models.Email.send({
            to: process.env.ADMIN_EMAIL,
            from: process.env.EMAIL_USER,
            subject: 'Nuevo centro',
            html: html
        }, function (err) {
            if (err)
                return console.log('> error sending email');
            console.log('> sending email ok');
        });
        next();

    });
};
