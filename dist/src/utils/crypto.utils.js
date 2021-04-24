"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = void 0;
const bcrypt = require("bcryptjs");
exports.hashPassword = async (password) => {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
};
//# sourceMappingURL=crypto.utils.js.map