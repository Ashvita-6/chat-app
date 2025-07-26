// backend/src/utils/chatUtils.js
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

/**
 * Get users that the current user has chatted with
 * @param {string} userId - Current user's ID
 * @returns {Array} Array of user objects that the user has chatted with
 */
export const getChatUsers = async (userId) => {
  try {
    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).select('senderId receiverId').lean();

    // Extract unique user IDs that the user has chatted with
    const chatUserIds = new Set();
    
    messages.forEach(message => {
      if (message.senderId.toString() !== userId.toString()) {
        chatUserIds.add(message.senderId.toString());
      }
      if (message.receiverId.toString() !== userId.toString()) {
        chatUserIds.add(message.receiverId.toString());
      }
    });

    // Convert Set to Array and get user details
    const userIdsArray = Array.from(chatUserIds);
    
    if (userIdsArray.length === 0) {
      return [];
    }

    // Fetch user details for all chat users
    const chatUsers = await User.find({
      _id: { $in: userIdsArray }
    }).select('fullName email profilePic').lean();

    return chatUsers;
  } catch (error) {
    console.error("Error in getChatUsers:", error);
    throw error;
  }
};

/**
 * Check if users are in the current user's chat list
 * @param {string} currentUserId - Current user's ID
 * @param {Array} userIds - Array of user IDs to check
 * @returns {boolean} True if all users are in chat list, false otherwise
 */
export const areUsersInChatList = async (currentUserId, userIds) => {
  try {
    const chatUsers = await getChatUsers(currentUserId);
    const chatUserIds = chatUsers.map(user => user._id.toString());
    
    // Check if all provided user IDs are in the chat list
    return userIds.every(userId => chatUserIds.includes(userId.toString()));
  } catch (error) {
    console.error("Error in areUsersInChatList:", error);
    throw error;
  }
};

/**
 * Filter user IDs to only include those in chat list
 * @param {string} currentUserId - Current user's ID
 * @param {Array} userIds - Array of user IDs to filter
 * @returns {Array} Filtered array of user IDs that are in chat list
 */
export const filterUsersInChatList = async (currentUserId, userIds) => {
  try {
    const chatUsers = await getChatUsers(currentUserId);
    const chatUserIds = chatUsers.map(user => user._id.toString());
    
    return userIds.filter(userId => chatUserIds.includes(userId.toString()));
  } catch (error) {
    console.error("Error in filterUsersInChatList:", error);
    throw error;
  }
};

/**
 * Get chat users for task assignment (formatted for frontend)
 * @param {string} userId - Current user's ID
 * @returns {Array} Array of user objects formatted for task assignment
 */
export const getChatUsersForTaskAssignment = async (userId) => {
  try {
    const chatUsers = await getChatUsers(userId);
    
    // Format for frontend use
    return chatUsers.map(user => ({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic || ""
    }));
  } catch (error) {
    console.error("Error in getChatUsersForTaskAssignment:", error);
    throw error;
  }
};