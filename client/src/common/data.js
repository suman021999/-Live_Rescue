import { IoIosVideocam } from "react-icons/io";
import { FaClock } from "react-icons/fa6";
import { FaShield } from "react-icons/fa6";
import { Stethoscope, Flame, Car, ShieldAlert,User, Shield, Clock, Phone, Wifi } from "lucide-react";



export const cards = [
  {
    id: "medical",
    title: "Medical Help",
    subtitle: "Connect to an emergency doctor",
    bg: "bg-red-600",
    hoverBg: "hover:bg-red-700",
    iconBg: "bg-red-500/40",
    btnBg: "bg-red-800/60 hover:bg-red-900/80",
    icon: Stethoscope,
    type: "video",
  },
  
  {
  id: "sos",
  title: "Safety SOS",
  subtitle: "Harassment / Assault Help",
  bg: "bg-pink-600",
  hoverBg: "hover:bg-pink-700",
  iconBg: "bg-pink-500/40",
  btnBg: "bg-pink-800/60 hover:bg-pink-900/80",
  icon: ShieldAlert,
  type: "video",
},
  
  {
    id: "disaster",
    title: "Disaster Help",
    subtitle: "Connect to rescue volunteers",
    bg: "bg-orange-500",
    hoverBg: "hover:bg-orange-600",
    iconBg: "bg-orange-400/40",
    btnBg: "bg-orange-700/60 hover:bg-orange-800/80",
    icon: Flame,
    type: "video",
  },
  {
    id: "roadside",
    title: "Roadside Assist",
    subtitle: "Connect to a mechanic or tow",
    bg: "bg-yellow-400",
    hoverBg: "hover:bg-yellow-500",
    iconBg: "bg-yellow-300/40",
    btnBg: "bg-yellow-600/50 hover:bg-yellow-700/70",
    icon: Car,
    type: "video",
  },
];


export const services = [
  {
    icon: IoIosVideocam,
    title: "Instant Video Connection",
    desc: "Connect with trained emergency professionals through high-quality video calls in seconds",
  },
  {
    icon: FaClock,
    title: "24/7 Availability",
    desc: "Our emergency response team is available around the clock, every day of the year",
  },
  {
    icon: FaShield,
    title: "Secure & Private",
    desc: "All calls are encrypted and confidential, ensuring your privacy during emergencies",
  },
];

export const steps = [
  {
    number: "1",
    title: "Tap Emergency Call",
    desc: "Access the video call feature instantly from any device",
  },
  {
    number: "2",
    title: "Connect Live",
    desc: "Get connected to a trained responder within seconds",
  },
  {
    number: "3",
    title: "Get Help",
    desc: "Receive immediate guidance and emergency support",
  },
];

export const plans = [
  {
    id: "free",
    name: "Free Tier",
    badge: "BASIC",
    price: { monthly: 0, yearly: 0 },
    description: "Essential emergency access for everyone.",
    cta: "Current Plan",
    ctaDisabled: true,
    highlighted: false,
    features: [
      { text: "Standard queue wait times", included: true },
      { text: "Basic routing to available specialists", included: true },
      { text: "1 emergency contact", included: true },
      { text: "Priority connection (Under 30s)", included: false },
      { text: "Direct access to top specialists", included: false },
      { text: "Offline emergency SMS routing", included: false },
      { text: "Live GPS location sharing", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium Rescue",
    badge: "RECOMMENDED",
    price: { monthly: 9.99, yearly: 7.99 },
    description: "Maximum speed when every second counts.",
    cta: "Upgrade to Premium",
    ctaDisabled: false,
    highlighted: true,
    features: [
      { text: "Priority connection (Under 30s)", included: true },
      { text: "Direct access to top specialists", included: true },
      { text: "Unlimited emergency contacts", included: true },
      { text: "Offline emergency SMS routing", included: true },
      { text: "Live GPS location sharing", included: true },
      { text: "Medical history auto-share", included: true },
      { text: "Dedicated support line", included: true },
    ],
  },
];

export const perks = [
  { icon: Clock, label: "Under 30s Connect", desc: "Premium calls are answered in under 30 seconds, guaranteed." },
  { icon: Shield, label: "End-to-End Encrypted", desc: "All calls and data are fully encrypted for your privacy." },
  { icon: Wifi, label: "Offline SMS Fallback", desc: "No internet? We'll route your alert via SMS automatically." },
  { icon: Phone, label: "24 / 7 Availability", desc: "Specialists available around the clock, every day of the year." },
];

export const menu = [
  { path: "/my_account", label: "Personal Info", icon: User },
  { path: "/emergency_contact", label: "Emergency", icon: Phone },
  { path: "/privacy", label: "Security", icon: Shield },
];

export const fields = [
  { label: "First Name", name: "firstName" },
  { label: "Last Name", name: "lastName" },
  { label: "Email Address", name: "email" },
  { label: "Phone Number (Emergency)", name: "phone" },
  { label: "Blood Type", name: "bloodType" },
  { label: "Known Allergies", name: "allergies" },
];

export  const plan = [
    {
      id: "free",
      name: "Free Tier",
      price: "$0",
      period: "/month",
      features: [
        { text: "Standard queue wait times", included: true },
        { text: "Basic routing to specialists", included: true },
        { text: "Priority connection", included: false },
      ],
      recommended: false,
      actionLabel: "Current Plan",
      actionDisabled: true,
    },
    {
      id: "premium",
      name: "Premium Rescue",
      price: "$9.99",
      period: "/month",
      features: [
        { text: "Priority connection (Under 30s)", included: true },
        { text: "Direct access to top specialists", included: true },
        { text: "Offline emergency SMS routing", included: true },
      ],
      recommended: true,
      actionLabel: "Upgrade to Premium",
      actionDisabled: false,
    },
  ];

export const initialContacts = [
  {
    id: 1,
    name: "Jane Smith",
    relation: "Spouse",
    phone: "+1 (555) 123-4567",
    email: "jane.smith@example.com",
  },
  {
    id: 2,
    name: "Robert Johnson",
    relation: "Parent",
    phone: "+1 (555) 987-6543",
    email: "",
  },
];


export const emergencyActions = [
  {
    key: "medical",
    title: "Medical Emergency",
    desc: "Notify all contacts with your location.",
  },
  {
  key: "sos",
  title: "Safety SOS",
  desc: "Alert contacts if you feel unsafe or followed.",
},
  {
    key: "disaster",
    title: "Disaster Help",
    desc: "Send check-in link to contacts.",
  },
  {
    key: "location",
    title: "Live Location",
    desc: "Share real-time GPS during emergency.",
  },
];


export const contactFormFields = [
  {
    field: "name",
    label: "Full Name",
    placeholder: "Jane Smith",
  },
  {
    field: "relation",
    label: "Relation",
    placeholder: "Spouse, Parent, Friend…",
  },
  {
    field: "phone",
    label: "Phone",
    placeholder: "+1 (555) 000-0000",
  },
  {
    field: "email",
    label: "Email (optional)",
    placeholder: "jane@example.com",
  },
];