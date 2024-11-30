import http from "http"; // HTTP module
import { Server } from "socket.io"; // WebSocket server
import { types as mediasoupTypes, createWorker } from "mediasoup";




let worker: mediasoupTypes.Worker;
let router: mediasoupTypes.Router;

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
  
  socket.on("getRouterRtpCapabilities", async () => {
    if (!router) {
      await createWorkerRouter(); // Ensure router is initialized
    }


    //send routerRTpCapabilities to client
    //@consider erros occure: emit() is used for broadcast not private signal message 
    socket.emit("routerRtpCapabilities",router.rtpCapabilities);

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


async function createWorkerRouter()
{
  worker = await createWorker();

   const mediaCodecs: mediasoupTypes.RtpCodecCapability[] = [
    { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
    { kind: "video", mimeType: "video/VP8", clockRate: 90000 },
  ];

  router = await worker.createRouter({ mediaCodecs });

  console.log("Worker and Router Created");
}


// Start the server
const port = 3001;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
