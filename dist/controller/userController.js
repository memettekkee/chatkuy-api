"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserCtrl = exports.getUserByIdCtrl = exports.getAllUser = exports.loginCtrl = exports.registerCtrl = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../model/userModel");
const registerCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        let hashedPass = yield bcrypt_1.default.hashSync(password, 10);
        const checkUser = yield (0, userModel_1.existingUser)(email);
        if (checkUser) {
            res.status(403).json({
                error: true,
                message: "Email exist !"
            });
            return;
        }
        const userData = {
            name: name,
            email: email,
            avatar: null,
            password: hashedPass
        };
        yield (0, userModel_1.registerUser)(userData);
        res.status(201).json({
            error: false,
            message: "Account created !",
            user: userData
        });
        return;
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e
        });
        return;
    }
});
exports.registerCtrl = registerCtrl;
const loginCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const checkUser = yield (0, userModel_1.existingUser)(email);
        if (!checkUser) {
            res.status(404).json({
                error: true,
                message: "Account didn't exist !"
            });
            return;
        }
        const validPassword = yield bcrypt_1.default.compare(password, checkUser === null || checkUser === void 0 ? void 0 : checkUser.password);
        if (!validPassword) {
            res.status(403).json({
                error: true,
                message: "Wrong Email or Password !"
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
            id: checkUser.id,
            email: checkUser.email
        }, process.env.JWT_SECRET || 'default_jwt_secret', { expiresIn: '24h' });
        res.status(200).json({
            error: false,
            message: "Login success !",
            user: checkUser,
            token: token
        });
        return;
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e
        });
        return;
    }
});
exports.loginCtrl = loginCtrl;
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield (0, userModel_1.allUser)();
        res.status(200).json({
            error: false,
            message: "Successfully get list of users !",
            userList: allUsers
        });
        return;
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e.message
        });
        return;
    }
});
exports.getAllUser = getAllUser;
const getUserByIdCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const checkUser = yield (0, userModel_1.userById)(userId);
        if (!checkUser) {
            res.status(404).json({
                error: true,
                message: "User didn't exist !"
            });
            return;
        }
        res.status(200).json({
            error: false,
            message: "User exist !",
            user: checkUser
        });
        return;
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e.message
        });
        return;
    }
});
exports.getUserByIdCtrl = getUserByIdCtrl;
const updateUserCtrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, avatar } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const checkUser = yield (0, userModel_1.userById)(userId);
        if (userId != (checkUser === null || checkUser === void 0 ? void 0 : checkUser.id)) {
            res.status(403).json({
                error: true,
                message: "Can't update, wrong ID !"
            });
            return;
        }
        const updatedData = yield (0, userModel_1.updateUser)(userId, name, email, avatar);
        res.status(200).json({
            error: false,
            message: "User credential updated !",
            user: updatedData
        });
        return;
    }
    catch (e) {
        res.status(500).json({
            error: true,
            message: e.message
        });
        return;
    }
});
exports.updateUserCtrl = updateUserCtrl;
//# sourceMappingURL=userController.js.map