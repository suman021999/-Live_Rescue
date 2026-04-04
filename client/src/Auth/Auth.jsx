import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { testimonials } from "../common/data";


// ✅ IMPORT SERVICES
import { loginUser, registerUser, googleAuth } from "../common/service";
import toast from "react-hot-toast";

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
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // ✅ VALIDATION
  const validate = () => {
    const newErrors = {};

    if (!isLogin && !form.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Enter a valid email address.";
    }

    const passwordErrors = [];

    if (form.password.length < 8) {
      passwordErrors.push("8 characters");
    }

    if (!/[A-Z]/.test(form.password)) {
      passwordErrors.push("1 uppercase letter");
    }

    const numberCount = (form.password.match(/[0-9]/g) || []).length;
    if (numberCount < 4) {
      passwordErrors.push("at least 4 numbers");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      passwordErrors.push("1 special character");
    }

    if (passwordErrors.length > 0) {
      newErrors.password = `Password must include ${passwordErrors.join(", ")}`;
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  // ✅ INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  // ✅ SUBMIT (LOGIN / REGISTER)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      if (isLogin) {
        const res = await loginUser({
          email: form.email,
          password: form.password,
        });

        toast.success(res.message);
        navigate("/emergency");
      } else {
        const res = await registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
        });

        alert(res.message);
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ GOOGLE SUCCESS HANDLER (🔥 THIS IS WHAT YOU WANTED)
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await googleAuth(credentialResponse.credential);

      toast.success(res.message || "Google login successful");
      navigate("/emergency");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-162.5">
        {/* LEFT PANEL */}
        <div className="relative bg-black flex flex-col justify-between p-10 md:w-[52%] overflow-hidden">
          <div className="relative z-10 mt-6">
            <h1 className="text-white text-4xl font-bold leading-tight">
              Emergency Help
              <br />
              When You
              <br />
              Need It Most
            </h1>

            <p className="mt-4 text-white/60 text-sm max-w-xs">
              LiveRescue connects you instantly with doctors, rescue teams, and
              roadside assistance.
            </p>
          </div>

          {/* TESTIMONIAL */}
          <div className="mt-8">
            <div
              className="bg-[#e8f5a3] rounded-2xl p-5 text-black text-sm"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <p className="mb-4 text-[13px]">
                {testimonials[activeSlide].text}
              </p>

              <p className="text-xs font-semibold">
                {testimonials[activeSlide].name}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col items-center justify-center px-8 py-10 md:w-[48%]">
          {/* 🔥 LOGO */}
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
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full border rounded-lg px-4 py-3 text-sm"
              />
            )}

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full border rounded-lg px-4 py-3 text-sm"
            />

            {/* PASSWORD */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={`w-full border rounded-lg px-4 py-3 text-sm pr-10 ${
                    errors.password ? "border-red-500" : "border-gray-200"
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
                <p className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            {!isLogin && (
              <div>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`w-full border rounded-lg px-4 py-3 text-sm pr-10 ${
                      errors.confirmPassword
                        ? "border-red-500"
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
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button className="w-full bg-black text-white rounded-lg py-3 text-sm">
              {isLogin ? "Sign In" : "Sign Up"}
            </button>

            {/* GOOGLE LOGIN */}
            <div className="mt-4 w-full flex items-center justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => alert("Google login failed")}
              />
            </div>
          </form>

          <p className="text-gray-400 text-xs mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-black font-semibold ml-1"
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
