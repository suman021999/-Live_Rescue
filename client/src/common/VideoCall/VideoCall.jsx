// ================= VIDEO CALL COMPONENT =================

import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import {
  socket,
  joinRoomSocket,
  sendOffer,
  sendAnswer,
  sendIceCandidate,
  endCallSocket,
} from "../../common/service";

export default function VideoCall() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);
  const allStreams = useRef([]); // 🔥 TRACK ALL STREAMS

  const [isMuted, setIsMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [streamReady, setStreamReady] = useState(false);

  const [remoteConnected, setRemoteConnected] = useState(false);
  // ================= STOP ALL CAMERAS =================
  const stopAllCameras = () => {
    allStreams.current.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    allStreams.current = [];
  };

  // ================= INIT =================

  useEffect(() => {
    if (!roomId) return;

    joinRoomSocket(roomId);

    const startMedia = async () => {
      try {
        stopAllCameras();

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

        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        // peerConnection.current.ontrack = (event) => {
        //   if (remoteVideoRef.current) {
        //     remoteVideoRef.current.srcObject = event.streams[0];
        //   }
        // };

        peerConnection.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setRemoteConnected(true); // ✅ SHOW UI
          }
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            sendIceCandidate(roomId, event.candidate);
          }
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        sendOffer(roomId, offer);
      } catch (err) {
        console.error("❌ Media error:", err);
      }
    };

    startMedia();

    // ================= SOCKET EVENTS =================
    socket.on("offer", async (offer) => {
      await peerConnection.current.setRemoteDescription(offer);

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      sendAnswer(roomId, answer);
    });

    socket.on("answer", async (answer) => {
      await peerConnection.current.setRemoteDescription(answer);
    });

    socket.on("ice_candidate", async (candidate) => {
      try {
        await peerConnection.current.addIceCandidate(candidate);
      } catch (err) {
        console.error("❌ ICE error:", err);
      }
    });

    // ✅ ADD HERE (IMPORTANT)
    socket.on("call_ended", () => {
      console.log("📴 Call ended by other user");
      setRemoteConnected(false);
      stopAllCameras();
      peerConnection.current?.close();
      navigate("/emergency");
    });

    // ================= CLEANUP =================
    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice_candidate");
      socket.off("call_ended"); // ✅ cleanup

      stopAllCameras();
      peerConnection.current?.close();

      setStreamReady(false);
    };
  }, [roomId]);

  // ================= CONTROLS =================
  const toggleMute = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  };

  // ================= TOGGLE VIDEO =================
  const toggleVideo = async () => {
    if (!peerConnection.current) return;

    if (!videoOff) {
      // 🔴 TURN OFF CAMERA
      stopAllCameras(); // 💥 GUARANTEED LED OFF

      const sender = peerConnection.current
        .getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) sender.replaceTrack(null);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      setVideoOff(true);
    } else {
      // 🟢 TURN ON CAMERA
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        allStreams.current.push(newStream);

        const newTrack = newStream.getVideoTracks()[0];

        const sender = peerConnection.current
          .getSenders()
          .find((s) => s.track?.kind === "video");

        if (sender) {
          await sender.replaceTrack(newTrack);
        }

        localStreamRef.current = newStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = newStream;
        }

        setVideoOff(false);
      } catch (err) {
        console.error("❌ Camera restart error:", err);
      }
    }
  };

  const handleEndCall = () => {
    // endCallSocket();
    endCallSocket(roomId);
    stopAllCameras(); // 💥 IMPORTANT
    peerConnection.current?.close();
    navigate("/emergency");
  };

  // ================= UI =================
  return (
    <div className="w-full h-screen bg-black relative flex items-center justify-center">
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        className="absolute w-full h-full object-cover"
      />

      <div className="absolute top-4 left-4 text-white z-10">
        <p className="font-semibold">Emergency Responder</p>
        <p className="text-xs text-green-400">● Connected</p>
      </div>

      {remoteConnected && (
        <div className="absolute right-6 top-24 w-32 h-40 bg-black rounded-xl overflow-hidden z-10">
          <video
            ref={remoteVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}

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

        <button className="p-3 bg-gray-700 rounded-full text-white">
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
