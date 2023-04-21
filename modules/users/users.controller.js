const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validateRequest } = require('./../../_middleware/validate-request');
const usersService = require('../users/users.service');

// routes
router.post('/authenticate', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);

module.exports = router;


function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        phoneNo: Joi.number().required(),
        password: Joi.string().min(6).required(),
    });
    validateRequest(req, next, schema);
}


function register(req, res, next) {
    usersService.register(req.body)
        .then(data => res.json({ message: 'Registration successful. Now Login.......', data }))
        .catch(next);
}


function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}


function authenticate(req, res, next) {
    usersService.authenticate(req.body)
        .then(data => res.json({ message: "Success", data }))
        .catch(next);
}