'use strict';

module.exports = function (Centro) {
    Centro.validatesNumericalityOf('codigocentro', {int: true, message: 'Debe ser un número sin decimales'});
    Centro.validatesUniquenessOf('codigocentro', {message: 'Ese centro ya existe'});

    Centro.beforeRemote('create', function (context, centro, next) {
        delete context.args.data.verificado;
        context.args.data.coordinador = context.req.accessToken.userId;
        next();
    });

    Centro.beforeRemote('find', function (context, centro, next) {
        var rolem = Centro.app.models.RoleMapping;
        if (context.req.accessToken == null) {
            context.args.filter = {where: {"verificado": true}};
            console.log("Sin user");
        } else {

            var id = context.req.accessToken.userId;
            console.log(id);
            var t = rolem.findOne({where: {principalId: id}, include: {relation: "role", scope: {where: {name: "administrador"}}}}, function(err, role) { console.log(role) });
            console.log(t);
            if (null !== null) {
                console.log("Es admin " + t);
            } else {
                console.log("No lo es");
            }

        }





        next();

    });

    Centro.afterRemote('create', function (context, centro, next) {
        var options = {
            type: 'email',
            to: process.env.ADMIN_EMAIL,
            from: process.env.EMAIL_USER,
            subject: 'Alta de centro pendiente de validación',
            html: "Centro pendiente de validación"
        };
        Centro.app.models.Email.send(options, function (err) {
            if (err)
                return console.log('> error sending verificación de centro al admin');
            console.log('> enviando verificación de centro al admin:');
        });
        next();
    });
}
;
