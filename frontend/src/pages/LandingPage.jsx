import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  Calendar,
  ShieldCheck,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2,
  Zap,
  Users,
  Award,
  Bed,
  FileText,
  Pill,
  BedDouble,
  UserCheck,
  CreditCard,
  Heart,
  Brain,
  Baby,
  Bone,
  Activity,
  Siren,
  Globe,
  Quote,
  MapPin,
  Mail,
  PhoneCall,
  ArrowUp,
  Sparkles,
  Lock,
} from "lucide-react";
import {
  hospitalStats,
  departments,
  topDoctors,
  testimonials,
  emergencyHotline,
} from "../data/hmsData";

const iconMap = {
  Users: Users,
  Award: Award,
  Bed: Bed,
  HeartPulse: HeartPulse,
  Heart: Heart,
  Brain: Brain,
  Baby: Baby,
  Bone: Bone,
  Activity: Activity,
  Siren: Siren,
};

const featureList = [
  {
    icon: ShieldCheck,
    title: "Role-Based Access & Security",
    badge: "Security Standard",
    description:
      "Enforced RBAC security routes for Admin, Doctor, Patient, and Receptionist with custom user authentication.",
  },
  {
    icon: UserCheck,
    title: "Zero-Wait OPD Triage & Tokens",
    badge: "Patient Efficiency",
    description:
      "Generate walk-in digital tokens immediately to eliminate registration queues and speed up doctor consultations.",
  },
  {
    icon: FileText,
    title: "Electronic Health Records (EHR)",
    badge: "Digital Medical History",
    description:
      "Centralized patient medical charts, diagnostic imaging summaries, blood test reports, and downloadable PDF receipts.",
  },
  {
    icon: Pill,
    title: "Digital E-Prescriptions & Rx",
    badge: "Pharmacy Integration",
    description:
      "Physicians instantly issue electronic prescriptions with dosage schedules, duration, and direct pharmacy pickup sync.",
  },
  {
    icon: BedDouble,
    title: "Live Ward & Bed Occupancy Map",
    badge: "Real-time Triage",
    description:
      "Color-coded visual monitoring for ICU, General Ward, and Private Suite bed availability, sanitization, and allocation.",
  },
  {
    icon: CreditCard,
    title: "Automated Billing & Insurance",
    badge: "Financial Transparency",
    description:
      "Transparent line-item invoices for consultation fees, lab tests, pharmacy drugs, and room charges with insurance claims.",
  },
];

const LandingPage = () => {
  const context = useOutletContext() || {};
  const handleOpenBooking = context.handleOpenBooking || (() => {});
  const handleOpenAuth = context.handleOpenAuth || (() => {});

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-0">
      {/* HERO SECTION (#home) */}
      <section
        id="home"
        className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Action CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-xs font-semibold shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>Next-Gen Smart Hospital System</span>
                <span className="text-blue-300">|</span>
                <span className="text-blue-700 font-bold">
                  CarePlus HMS 2026
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Modern Healthcare <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600">
                  Management & Patient Care
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Streamline hospital operations, manage patient records securely,
                book appointments effortlessly, and access 24/7 specialist care
                all in one unified platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => handleOpenBooking()}
                  className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow-xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all group"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleOpenAuth()}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-7 py-4 rounded-xl text-base font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
                >
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Patient & Staff Portal</span>
                </button>
              </div>

              {/* Key Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Zero Wait Tokens
                    </h4>
                    <p className="text-[11px] text-slate-500">Live OPD Queue</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      EHR Digital Sync
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Instant Reports
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      24/7 Specialist
                    </h4>
                    <p className="text-[11px] text-slate-500">On-demand Care</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Card */}
                <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative z-10">
                  {/* Doctor Avatar */}
                  <div className="flex items-center space-x-4 pb-5 border-b border-slate-100">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                        alt="Doctor"
                        className="w-14 h-14 rounded-2xl object-cover ring-4 ring-blue-100"
                      />
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          Dr. Sarah Jenkins
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full">
                          On Duty
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 font-semibold">
                        Chief of Cardiology
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-slate-700">
                          4.9
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (320 Verified Ratings)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Patient Live Vitals Widget */}
                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>Live Patient Triage Stream</span>
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Real-time
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                          <HeartPulse className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Heart Rate & BP
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Normal • 72 BPM | 120/80
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        Optimal
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">
                            Next Slot Available
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Today at 02:30 PM (Room 304)
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenBooking()}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Book
                      </button>
                    </div>
                  </div>

                  {/* Quick Footer Stats */}
                  <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center space-x-1 font-semibold text-slate-700">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span>35 OPD Clinics Active</span>
                    </span>
                    <span className="font-bold text-emerald-600">
                      ICU Beds Free: 14
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {hospitalStats.map((stat) => {
              const IconComp = iconMap[stat.icon] || HeartPulse;
              return (
                <div
                  key={stat.id}
                  className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/70 hover:border-blue-500/60 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <IconComp className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span className="text-[11px] font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION (#features) */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white text-center"
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-100/90 px-3.5 py-1.5 rounded-full">
              Why Choose CarePlus HMS?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Powerful Features for Seamless Hospital Management
            </h2>
            <p className="text-slate-600 text-base">
              Designed to optimize healthcare workflows, enhance patient
              experiences, and secure medical data across every department.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {featureList.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <IconComp className="w-7 h-7 stroke-[2]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700">
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SPECIALIZED DEPARTMENTS SECTION (#departments) */}
      <section
        id="departments"
        className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-100 px-3.5 py-1.5 rounded-full">
              Clinical Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Specialized Medical Departments
            </h2>
            <p className="text-slate-600 text-base">
              Equipped with state-of-the-art diagnostic technology and
              board-certified medical specialists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => {
              const IconComp = iconMap[dept.icon] || Activity;
              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${dept.accentColor} group-hover:scale-110 transition-transform`}
                      >
                        <IconComp className="w-7 h-7 stroke-[2.2]" />
                      </div>
                      {dept.popular && (
                        <span className="text-[11px] font-extrabold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider">
                          High Demand
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                      {dept.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center space-x-1 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{dept.specialists} Specialists</span>
                      </div>
                      <div className="flex items-center space-x-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Wait:{" "}
                          <strong className="text-slate-800 font-bold">
                            {dept.wait}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenBooking(dept.name)}
                      className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm"
                      title={`Book ${dept.name}`}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TOP DOCTORS SHOWCASE SECTION (#doctors) */}
      <section id="doctors" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-100 px-3.5 py-1.5 rounded-full">
                Medical Staff
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
                Meet Our Top Specialists
              </h2>
              <p className="text-slate-600 text-base mt-2">
                Expert physicians dedicated to compassionate, world-class
                patient care.
              </p>
            </div>
            <button
              onClick={() => handleOpenBooking()}
              className="mt-4 md:mt-0 flex items-center space-x-2 text-blue-600 font-bold text-sm hover:text-blue-700 underline underline-offset-4"
            >
              <span>Explore All 250+ Specialists</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center space-x-1 shadow">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({doc.reviewsCount})
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="inline-block text-[11px] font-extrabold uppercase bg-emerald-500 text-white px-2.5 py-0.5 rounded-md shadow-sm">
                      {doc.availability}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">
                      {doc.specialty}
                    </p>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.experience}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.education}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.languages.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenBooking(doc.department, doc.name)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold text-xs text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Consultation</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATIENT TESTIMONIALS SECTION (#testimonials) */}
      <section
        id="testimonials"
        className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-100 px-3.5 py-1.5 rounded-full">
              Patient Satisfaction
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Stories from Our Patients
            </h2>
            <p className="text-slate-600 text-base">
              Trusted by over 50,000+ individuals and families across the
              region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
              >
                <Quote className="w-10 h-10 text-blue-100 absolute top-6 right-6" />

                <div>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <p className="text-slate-700 text-sm italic leading-relaxed relative z-10">
                    "{t.content}"
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center space-x-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {t.name}
                      </h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <p className="text-xs font-semibold text-blue-600">
                      {t.role}
                    </p>
                    <p className="text-[11px] text-slate-400">{t.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT & FOOTER SECTION (#contact) */}
      <footer
        id="contact"
        className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <Activity className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  CarePlus HMS
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Advanced Hospital Management System delivering integrated
                electronic health records, zero-wait triage tokens,
                e-prescriptions, and 24/7 level-1 emergency response.
              </p>

              <div className="flex items-center space-x-3 pt-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Certified &
                  Encrypted
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-white tracking-wider">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="#home"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-blue-400 transition-colors"
                  >
                    HMS Features
                  </a>
                </li>
                <li>
                  <a
                    href="#departments"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Medical Departments
                  </a>
                </li>
                <li>
                  <a
                    href="#doctors"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Our Doctors
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Patient Reviews
                  </a>
                </li>
              </ul>
            </div>

            {/* Specialties */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-white tracking-wider">
                Specialties
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="hover:text-blue-400 cursor-pointer transition-colors">
                    Cardiology & Surgery
                  </span>
                </li>
                <li>
                  <span className="hover:text-blue-400 cursor-pointer transition-colors">
                    Neurology & Stroke Unit
                  </span>
                </li>
                <li>
                  <span className="hover:text-blue-400 cursor-pointer transition-colors">
                    Pediatrics & NICU
                  </span>
                </li>
                <li>
                  <span className="hover:text-blue-400 cursor-pointer transition-colors">
                    Robotic Orthopedics
                  </span>
                </li>
                <li>
                  <span className="hover:text-blue-400 cursor-pointer transition-colors">
                    3T MRI Radiology
                  </span>
                </li>
              </ul>
            </div>

            {/* Emergency & Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-white tracking-wider">
                24/7 Emergency Care
              </h4>
              <div className="space-y-2.5 text-xs">
                <a
                  href={`tel:${emergencyHotline}`}
                  className="flex items-center space-x-2 text-rose-400 font-bold hover:text-rose-300"
                >
                  <PhoneCall className="w-4 h-4 shrink-0" />
                  <span>{emergencyHotline}</span>
                </a>
                <div className="flex items-start space-x-2 text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>742 Evergreen Medical Parkway, Suite 100</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>emergency@careplus-hms.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} CarePlus Hospital Systems. All rights
              reserved.
            </p>

            <button
              onClick={scrollToTop}
              className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
