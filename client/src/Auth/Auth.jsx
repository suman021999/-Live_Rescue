import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const testimonials = [
  {
    text: "LiveRescue helped me connect with a doctor instantly during an emergency. It literally saved precious time.",
    name: "Ravi M.",
    role: "Emergency Patient",
    avatar: "RM",
  },
  {
    text: "The Safety SOS feature helped me alert authorities and trusted contacts instantly during a harassment incident. I felt protected and supported.",
    name: "Neha K.",
     role: "SOS Alert User",
    avatar: "NK",
  },
  {
    text: "During a flood situation, I quickly got help from rescue volunteers through this app. Amazing service.",
    name: "Anita S.",
    role: "Survivor",
    avatar: "AS",
  },
  {
    text: "Roadside assistance arrived within minutes after I requested help. Super reliable platform.",
    name: "Karan P.",
    role: "Driver",
    avatar: "KP",
  },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 🔥 AUTO CAROUSEL
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) =>
        prev === testimonials.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const validate = () => {
    const newErrors = {};

    if (!isLogin && !form.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isLogin) {
      alert("Logged in successfully!");
      navigate("/emergency");
    } else {
      alert("Account created successfully!");
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-162.5">
        {/* LEFT PANEL */}
        <div className="relative bg-black flex flex-col justify-between p-10 md:w-[52%] overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-10 right-0 w-56 h-56 rounded-full border border-white/10 translate-x-1/3" />

          <div className="relative z-10 mt-6">
            <h1 className="text-white text-4xl font-bold leading-tight tracking-tight">
              Emergency Help
              <br />
              When You
              <br />
              Need It Most
            </h1>

            <div className="mt-3 w-16 h-0.5 bg-white/60 rounded" />

            <p className="mt-4 text-white/60 text-sm leading-relaxed max-w-xs">
              LiveRescue connects you instantly with doctors, rescue teams, and
              roadside assistance during emergencies.
            </p>
          </div>

          {/* TESTIMONIAL */}
          <div className="relative z-10 mt-8">
            <div
              className="bg-[#e8f5a3] rounded-2xl p-5 text-black text-sm shadow-lg"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <p className="mb-4 text-[13px]">
                {testimonials[activeSlide].text}
              </p>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-xs font-bold">
                  {testimonials[activeSlide].avatar}
                </div>

                <div>
                  <p className="font-semibold text-xs">
                    {testimonials[activeSlide].name}
                  </p>
                  <p className="text-[11px] text-black/60">
                    {testimonials[activeSlide].role}
                  </p>
                </div>
              </div>
            </div>

            {/* DOTS */}
            <div className="flex gap-2 mt-4 justify-center">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeSlide ? "bg-white w-6" : "bg-white/30 w-3"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col items-center justify-center px-8 py-10 md:w-[48%]">
          {/* LOGO */}
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-3 shadow-md">
            <span className="text-white text-xl font-bold">+</span>
          </div>

          <p className="text-[11px] tracking-widest font-semibold uppercase mb-1">
            Live Rescue
          </p>

          <p className="text-gray-400 text-sm mb-6">
            {isLogin ? "Welcome Back" : "Join LiveRescue"}
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
            {!isLogin && (
              <div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={`w-full border rounded-lg px-4 py-3 text-sm ${
                    errors.name ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email address"
                className={`w-full border rounded-lg px-4 py-3 text-sm ${
                  errors.email ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full border rounded-lg px-4 py-3 text-sm pr-10 ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}

            {!isLogin && (
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={`w-full border rounded-lg px-4 py-3 text-sm pr-10 ${
                    errors.confirmPassword
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white rounded-lg py-3 text-sm font-medium hover:bg-gray-800"
            >
              {isLogin ? "Sign In to Continue" : "Create Rescue Account"}
            </button>
          </form>

          <p className="text-gray-400 text-xs mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-black font-semibold hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
