import mongoose from "mongoose";

const revokedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true } // Fecha de expiración del token
});

const RevokedToken = mongoose.model("RevokedToken", revokedTokenSchema);
export default RevokedToken;

