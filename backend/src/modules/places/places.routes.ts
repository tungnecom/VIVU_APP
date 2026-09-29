import { Router } from 'express';
import { PlacesController } from './places.controller';

export const placesRouter = Router();

placesRouter.get('/', PlacesController.getPlacesByBounds);
