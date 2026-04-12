// ================= VIDEO CALL COMPONENT =================

// import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useEffect, useRef, useState } from "react";
// import { io } from "socket.io-client";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// // ✅ FIX: Free public TURN servers (works in production)
// // For a more reliable production app, get your own credentials at:
// // https://www.metered.ca/tools/openrelay/
// const ICE_SERVERS = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" },
//     {
//       urls: "turn:openrelay.metered.ca:80",
//       username: "openrelayproject",
//       credential: "openrelayproject",
//     },
//     {
//       urls: "turn:openrelay.metered.ca:443",
//       username: "openrelayproject",
//       credential: "openrelayproject",
//     },
//     {
//       urls: "turn:openrelay.metered.ca:443?transport=tcp",
//       username: "openrelayproject",
//       credential: "openrelayproject",
//     },
//   ],
// };

// export default function VideoCall() {
//   const navigate = useNavigate();
//   const { roomId } = useParams();

//   const [callType, setCallType] = useState("Emergency");
//   const [facingMode, setFacingMode] = useState("user");
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerConnection = useRef(null);
//   const localStreamRef = useRef(null);
//   const allStreams = useRef([]);
//   const socketRef = useRef(null);
//   const pendingCandidates = useRef([]);
//   const isCaller = useRef(false);
//   const makingOffer = useRef(false);

//   const [isMuted, setIsMuted] = useState(false);
//   const [videoOff, setVideoOff] = useState(false);
//   const [streamReady, setStreamReady] = useState(false);
//   const [remoteConnected, setRemoteConnected] = useState(false);
//   const [status, setStatus] = useState("Connecting...");

//   // ================= STOP ALL CAMERAS =================
//   const stopAllCameras = () => {
//     allStreams.current.forEach((stream) => {
//       stream.getTracks().forEach((track) => track.stop());
//     });
//     allStreams.current = [];
//   };

//   // ================= FLUSH PENDING ICE =================
//   const flushPendingCandidates = async (pc) => {
//     for (const c of pendingCandidates.current) {
//       try {
//         await pc.addIceCandidate(c);
//       } catch (e) {
//         console.warn("ICE flush error:", e);
//       }
//     }
//     pendingCandidates.current = [];
//   };

//   // ================= INIT =================
//   useEffect(() => {
//     if (!roomId) return;

//     // ✅ FIX: Declare pc in the outer scope so cleanup can access it
//     let pc = null;

//     const sock = io(SOCKET_URL, {
//       withCredentials: true,
//       // ✅ FIX: forceNew ensures each tab/component gets its own socket
//       // Without this, both peers share one socket → events fire on both → chaos
//       forceNew: true,
//     });
//     socketRef.current = sock;

//     const init = async () => {
//       try {
//         // 1. Get media first
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });
//         localStreamRef.current = stream;
//         allStreams.current.push(stream);
//         setStreamReady(true);

//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }

//         // ✅ FIX: Assign to outer `pc` (no `const`) so cleanup can close it
//         pc = new RTCPeerConnection(ICE_SERVERS);
//         peerConnection.current = pc;

//         // Add local tracks to peer connection
//         stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//         // Remote stream received
//         pc.ontrack = (event) => {
//           console.log("🎥 Remote track received");
//           if (remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject = event.streams[0];
//           }
//           setRemoteConnected(true);
//           setStatus("Connected");
//         };

//         // ICE candidate generated locally → send to other peer
//         pc.onicecandidate = ({ candidate }) => {
//           if (candidate) {
//             sock.emit("ice_candidate", { roomId, candidate });
//           }
//         };

//         // ✅ Log ICE gathering state to help debug TURN issues
//         pc.onicegatheringstatechange = () => {
//           console.log("🧊 ICE gathering state:", pc.iceGatheringState);
//         };

//         pc.onconnectionstatechange = () => {
//           console.log("🔗 Connection state:", pc.connectionState);
//           if (pc.connectionState === "connected") setStatus("Connected");
//           if (pc.connectionState === "disconnected") setStatus("Reconnecting...");
//           if (pc.connectionState === "failed") {
//             setStatus("Connection failed");
//             console.error("❌ WebRTC connection failed — check TURN server");
//           }
//         };

//         // 3. Set up ALL socket listeners BEFORE emitting join_room
//         sock.on("room_ready", ({ isCaller: caller, type }) => {
//           isCaller.current = caller;
//           if (type) setCallType(type);
//           console.log("📦 room_ready — isCaller:", caller);
//           setStatus(caller ? "Waiting for other peer..." : "Joining call...");
//         });

//         // Server fires this on the FIRST peer when the SECOND peer joins
//         sock.on("start_offer", async () => {
//           console.log("🤝 2nd peer joined → creating offer");
//           try {
//             makingOffer.current = true;
//             const offer = await pc.createOffer();
//             await pc.setLocalDescription(offer);
//             sock.emit("offer", { roomId, offer });
//             console.log("📤 Offer sent");
//           } catch (e) {
//             console.error("❌ Offer error:", e);
//           } finally {
//             makingOffer.current = false;
//           }
//         });

//         // Received offer from the caller
//         sock.on("offer", async (offer) => {
//           console.log("📥 Offer received — signaling state:", pc.signalingState);
//           try {
//             const collision =
//               makingOffer.current || pc.signalingState !== "stable";
//             if (collision) {
//               console.warn("⚠️ Offer collision — rolling back");
//               await Promise.all([
//                 pc.setLocalDescription({ type: "rollback" }),
//                 pc.setRemoteDescription(new RTCSessionDescription(offer)),
//               ]);
//             } else {
//               await pc.setRemoteDescription(new RTCSessionDescription(offer));
//             }
//             await flushPendingCandidates(pc);
//             const answer = await pc.createAnswer();
//             await pc.setLocalDescription(answer);
//             sock.emit("answer", { roomId, answer });
//             console.log("📤 Answer sent");
//           } catch (e) {
//             console.error("❌ Handle offer error:", e);
//           }
//         });

//         // Received answer from the answerer
//         sock.on("answer", async (answer) => {
//           console.log("📥 Answer received — signaling state:", pc.signalingState);
//           try {
//             if (pc.signalingState === "have-local-offer") {
//               await pc.setRemoteDescription(new RTCSessionDescription(answer));
//               await flushPendingCandidates(pc);
//               console.log("✅ Remote description set from answer");
//             } else {
//               console.warn("⚠️ Unexpected state for answer:", pc.signalingState);
//             }
//           } catch (e) {
//             console.error("❌ Handle answer error:", e);
//           }
//         });

//         // ICE candidate from the other peer
//         sock.on("ice_candidate", async (candidate) => {
//           if (!pc.remoteDescription || !pc.remoteDescription.type) {
//             // Buffer if remote description not set yet
//             pendingCandidates.current.push(new RTCIceCandidate(candidate));
//           } else {
//             try {
//               await pc.addIceCandidate(new RTCIceCandidate(candidate));
//             } catch (e) {
//               console.warn("ICE add error:", e);
//             }
//           }
//         });

//         // Other peer ended the call
//         sock.on("call_ended", () => {
//           console.log("📴 Call ended by other peer");
//           setRemoteConnected(false);
//           stopAllCameras();
//           pc.close();
//           navigate("/emergency");
//         });

//         // 4. NOW join the room — all listeners are set up above
//         sock.emit("join_room", roomId);
//         console.log("📦 Emitted join_room:", roomId);
//       } catch (err) {
//         console.error("❌ Init error:", err);
//         setStatus("Camera/mic error");
//       }
//     };

//     init();

//     // ================= CLEANUP =================
//     return () => {
//       sock.off("room_ready");
//       sock.off("start_offer");
//       sock.off("offer");
//       sock.off("answer");
//       sock.off("ice_candidate");
//       sock.off("call_ended");
//       sock.disconnect();
//       stopAllCameras();
//       // ✅ FIX: `pc` is now the outer variable — correctly closes the connection
//       pc?.close();
//       setStreamReady(false);
//     };
//   }, [roomId]);

//   // ================= CONTROLS =================
//   const toggleMute = () => {
//     const stream = localStreamRef.current;
//     if (!stream) return;
//     stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
//     setIsMuted((p) => !p);
//   };

//   const toggleVideo = async () => {
//     const pc = peerConnection.current;
//     if (!pc) return;

//     if (!videoOff) {
//       // Turn off — stop all camera tracks
//       stopAllCameras();
//       const sender = pc.getSenders().find((s) => s.track?.kind === "video");
//       if (sender) sender.replaceTrack(null);
//       if (localVideoRef.current) localVideoRef.current.srcObject = null;
//       setVideoOff(true);
//     } else {
//       // Turn on — restart camera
//       try {
//         const newStream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//         });
//         allStreams.current.push(newStream);
//         const newTrack = newStream.getVideoTracks()[0];
//         const sender = pc.getSenders().find((s) => s.track?.kind === "video");
//         if (sender) await sender.replaceTrack(newTrack);
//         localStreamRef.current = newStream;
//         if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
//         setVideoOff(false);
//       } catch (e) {
//         console.error("❌ Camera restart error:", e);
//       }
//     }
//   };

//   const handleEndCall = () => {
//     socketRef.current?.emit("end_call", { callId: roomId });
//     stopAllCameras();
//     peerConnection.current?.close();
//     navigate("/emergency");
//   };

//   const switchCamera = async () => {
//     const pc = peerConnection.current;
//     if (!pc) return;

//     // Just toggle the stored mode if video is off — don't start camera
//     if (videoOff) {
//       const newFacingMode = facingMode === "user" ? "environment" : "user";
//       setFacingMode(newFacingMode);
//       console.log("🔁 Camera switched (OFF state) →", newFacingMode);
//       return;
//     }

//     try {
//       const newFacingMode = facingMode === "user" ? "environment" : "user";

//       // Stop only video tracks — keep audio running
//       const currentStream = localStreamRef.current;
//       currentStream?.getVideoTracks().forEach((track) => track.stop());

//       // ⚠️ Don't request audio again — prevents mic glitch
//       const newStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: newFacingMode },
//       });

//       allStreams.current.push(newStream);

//       const newVideoTrack = newStream.getVideoTracks()[0];

//       // Replace the video track in the peer connection
//       const sender = pc.getSenders().find((s) => s.track?.kind === "video");
//       if (sender) {
//         await sender.replaceTrack(newVideoTrack);
//       }

//       // Merge with existing audio
//       const audioTracks = localStreamRef.current?.getAudioTracks() || [];
//       const combinedStream = new MediaStream([...audioTracks, newVideoTrack]);

//       localStreamRef.current = combinedStream;

//       if (localVideoRef.current) {
//         localVideoRef.current.srcObject = combinedStream;
//       }

//       setFacingMode(newFacingMode);
//     } catch (err) {
//       console.error("❌ Camera switch error:", err);
//     }
//   };

//   const formatType = (str) => {
//     if (!str) return "";
//     return str.charAt(0).toUpperCase() + str.slice(1);
//   };

//   // ================= UI =================
//   return (
//     <div className="w-full h-screen bg-black relative flex items-center justify-center">
//       {/* Local video — full screen background */}
//       <video
//         ref={localVideoRef}
//         autoPlay
//         playsInline
//         muted
//         className="absolute w-full h-full object-cover"
//       />

//       {/* Top-left status */}
//       <div className="absolute top-4 left-4 text-white z-10">
//         <p className="font-semibold">
//           {formatType(callType)} Emergency Responder
//         </p>
//         <p className="text-xs text-green-400">● {status}</p>
//       </div>

//       {/* Remote video PiP — always mounted so ref is always valid */}
//       <div
//         className={`absolute right-6 top-24 w-32 h-40 bg-gray-900 rounded-xl overflow-hidden z-10 border border-white/20 transition-opacity duration-300 ${
//           remoteConnected ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//       >
//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           playsInline
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* Control bar */}
//       <div className="absolute bottom-6 flex items-center gap-4 bg-gray-700/50 px-6 py-3 rounded-full backdrop-blur-md">
//         <button
//           onClick={toggleMute}
//           disabled={!streamReady}
//           className={`p-3 rounded-full text-white ${isMuted ? "bg-red-500" : "bg-gray-700"}`}
//         >
//           {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
//         </button>

//         <button
//           onClick={toggleVideo}
//           disabled={!streamReady}
//           className={`p-3 rounded-full text-white ${videoOff ? "bg-red-500" : "bg-gray-700"}`}
//         >
//           {videoOff ? <VideoOff size={18} /> : <Video size={18} />}
//         </button>

//         <button
//           onClick={switchCamera}
//           className="p-3 bg-gray-700 rounded-full text-white"
//         >
//           <Monitor size={18} />
//         </button>

//         <button
//           onClick={handleEndCall}
//           className="p-3 bg-red-600 rounded-full text-white"
//         >
//           <PhoneOff size={18} />
//         </button>
//       </div>
//     </div>
//   );
// }




















// // ================= VIDEO CALL COMPONENT =================

import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// 🔥 Use env variable for socket URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function VideoCall() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [callType, setCallType] = useState("Emergency");
  const [facingMode, setFacingMode] = useState("user");
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const allStreams = useRef([]);
  const socketRef = useRef(null); // 🔥 LOCAL SOCKET — not the global singleton
  const pendingCandidates = useRef([]);
  const isCaller = useRef(false);
  const makingOffer = useRef(false);

  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [status, setStatus] = useState("Connecting...");

  // ================= STOP ALL CAMERAS =================
  const stopAllCameras = () => {
    allStreams.current.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    allStreams.current = [];
  };

  // ================= FLUSH PENDING ICE =================
  const flushPendingCandidates = async (pc) => {
    for (const c of pendingCandidates.current) {
      try {
        await pc.addIceCandidate(c);
      } catch (e) {
        console.warn("ICE flush error:", e);
      }
    }
    pendingCandidates.current = [];
  };

  // ================= INIT =================
  useEffect(() => {
    if (!roomId) return;

    let pc = null;

    // 🔥 KEY FIX: forceNew: true — each tab gets its OWN socket connection
    // Without this, both tabs share one socket singleton → events fire on both → chaos
    const sock = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      forceNew: true,
    });
    socketRef.current = sock;

    const init = async () => {
      try {
        // 1. Get media first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        allStreams.current.push(stream);
        setStreamReady(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [
            // ✅ STUN (keep)
            { urls: "stun:stun.l.google.com:19302" },

            // 🔥 TURN (ADD THIS)
            {
              urls: "turn:relay.metered.ca:80",
              username: "YOUR_USERNAME",
              credential: "YOUR_PASSWORD",
            },
          ],
        });

        

        peerConnection.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Remote stream received
        pc.ontrack = (event) => {
          console.log("🎥 Remote track received");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setRemoteConnected(true);
          setStatus("Connected");
        };

        // ICE candidate generated locally
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            sock.emit("ice_candidate", { roomId, candidate });
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("🔗 Connection state:", pc.connectionState);
          if (pc.connectionState === "connected") setStatus("Connected");
          if (pc.connectionState === "disconnected")
            setStatus("Reconnecting...");
          if (pc.connectionState === "failed") setStatus("Connection failed");
        };

        // 3. Set up ALL socket listeners BEFORE emitting join_room
        //    This is critical — server may respond instantly

        // Server tells us: are we first (caller) or second (answerer) in the room?
        sock.on("room_ready", ({ isCaller: caller, type }) => {
          isCaller.current = caller;

          // Set the specific type (e.g., medical, sos)
          if (type) setCallType(type);
          console.log("📦 room_ready — isCaller:", caller);
          setStatus(caller ? "Waiting for other peer..." : "Joining call...");
          // If caller: we wait for "start_offer" (triggered when 2nd peer joins)
          // If answerer: we wait for "offer"
        });

        // Server fires this on the FIRST peer when the SECOND peer joins
        sock.on("start_offer", async () => {
          console.log("🤝 2nd peer joined → creating offer");
          try {
            makingOffer.current = true;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sock.emit("offer", { roomId, offer });
            console.log("📤 Offer sent");
          } catch (e) {
            console.error("❌ Offer error:", e);
          } finally {
            makingOffer.current = false;
          }
        });

        // Received offer from the caller
        sock.on("offer", async (offer) => {
          console.log(
            "📥 Offer received — signaling state:",
            pc.signalingState
          );
          try {
            const collision =
              makingOffer.current || pc.signalingState !== "stable";
            if (collision) {
              console.warn("⚠️ Offer collision — rolling back");
              await Promise.all([
                pc.setLocalDescription({ type: "rollback" }),
                pc.setRemoteDescription(new RTCSessionDescription(offer)),
              ]);
            } else {
              await pc.setRemoteDescription(new RTCSessionDescription(offer));
            }
            await flushPendingCandidates(pc);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sock.emit("answer", { roomId, answer });
            console.log("📤 Answer sent");
          } catch (e) {
            console.error("❌ Handle offer error:", e);
          }
        });

        // Received answer from the answerer
        sock.on("answer", async (answer) => {
          console.log(
            "📥 Answer received — signaling state:",
            pc.signalingState
          );
          try {
            if (pc.signalingState === "have-local-offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
              await flushPendingCandidates(pc);
              console.log("✅ Remote description set from answer");
            } else {
              console.warn(
                "⚠️ Unexpected state for answer:",
                pc.signalingState
              );
            }
          } catch (e) {
            console.error("❌ Handle answer error:", e);
          }
        });

        // ICE candidate from the other peer
        sock.on("ice_candidate", async (candidate) => {
          if (!pc.remoteDescription || !pc.remoteDescription.type) {
            // Buffer if remote description not set yet
            pendingCandidates.current.push(new RTCIceCandidate(candidate));
          } else {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.warn("ICE add error:", e);
            }
          }
        });

        // Other peer ended the call
        sock.on("call_ended", () => {
          console.log("📴 Call ended by other peer");
          setRemoteConnected(false);
          stopAllCameras();
          pc.close();
          navigate("/emergency");
        });

        // 4. NOW join the room — listeners are all set up above
        sock.emit("join_room", roomId);
        console.log("📦 Emitted join_room:", roomId);
      } catch (err) {
        console.error("❌ Init error:", err);
        setStatus("Camera/mic error");
      }
    };

    init();

    // ================= CLEANUP =================
    return () => {
      sock.off("room_ready");
      sock.off("start_offer");
      sock.off("offer");
      sock.off("answer");
      sock.off("ice_candidate");
      sock.off("call_ended");
      sock.disconnect();
      stopAllCameras();
      pc?.close();
      setStreamReady(false);
    };
  }, [roomId]);

  // ================= CONTROLS =================
  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((p) => !p);
  };

  const toggleVideo = async () => {
    const pc = peerConnection.current;
    if (!pc) return;

    if (!videoOff) {
      // Turn off
      stopAllCameras();
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) sender.replaceTrack(null);
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setVideoOff(true);
    } else {
      // Turn on
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        allStreams.current.push(newStream);
        const newTrack = newStream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(newTrack);
        localStreamRef.current = newStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = newStream;
        setVideoOff(false);
      } catch (e) {
        console.error("❌ Camera restart error:", e);
      }
    }
  };

  const handleEndCall = () => {
    socketRef.current?.emit("end_call", { callId: roomId });
    stopAllCameras();
    peerConnection.current?.close();
    navigate("/emergency");
  };

const switchCamera = async () => {
  const pc = peerConnection.current;
  if (!pc) return;

  // ✅ Just change mode if video is OFF (don't start camera)
  if (videoOff) {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);
    console.log("🔁 Camera switched (OFF state) →", newFacingMode);
    return;
  }

  try {
    const newFacingMode = facingMode === "user" ? "environment" : "user";

    // Stop only video tracks (not audio ❗)
    const currentStream = localStreamRef.current;
    currentStream?.getVideoTracks().forEach((track) => track.stop());

    // ⚠️ IMPORTANT: Don't request audio again (prevents mic glitch)
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacingMode },
    });

    allStreams.current.push(newStream);

    const newVideoTrack = newStream.getVideoTracks()[0];

    // Replace track in peer connection
    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
    if (sender) {
      await sender.replaceTrack(newVideoTrack);
    }

    // Merge with existing audio stream
    const audioTracks = localStreamRef.current?.getAudioTracks() || [];
    const combinedStream = new MediaStream([
      ...audioTracks,
      newVideoTrack,
    ]);

    localStreamRef.current = combinedStream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = combinedStream;
    }

    setFacingMode(newFacingMode);
  } catch (err) {
    console.error("❌ Camera switch error:", err);
  }
};

  // Helper function to capitalize the type
  const formatType = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // ================= UI =================
  return (
    <div className="w-full h-screen bg-black relative flex items-center justify-center">
      {/* Local video — full screen background */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute w-full h-full object-cover"
      />

      {/* Top-left status */}
      <div className="absolute top-4 left-4 text-white z-10">
        <p className="font-semibold">
          {formatType(callType)} Emergency Responder
        </p>
        <p className="text-xs text-green-400">● {status}</p>
      </div>

      {/* Remote video PiP — always mounted so ref is always valid */}
      <div
        className={`absolute right-6 top-24 w-32 h-40 bg-gray-900 rounded-xl overflow-hidden z-10 border border-white/20 transition-opacity duration-300 ${
          remoteConnected ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Control bar */}
      <div className="absolute bottom-6 flex items-center gap-4 bg-gray-700/50 px-6 py-3 rounded-full backdrop-blur-md">
        <button
          onClick={toggleMute}
          disabled={!streamReady}
          className={`p-3 rounded-full text-white ${isMuted ? "bg-red-500" : "bg-gray-700"}`}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          onClick={toggleVideo}
          disabled={!streamReady}
          className={`p-3 rounded-full text-white ${videoOff ? "bg-red-500" : "bg-gray-700"}`}
        >
          {videoOff ? <VideoOff size={18} /> : <Video size={18} />}
        </button>

        <button onClick={switchCamera} className="p-3 bg-gray-700 rounded-full text-white">
          <Monitor size={18} />
        </button>

        <button
          onClick={handleEndCall}
          className="p-3 bg-red-600 rounded-full text-white"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}


//index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import { Server } from "socket.io";
import { sendMeetingEmail } from "./utils/sendMail.js";
import database from "./db/database.js";
import userRoutes from "./routes/user.route.js";
import callRoutes from "./routes/call.route.js";
import accountRoutes from "./routes/account.routes.js";
import emergencyContactRoutes from "./routes/emergencyContact.route.js";
import securitytRoutes from "./routes/security.routes.js";

// ================= INIT =================
dotenv.config();

const app = express();
const server = http.createServer(app);

// ================= DATABASE =================
database();

// ================= CORS =================


const corsOptions = {
  origin: ["https://live-rescue.vercel.app", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

app.use(cors(corsOptions));

// ================= MIDDLEWARE =================
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/call", callRoutes);
app.use("/api/v1/account", accountRoutes);
app.use("/api/v1/emergencyContact", emergencyContactRoutes);
app.use("/api/v1/security", securitytRoutes);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: ["https://live-rescue.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // ✅ CRITICAL FIX
});

// 🔥 RESPONDERS STORAGE (multi-type)
let responders = {
  medical: [],
  sos: [],
  disaster: [],
  roadside: [],
};
const roomMetadata = {};
let users = [];

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  // ================= USER JOIN =================
  socket.on("join_user", (user) => {
    users.push({ socketId: socket.id, ...user });
    console.log("👤 User joined");
  });

  // ================= RESPONDER JOIN =================
  socket.on("join_responder", ({ type, name }) => {
    if (!responders[type]) responders[type] = [];
    responders[type].push({ socketId: socket.id, name });
    console.log(`✅ ${type} responder joined`);
  });

  // ================= CALL REQUEST =================
  socket.on("call_request", async ({ type, userId }) => {
    console.log("📞 Call requested:", type);

    const roomId = `${socket.id}`;
    // Store the type for this room
    roomMetadata[roomId] = type;

    socket.emit("call_accepted", { roomId, type });

    try {
      await sendMeetingEmail("sankupatra2@gmail.com", roomId);
      console.log("📧 Email sent successfully");
    } catch (err) {
      console.error("❌ Email failed:", err);
    }

    const availableResponders = responders[type];

    if (!availableResponders || availableResponders.length === 0) {
      socket.emit("no_responder_available");
      return;
    }

    const responder = availableResponders[0];
    io.to(responder.socketId).emit("incoming_call", { roomId, userId, type });
  });

  // ================= JOIN ROOM =================
  // 🔥 FIXED: Coordinate caller/answerer roles properly
  socket.on("join_room", (roomId) => {
    socket.join(roomId);

    const room = io.sockets.adapter.rooms.get(roomId);
    const peerCount = room ? room.size : 0;

    // Get the type we stored earlier
    const type = roomMetadata[roomId] || "Emergency";

    console.log(`📦 join_room: ${roomId} — peers in room: ${peerCount}`);

    if (peerCount === 1) {
      // First peer: they are the caller, wait for 2nd peer
      socket.emit("room_ready", { isCaller: true, type });
      console.log(`👤 First peer in room ${roomId} — waiting for 2nd`);
    } else {
      // Second peer joined
      socket.emit("room_ready", { isCaller: false, type });

      // 🔥 Tell the FIRST peer to create and send the offer NOW
      socket.to(roomId).emit("start_offer");
      console.log(`🤝 Second peer joined ${roomId} — triggering offer`);
    }
  });

  // ================= WEBRTC SIGNALING =================
  socket.on("offer", ({ roomId, offer }) => {
    console.log(`📡 Relaying offer in room ${roomId}`);
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    console.log(`📡 Relaying answer in room ${roomId}`);
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice_candidate", candidate);
  });

  // ================= END CALL =================
  socket.on("end_call", ({ callId }) => {
    delete roomMetadata[callId];
    console.log("📴 Call ended:", callId);
    socket.broadcast.emit("call_ended", { callId });
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
        console.log(`🚪 Left room: ${room}`);
      }
    });
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    users = users.filter((u) => u.socketId !== socket.id);
    Object.keys(responders).forEach((type) => {
      responders[type] = responders[type].filter(
        (r) => r.socketId !== socket.id
      );
    });
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});




// server/utils/sendMail.js

import nodemailer from "nodemailer";

export const sendMeetingEmail = async (to, roomId) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // 🔥 change this
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // ✅ DEBUG SMTP CONNECTION
  try {
    await transporter.verify();
    console.log("✅ SMTP is ready");
  } catch (err) {
    console.error("❌ SMTP ERROR:", err.message);
    return;
  }

  const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

  try {
    const info = await transporter.sendMail({
      from: `"LiveRescue" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🚑 Emergency Call - Join Now",
      html: `
        <h2>Emergency Call Request</h2>
        <p>You have an incoming emergency call.</p>
        <a href="${joinLink}" style="padding:10px 20px;background:red;color:white;text-decoration:none;">
          Join Call
        </a>
        <p>Room ID: ${joinLink}</p>
      `,
    });

    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ SEND ERROR:", err.message);
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
  }
};


// import nodemailer from "nodemailer";

// export const sendMeetingEmail = async (to, roomId) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com", // ✅ use host instead of service
//     port: 587,
//     secure: false, // TLS
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, // ⚠️ MUST be App Password
//     },
//   });

//   // ✅ DEBUG SMTP CONNECTION
//   try {
//     await transporter.verify();
//     console.log("✅ SMTP is ready");
//   } catch (err) {
//     console.error("❌ SMTP ERROR FULL:", err); // 🔥 FULL ERROR
//     return;
//   }

//   const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

//   try {
//     const info = await transporter.sendMail({
//       from: `"LiveRescue" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: "🚑 Emergency Call - Join Now",
//       html: `
//         <h2>Emergency Call Request</h2>
//         <p>You have an incoming emergency call.</p>
//         <a href="${joinLink}" style="padding:10px 20px;background:red;color:white;text-decoration:none;">
//           Join Call
//         </a>
//         <p>Room ID: ${joinLink}</p>
//       `,
//     });

//     console.log("✅ Email sent:", info);
//   } catch (err) {
//     console.error("❌ SEND ERROR FULL:", err); // 🔥 FULL ERROR
//   }
// };



// import nodemailer from "nodemailer";
// import dns from "dns";

// // Force IPv4 — fixes ENETUNREACH on Render/Railway/Vercel serverless
// dns.setDefaultResultOrder("ipv4first");

// export const sendMeetingEmail = async (to, roomId) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     family: 4, // 👈 Force IPv4 socket
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, // Must be Gmail App Password
//     },
//     tls: {
//       rejectUnauthorized: false, // Avoids cert issues on some hosts
//     },
//   });

//   try {
//     await transporter.verify();
//     console.log("✅ SMTP is ready");
//   } catch (err) {
//     console.error("❌ SMTP VERIFY ERROR:", err.message);
//     throw err; // Let caller handle it
//   }

//   const joinLink = `${process.env.FRONTEND_URL}/video-call/${roomId}`;

//   const info = await transporter.sendMail({
//     from: `"LiveRescue" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: "🚑 Emergency Call - Join Now",
//     html: `
//       <h2>Emergency Call Request</h2>
//       <p>You have an incoming emergency call.</p>
//       <a href="${joinLink}" style="padding:10px 20px;background:red;color:white;text-decoration:none;border-radius:4px;">
//         Join Call
//       </a>
//       <p>Room ID: ${roomId}</p>
//     `,
//   });

//   console.log("✅ Email sent:", info.messageId);
//   return info;
// };