import { getAuth } from "firebase-admin/auth";
import User from "../Models/User.model.js";
import Discussion from "../Models/Discussion.model.js";

let io;

export const setSocketIo = (socketIo) => {
  io = socketIo;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decodedToken = await getAuth().verifyIdToken(token);

      let user = await User.findOne({
        firebaseUid: decodedToken.uid,
      });

      if (!user && decodedToken.email) {
        user = await User.findOne({
          email: decodedToken.email.toLowerCase().trim(),
        });
      }

      if (!user || user.accountStatus !== "active") {
        return next(new Error("User not authorized"));
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role,
      };

      next();
    } catch (error) {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("discussion:join", async (discussionId) => {
      try {
        const discussion = await Discussion.findById(discussionId);

        if (!discussion || discussion.isDeleted) return;

        const isCreator =
          discussion.creatorId.toString() === socket.user.id;

        const isMember = discussion.members.some(
          (memberId) => memberId.toString() === socket.user.id
        );

        const isAdmin = socket.user.role === "Admin";

        if (isCreator || isMember || isAdmin) {
          socket.join(`discussion:${discussionId}`);
        }
      } catch (error) {
        console.error("Discussion room error:", error.message);
      }
    });

    socket.on("discussion:leave", (discussionId) => {
      socket.leave(`discussion:${discussionId}`);
    });
  });
};

export const getSocketIo = () => io;