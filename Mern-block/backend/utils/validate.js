const { body } = require('express-validator');


exports.postValidation = [
body('title').isLength({ min: 3 }).withMessage('Title is required and at least 3 characters'),
body('content').isLength({ min: 10 }).withMessage('Content must be at least 10 characters')
];


exports.categoryValidation = [
body('name').isLength({ min: 2 }).withMessage('Name is required')
];


exports.registerValidation = [
body('username').isLength({ min: 3 }),
body('email').isEmail(),
body('password').isLength({ min: 6 })
];


exports.loginValidation = [
body('email').isEmail(),
body('password').exists()
];