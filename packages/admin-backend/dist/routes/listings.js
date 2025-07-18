"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingsRouter = void 0;
const express_1 = require("express");
const listingsController_1 = require("../controllers/listingsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.listingsRouter = router;
router.use(auth_1.authenticateToken);
router.get('/', listingsController_1.listingsController.getListings);
router.get('/:id', listingsController_1.listingsController.getListing);
router.put('/:id', listingsController_1.listingsController.updateListing);
router.delete('/:id', listingsController_1.listingsController.deleteListing);
router.post('/:id/moderate', listingsController_1.listingsController.moderateListing);
router.post('/:id/re-evaluate', listingsController_1.listingsController.reEvaluateListing);
//# sourceMappingURL=listings.js.map