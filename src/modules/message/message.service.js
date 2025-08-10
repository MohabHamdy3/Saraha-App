import userModel from "../../DB/models/user.model.js";
import messageModel from './../../DB/models/message.model.js';

export const createMessage = async (req , res , next ) => {
    const {content , userId} = req.body;

    const userExist = await userModel.findOne({_id: userId , isFrozen: {$exists: false}} );
    if (!userExist) {
        return res.status(404).json({ message: "User not found or is frozen" });
    }
    const message = await messageModel.create({ content, userId });
    return res.status(201).json({ message : "Message created successfully", message });
}

export const listMessages = async (req, res, next) => {
    const messages = await messageModel.find({userId: req?.user?._id}).populate("userId", "name email");
    return res.status(200).json({message : "Messages retrieved successfully", messages });
}
export const getMessage = async (req, res, next) => {
    const { id } = req.params;
    const message = await messageModel.findOne({ _id: id, userId: req?.user?._id }).populate("userId", "name email");
    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }
    return res.status(200).json({ message: "Message retrieved successfully", message });
}
