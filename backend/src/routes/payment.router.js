import express from 'express';

import {
    checkToken,
    authorize,
    serializeUser
} from '../middlewares/protect.js';

export const router = express.Router();

router.use(checkToken);
router.use(serializeUser);