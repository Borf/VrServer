const Router = require('express').Router;
const router = new Router();
const path = require('path');
const express = require('express');

let versions = [
    'v1'
];

let endpoints = [
    'students',
    'sessions',
    'projects'
];

_.forEach(versions, function(version) {
    let basePath = '/' + version + '/';
    let baseRouterPath = './' + version + '/';

    router.use(basePath + 'auth', require(baseRouterPath + 'auth'));

    _.forEach(endpoints, function(endpoint) {
        endpoint = endpoint.replace(/y\b/, "ie");

        let path = basePath + endpoint + 's';
        let routerPath = baseRouterPath + endpoint;

        router.use(path, require(routerPath));
    });
});

module.exports = router;
