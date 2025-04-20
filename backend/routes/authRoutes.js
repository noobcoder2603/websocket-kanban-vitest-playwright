import express from 'express';
import { register, login } from '../controllers/userController.js';

const router = express.Router();

router.post('/auth/signup', register); // Using your existing register function
router.post('/auth/login', login);

export default router;