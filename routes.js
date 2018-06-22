const Router = require('express').Router;
const router = new Router();
const path = require('path');
const express = require('express');
const _ = require('lodash');

let versions = [
    'v1'
];

let endpoints = [
    'answers',
    'sessions',
    'projects',
    'students',
    'updates',
    'oauth'
];

_.forEach(versions, function(version) {
    let basePath = '/' + version + '/';
    let baseRouterPath = './' + version + '/';

    _.forEach(endpoints, function(endpoint) {
        endpoint = endpoint.replace(/y\b/, 'ie');

        let path = basePath + endpoint;
        let routerPath = baseRouterPath + endpoint;

        router.use(path, require(routerPath));
    });
});

module.exports = router;
