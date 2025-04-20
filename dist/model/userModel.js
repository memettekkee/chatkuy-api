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
exports.updateUser = exports.userById = exports.allUser = exports.existingUser = exports.registerUser = void 0;
const prisma_1 = __importDefault(require("../database/prisma"));
const registerUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.create({
        data: userData
    });
    return user;
});
exports.registerUser = registerUser;
const existingUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { email: email }
    });
    return user;
});
exports.existingUser = existingUser;
const allUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findMany();
    return user;
});
exports.allUser = allUser;
const userById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId }
    });
    return user;
});
exports.userById = userById;
const updateUser = (userId, name, email, avatar) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.update({
        where: { id: userId },
        data: {
            name: name,
            email: email,
            avatar: avatar
        }
    });
    return user;
});
exports.updateUser = updateUser;
//# sourceMappingURL=userModel.js.map