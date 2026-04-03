import { useState, useEffect } from "react";
import { Video, UserRound, Sparkle, Loader2 } from "lucide-react";
import { cards } from "../../common/data";
import { useNavigate } from "react-router-dom";
import { requestCallSocket, socket } from "../../common/service";

export default function Emergency() {
  const [calling, setCalling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("call_accepted", ({ roomId }) => {
      console.log("✅ Got roomId from backend:", roomId);

      navigate(`/video-call/${roomId}`);
    });

    return () => {
      socket.off("call_accepted");
    };
  }, []);

  const handleCall = (id) => {
    setCalling(id);

    requestCallSocket({
      type: id,
      userId: "user123",
    });
  };

  return (
    <div className="w-full font-sans pt-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white flex justify-between px-4 sm:px-6 py-4 gap-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-bold leading-none">+</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">LiveRescue</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => navigate("/my_account")}
            className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm hover:scale-105"
          >
            <UserRound className="w-4 h-4" />
            My Account
          </button>

          <button
            onClick={() => navigate("/view_plans")}
            className="text-sm text-white bg-orange-500 rounded-lg px-3 py-1.5 flex items-center gap-1.5 font-medium transition-all duration-200 hover:bg-orange-600 hover:shadow-md hover:scale-105"
          >
            <Sparkle className="w-4 h-4" />
            View Plans
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center pt-8 pb-6 px-4 sm:px-6">
        <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          What type of help do you need right now?
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Tap a button to instantly start a live video call.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-8 lg:px-24 pb-6 sm:pb-10 lg:pb-0">
        {cards.map((card) => {
          const titleColor = "text-white";
          const subtitleColor = "text-white/80";
          const btnTextColor = "text-white";

          return (
            <button
              key={card.id}
              onClick={() => handleCall(card.id)}
              className={`${card.bg} ${card.hoverBg} rounded-2xl p-6 min-h-72 flex flex-col items-center justify-between gap-3 transition active:scale-95`}
            >
              <div className={`${card.iconBg} rounded-full p-4`}>
                <card.icon className={`w-6 h-6 ${"text-white"}`} />
              </div>

              <div className="text-center">
                <p className={`font-bold text-base ${titleColor}`}>
                  {card.title}
                </p>
                <p className={`text-xs mt-0.5 ${subtitleColor}`}>
                  {card.subtitle}
                </p>
              </div>

              <div
                className={`${card.btnBg} ${btnTextColor} text-xs font-semibold rounded-full px-6 py-4 flex items-center gap-1.5 mt-1`}
              >
                {calling === card.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" />
                    Join Video Call
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
