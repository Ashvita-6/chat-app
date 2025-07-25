// backend/src/middleware/taskValidation.middleware.js
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Custom validator for MongoDB ObjectId
const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Task creation validation
export const validateCreateTask = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim(),
  
  body('assignedTo')
    .isArray({ min: 1 })
    .withMessage('At least one person must be assigned')
    .custom((assignedTo) => {
      if (!assignedTo.every(id => isValidObjectId(id))) {
        throw new Error('All assigned user IDs must be valid');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((dueDate) => {
      if (new Date(dueDate) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.some(tag => typeof tag !== 'string' || tag.trim().length === 0)) {
        throw new Error('All tags must be non-empty strings');
      }
      return true;
    }),
  
  body('estimatedHours')
    .optional()
    .isNumeric()
    .withMessage('Estimated hours must be a number')
    .custom((hours) => {
      if (hours && (hours < 0 || hours > 1000)) {
        throw new Error('Estimated hours must be between 0 and 1000');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Task update validation
export const validateUpdateTask = [
  param('taskId')
    .custom(isValidObjectId)
    .withMessage('Invalid task ID'),
  
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim(),
  
  body('assignedTo')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one person must be assigned')
    .custom((assignedTo) => {
      if (assignedTo && !assignedTo.every(id => isValidObjectId(id))) {
        throw new Error('All assigned user IDs must be valid');
      }
      return true;
    }),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, in-progress, completed, cancelled'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((dueDate) => {
      if (dueDate && new Date(dueDate) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('estimatedHours')
    .optional()
    .isNumeric()
    .withMessage('Estimated hours must be a number')
    .custom((hours) => {
      if (hours && (hours < 0 || hours > 1000)) {
        throw new Error('Estimated hours must be between 0 and 1000');
      }
      return true;
    }),
  
  body('actualHours')
    .optional()
    .isNumeric()
    .withMessage('Actual hours must be a number')
    .custom((hours) => {
      if (hours && (hours < 0 || hours > 1000)) {
        throw new Error('Actual hours must be between 0 and 1000');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Task assignment validation
export const validateAssignTask = [
  param('taskId')
    .custom(isValidObjectId)
    .withMessage('Invalid task ID'),
  
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('At least one user ID is required')
    .custom((userIds) => {
      if (!userIds.every(id => isValidObjectId(id))) {
        throw new Error('All user IDs must be valid');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Task query validation
export const validateTaskQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['all', 'pending', 'in-progress', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('priority')
    .optional()
    .custom((priority) => {
      if (priority) {
        const priorities = priority.split(',');
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!priorities.every(p => validPriorities.includes(p))) {
          throw new Error('Invalid priority filter');
        }
      }
      return true;
    }),
  
  query('assignedTo')
    .optional()
    .custom((assignedTo) => {
      if (assignedTo) {
        const userIds = assignedTo.split(',');
        if (!userIds.every(id => isValidObjectId(id))) {
          throw new Error('Invalid assigned user IDs');
        }
      }
      return true;
    }),
  
  query('assignedBy')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Invalid assignedBy user ID'),
  
  query('dueDate')
    .optional()
    .isIn(['today', 'tomorrow', 'this-week', 'next-week', 'overdue'])
    .withMessage('Invalid due date filter'),
  
  query('overdue')
    .optional()
    .isBoolean()
    .withMessage('Overdue must be a boolean'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'status', 'title'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

// Task comment validation
export const validateTaskComment = [
  param('taskId')
    .custom(isValidObjectId)
    .withMessage('Invalid task ID'),
  
  body('comment')
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim(),
  
  handleValidationErrors
];

// Comment update validation
export const validateUpdateComment = [
  param('commentId')
    .custom(isValidObjectId)
    .withMessage('Invalid comment ID'),
  
  body('comment')
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim(),
  
  handleValidationErrors
];

// Task ID parameter validation
export const validateTaskId = [
  param('taskId')
    .custom(isValidObjectId)
    .withMessage('Invalid task ID'),
  
  handleValidationErrors
];

// User ID parameter validation
export const validateUserId = [
  param('userId')
    .custom(isValidObjectId)
    .withMessage('Invalid user ID'),
  
  handleValidationErrors
];