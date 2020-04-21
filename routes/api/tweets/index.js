const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const auth = require("../../../middleware/auth");
const  User = require('../../../models/User/User');


module.exports = router;