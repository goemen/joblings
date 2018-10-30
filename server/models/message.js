'use strict';

var pubsub = require('../pubsub.js');

module.exports = function(Message) {
  Message.observe('after save', function (ctx, next) {
    const socket = Message.app.io;
    if(ctx.isNewInstance){
        //Now publishing the data..
        pubsub.publish(socket, {
            collectionName : 'Message',
            data: ctx.instance,
            method: 'POST'
        });
    }else{
        //Now publishing the data..
        pubsub.publish(socket, {
            collectionName : 'Message',
            data: ctx.instance,
            modelId: ctx.instance.id,
            method: 'PUT'
        });
    }
    //Calling the next middleware..
    next();
}); //after save..
//MessageDetail before delete..
Message.observe("before delete", function(ctx, next){
        var socket = Message.app.io;
        //Now publishing the data..
        pubsub.publish(socket, {
            collectionName : 'Message',
            data: ctx.instance.id,
            modelId: ctx.instance.id,
            method: 'DELETE'
        });
        //move to next middleware..
        next();
});
};
