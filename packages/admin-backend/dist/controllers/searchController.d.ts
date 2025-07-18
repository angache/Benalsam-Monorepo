import { Request, Response } from 'express';
export declare class SearchController {
    static searchListings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getSuggestions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAnalytics(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static healthCheck(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static reindex(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=searchController.d.ts.map