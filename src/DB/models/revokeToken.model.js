import mongoose from "mongoose";

const RevokeTokenSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
    },
    expiredAt: {
        type: String,
        required: true,
    }
    
},{
    timestamps: true,
})

const revokeTokenModel = mongoose.model.revokeToken || mongoose.model("revokeToken", RevokeTokenSchema);

export default revokeTokenModel;
