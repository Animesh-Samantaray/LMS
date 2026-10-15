import { getAuth } from "firebase-admin/auth";
import User from "../Models/User.model.js";
import Discussion from "../Models/Discussion.model.js";
import DirectConversation from "../Models/DirectConversation.model.js";
import Course from "../Models/Course.model.js";

let io;

export const setSocketIo = (socketIo) => {
  io = socketIo;

  // Log Engine.IO connection errors safely
  io.engine.on("connection_error", (err) => {
    console.warn(
      `[Socket.IO Engine] Error: code=${err.code}, message="${err.message}"`
    );
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        console.warn(
          `[Socket.IO Auth] Connection rejected: No auth token provided (socket: ${socket.id})`
        );
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
        console.warn(
          `[Socket.IO Auth] Connection rejected: User not found or inactive (UID: ${decodedToken.uid})`
        );
        return next(new Error("User not authorized"));
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role,
      };

      console.log(
        `[Socket.IO Auth] User ${user._id} (${user.role}) authenticated on socket ${socket.id}`
      );
      next();
    } catch (error) {
      console.warn(
        `[Socket.IO Auth] Token verification failed on socket ${socket.id}: ${error.message}`
      );
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const transportName = socket.conn?.transport?.name || "unknown";
    console.log(
      `[Socket.IO] Client connected: ${socket.id} (User: ${socket.user?.id}, Transport: ${transportName})`
    );

    socket.conn?.on("upgrade", (transport) => {
      console.log(
        `[Socket.IO] Transport upgraded to ${transport.name} for socket ${socket.id}`
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`
      );
    });

    socket.on("error", (err) => {
      console.error(
        `[Socket.IO] Socket error on ${socket.id}:`,
        err.message
      );
    });

    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on("discussion:join", async (discussionId) => {
      try {
        const discussion = await Discussion.findById(discussionId);

        if (!discussion || discussion.isDeleted) return;

        const isCreator =
          discussion.creatorId &&
          discussion.creatorId.toString() === socket.user.id;

        const isMember = discussion.members?.some(
          (memberId) => memberId && memberId.toString() === socket.user.id
        );

        const isAdmin = socket.user.role === "Admin";

        if (isCreator || isMember || isAdmin) {
          socket.join(`discussion:${discussionId}`);
          return;
        }

        const course = await Course.findById(discussion.courseId);
        if (course) {
          const isCourseCreator = course.createdBy?.toString() === socket.user.id;
          const isEnrolled = course.enrolled?.some(
            (e) => e?.toString() === socket.user.id
          );
          if (isCourseCreator || isEnrolled) {
            discussion.members = discussion.members || [];
            discussion.members.push(socket.user.id);
            await discussion.save();
            socket.join(`discussion:${discussionId}`);
          }
        }
      } catch (error) {
        console.error("Discussion room error:", error.message);
      }
    });

    socket.on("discussion:leave", (discussionId) => {
      socket.leave(`discussion:${discussionId}`);
    });

    socket.on("direct:join", async (conversationId) => {
      try {
        if (!conversationId) return;
        const conversation = await DirectConversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p && p.toString() === socket.user.id
        );

        if (isParticipant) {
          socket.join(`direct:${conversationId}`);
        }
      } catch (error) {
        console.error("Direct room join error:", error.message);
      }
    });

    socket.on("direct:leave", (conversationId) => {
      socket.leave(`direct:${conversationId}`);
    });
  });
};

export const getSocketIo = () => io;