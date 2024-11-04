const Message = require("../../Model/Message/Message.Model");
const User = require("../../Model/User/User.Model");
const mongoose = require("mongoose");
const getMessages = async (req, res) => {
  let { userId, receiverId } = req.params;
  try {
    // Kiểm tra xem userId và receiverId có hợp lệ không
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res
        .status(400)
        .json({ error: "userId hoặc receiverId không hợp lệ." });
    }
    // Chuyển đổi userId và receiverId thành ObjectId
    const senderObjectId = new mongoose.Types.ObjectId(userId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    const messages = await Message.find({
      $or: [
        { senderId: senderObjectId, receiverId: receiverObjectId },
        { senderId: receiverObjectId, receiverId: senderObjectId },
      ],
    }).sort({ createdAt: 1 });
    const messagesWithSenderName = await Promise.all(
      messages.map(async (message) => {
        const sender = await User.findById(message.senderId);
        const senderName =
          sender?.ROLE?.ADMIN || sender?.ROLE?.STAFF
            ? "Q-PetShop"
            : sender?.FULLNAME;
        return {
          ...message._doc,
          senderName,
        };
      })
    );
    res.status(200).json(messagesWithSenderName);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn." });
  }
};
module.exports = { getMessages };
