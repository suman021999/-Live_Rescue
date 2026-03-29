import { Mic, Video, Monitor, PhoneOff} from "lucide-react";
import {  useNavigate } from "react-router-dom";

export default function VideoCall() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen bg-black relative flex items-center justify-center">

      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3"
        alt="call"
        className="absolute w-full h-full object-cover opacity-70"
      />

      {/* Top Bar */}
      <div className="absolute top-4 left-4 flex items-center gap-3 text-white">

 

  {/* Doctor Info */}
  <div>
    <p className="font-semibold">Dr. Emily Chen</p>
    <p className="text-xs text-red-400">● Emergency Specialist</p>
  </div>

</div>
         

      {/* Small User Camera */}
      <div className="absolute right-6 top-24 w-32 h-40 bg-white rounded-xl overflow-hidden shadow-lg">
        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="user"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 flex items-center gap-4 bg-black/50 px-6 py-3 rounded-full backdrop-blur-md">

        <button className="p-3 bg-gray-700 rounded-full text-white">
          <Mic size={18} />
        </button>

        <button className="p-3 bg-gray-700 rounded-full text-white">
          <Video size={18} />
        </button>

        <button className="p-3 bg-gray-700 rounded-full text-white">
          <Monitor size={18} />
        </button>

        <button
          onClick={() => navigate("/emergency")}
          className="p-3 bg-red-600 rounded-full text-white"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}