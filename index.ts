import http from "http"; // HTTP module
import { Server } from "socket.io"; // WebSocket server

// Initialize HTTP server.....
const server = http.createServer();

//step 1:  Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
  },
});

//step 1.1: Namespace for WebSocket events
const peers = io.of("/mediasoup");

//step 1.2 :  Handle peer connection and events
peers.on("connection", (socket) => {
  console.log(`New peer connected: ${socket.id}`);


  //step 2 : handling request 'getRouterRtpCapabilties' from client
  socket.on("getRouterRtpCapabilities", () => {
    const routerRtpCapabilities = {
      codecs: [
        {
          mimeType: "audio/opus",
          payloadType: 111,
        },
        {
          mimeType: "video/vp8",
          payloadType: 100,
        },
        {
          mimeType: "video/h264",
          payloadType: 102,
        },
      ],
      headerExtensions: [
        { uri: "urn:ietf:params:rtp-hdrext:sdes:mid" },
        { uri: "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id" },
      ],
      // Include other necessary RTP capabilities here
    };

    //sending the routerRtpCapabilities to client
    socket.emit("routerRtpCapabilities",routerRtpCapabilities);

  });

  
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
