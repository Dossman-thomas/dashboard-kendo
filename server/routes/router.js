import { Router } from 'express';
import { userRouter } from './user.route.js';
import { permissionRouter } from './permission.route.js';
import { authRouter } from './auth.route.js';

export const routes = Router(); // create a new router

routes.use('/users', userRouter); // add the userRouter to the routes

routes.use('/permissions', permissionRouter); // add the permissionRouter to the routes

routes.use('/auth', authRouter); // add the authRouter to the routes