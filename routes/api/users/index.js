const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const auth = require("../../../middlewares/auth");
const User = require("../../../models/User/index.js");

// @route   Get api/users/
// @desc    Get a user data
// @access  Public
router.get('/', async(req, res) => {
    try{
        const users = await User.find({})
        return res.status(200).json({data : users});
    }
    catch(err){
        console.log(err);
    }
})

// @route   GET api/users/:user_id
// @desc    Get a user data
// @access  Private
router.get('/:user_id', auth,async(req, res) =>{
    try {
        const user = await User.findById(req.params.user_id);
        if(!user){
            return res.status(400).json({msg : "There is no user for this id"});
        }
        return res.status(200).json(user);
    }
    catch(err){
        console.log(err);
        if(err.kind = "ObjectId"){
            return res
                    .status(400)
                    .json({msg : 'There is no user'});
        }
        res.status(500).send('Server Error');
    }
})

// @route   POST api/users
// @desc    Login user
// @access  Public
router.post('/login', 
            [
                check('email', 'Please include a valide email').isEmail(),
                check('password', 'Password is required').exists().isLength({min : 8, max: 16})
            ],
            async (req, res) => {
                const errors = validationResult(req);
                if(!errors.isEmpty()){
                    return res
                            .status(400)
                            .json({errors : errors.array()})
                }
                const {email, password} =  req.body;
                try{
                    // See if user exists
                    let user = await User.findOne({email});
                    if (!user){
                        return res
                        .status(400)
                        .json({errors : [{msg : "Invalide credentials"}]});
                    }
                    const isMatch = await bcrypt.compare(password, user.password);
                    if(!isMatch){
                        return res
                                .status(400)
                                .json({errors : [{msg : 'Invalid credentials'}]});
                    }
                    // return jsonwebtoken
                    const payload = {
                        user : {
                            id : user.id
                        }
                    }
                    jwt.sign(
                        // payload
                        payload,
                        // secret
                        JWT_SECRET,
                        // expire in
                        {expiresIn : 36000},
                        (err, token) => {
                            // error handle
                            if(err) throw err;
                            // send token
                            res.json({token :  token, user_id : user.id})
                        }
                    );
                }
                catch(err){
                    console.error(err);
                    return res
                            .status(500)
                            .send('server error');
                }
});

// @route   POST api/users
// @desc    Create/Register user
// @access  Public
router.post('/register',
    [
        check('username', 'username  is require').not().isEmpty(),
        check('email', 'Please include a valide email').isEmail(),
        check('password', 'Please enter a password with 8 or more than eight characters').isLength({min : 8})
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res
                    .status(400)
                    .json({errors : errors.array()});
        }
        const {username, email, password} = req.body;
        try{
            // See if user exists
            let user = await User.findOne({email});
            if(user){
                return res
                        .status(400)
                        .json({errors : [{msg : 'User already exist'}]});
            }
            // Get users gravatar
            const avatar = await gravatar.url(email, {
                // s = size
                s : '200',
                // r = pg -> rating (all public)
                r :  'pg',
                // d
                d : 'mm'
            });
            user = new User({
                username,
                email,
                password,
                avatar
            });
            // Encryt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            // Return jsonwebtoken
            const payload = {
                user : {
                    id : user.id
                }
            }
            jwt.sign(
                // payload
                payload,
                // secret
                JWT_SECRET,
                // expire in
                {expiresIn : 36000},
                (err, token) => {
                    // error handle
                    if (err) throw err;
                    // send token
                    return res
                            .status(200)
                            .json({token});
                }
            )
        }
        catch(err){
            console.error(err);
            return res
                    .status(500)
                    .send('server error')
        }
    }
)

// @route   DELETE api/users
// @desc    Delete a user
// @access  Private

router.delete('/delete/:user_id', auth ,async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id);
        if(!user){
            return res.status(400).json({msg : "There is no user for this id"});
        }
        const idFromURL = req.params.user_id;
        const idFromJWT = req.user.id
        // check if the user who ask for delete has the right to delete the account
        if (idFromURL== idFromJWT) {            
            const removingUser = await User.remove({_id : req.params.user_id})
            // if successfully removed
            if(removingUser)
                return res.status(200).json({msg : "user has been delete ! " , info : "user id " + req.user.id})
            else
                return res.status(400).json({msg : "You cannot delete this user", info : "token_id doesnt match url_id"})
        }
        // if you don't have the right
        else{
            return res.status(400).json({msg : "You don't have any right on this account", info : "token_id doesnt match url_id"})
        }
    }
    catch(err){
        console.log(err);
        if(err.kind = "ObjectId"){
            return res
                    .status(400)
                    .json({msg : 'There is no user'});
        }
        res.status(500).send('Server Error');
    }
    }
)
module.exports = router;