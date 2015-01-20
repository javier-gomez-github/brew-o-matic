var model = require('../domain/model.js');
var q = require('q');

var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var MONTH = DAY * 30;
var YEAR = DAY * 365;
var ORIGIN = YEAR * 100;

function lastLogin(modelName,date,name,values,field) {
    var deferred = q.defer();

    var filter = {};
    filter[field] = { '$exists': true, '$gte': date };

    model[modelName].count(filter).exec(function(err,results) {
        if ( err ) {
            deferred.reject(err);
        } else {
            values[field][name] = results;
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function publicRecipes(date,name,values) {
    var deferred = q.defer();

    var filter = {};
    filter.publishDate = { '$exists': true, '$gte': date };
    filter.isPublic = true;

    model.Recipe.count(filter).exec(function(err,results) {
        if ( err ) {
            deferred.reject(err);
        } else {
            values.isPublic[name] = results;
            deferred.resolve();
        }
    });
    return deferred.promise;
}

exports.all = function(req, res) {
    //Usuarios
    var now = new Date();
    var yesterday = new Date(now.getTime()-DAY);
    var week = new Date(now.getTime()-WEEK);
    var month = new Date(now.getTime()-MONTH);
    var year = new Date(now.getTime()-YEAR);
    var origin = new Date(now.getTime()-ORIGIN);

    var result = {
        lastLogin: {},
        singInDate: {},
        date: {},
        modificationDate: {},
        isPublic: {}
    };
    q.all([
        lastLogin('User',yesterday,'today',result,'lastLogin'),
        lastLogin('User',week,'week',result,'lastLogin'),
        lastLogin('User',month,'month',result,'lastLogin'),
        lastLogin('User',year,'year',result,'lastLogin'),
        lastLogin('User',origin,'origin',result,'lastLogin'),

        lastLogin('User',yesterday,'today',result,'singInDate'),
        lastLogin('User',week,'week',result,'singInDate'),
        lastLogin('User',month,'month',result,'singInDate'),
        lastLogin('User',year,'year',result,'singInDate'),
        lastLogin('User',origin,'origin',result,'singInDate'),

        lastLogin('Recipe',yesterday,'today',result,'date'),
        lastLogin('Recipe',week,'week',result,'date'),
        lastLogin('Recipe',month,'month',result,'date'),
        lastLogin('Recipe',year,'year',result,'date'),
        lastLogin('Recipe',origin,'origin',result,'date'),

        lastLogin('Recipe',yesterday,'today',result,'modificationDate'),
        lastLogin('Recipe',week,'week',result,'modificationDate'),
        lastLogin('Recipe',month,'month',result,'modificationDate'),
        lastLogin('Recipe',year,'year',result,'modificationDate'),
        lastLogin('Recipe',origin,'origin',result,'modificationDate'),

        publicRecipes(yesterday,'today',result),
        publicRecipes(week,'week',result),
        publicRecipes(month,'month',result),
        publicRecipes(year,'year',result),
        publicRecipes(origin,'origin',result)
    ]).then(function(count) {
        res.send(result);
    });

};