import { Response } from 'express';
import type { AuthenticatedRequest } from '../types';
export declare const listingsController: {
    getListings(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    getListing(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    updateListing(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    deleteListing(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    moderateListing(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
    reEvaluateListing(req: AuthenticatedRequest, res: Response): Promise<Response | void>;
};
//# sourceMappingURL=listingsController.d.ts.map