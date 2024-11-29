import http from "http"; // HTTP module
import { Server } from "socket.io"; // WebSocket server

// Initialize HTTP server
const server = http.createServer();

// Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
  },
});

// Namespace for WebSocket events
const peers = io.of("/mediasoup");

// Handle peer connection and events
peers.on("connection", (socket) => {
  console.log(`New peer connected: ${socket.id}`);

  // Handle 'sendMessage' event from client
  socket.on("sendMessage", (message) => {
    console.log(`Message from ${socket.id}: ${message}`);
    // Optionally broadcast the message to other clients
    peers.emit("receiveMessage", { sender: socket.id, message });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Peer disconnected: ${socket.id}`);
  });
});

// Start the server
const port = 3001;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
