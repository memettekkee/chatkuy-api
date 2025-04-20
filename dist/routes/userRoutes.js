"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const multer_1 = __importDefault(require("../middleware/multer"));
const userController_1 = require("../controller/userController");
const auth_1 = __importDefault(require("../middleware/auth"));
router.post('/register', multer_1.default.none(), userController_1.registerCtrl);
router.post('/login', multer_1.default.none(), userController_1.loginCtrl);
// PRIVATE ROUTE
router.get('/members', auth_1.default, userController_1.getAllUser);
router.get('/profile/detail', auth_1.default, userController_1.getUserByIdCtrl);
router.put('/profile/update', multer_1.default.none(), auth_1.default, userController_1.updateUserCtrl);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map