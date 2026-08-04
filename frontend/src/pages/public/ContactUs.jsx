import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  Clock,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";

const contactDetails = [
  {
    icon: Mail,
    label: "Direct Email",
    value: "contact@quimora.com",
    href: "mailto:contact@quimora.com",
    badge: "Fast Response",
  },
  {
    icon: Phone,
    label: "Phone Line",
    value: "+1 (555) 234-5678",
    href: "tel:+15552345678",
    badge: "Mon-Fri 9-6",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Innovation Hub, Tech District",
    subValue: "San Francisco, CA",
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "09:00 AM – 06:00 PM EST",
    subValue: "Response within 2 hours",
  },
];

const ContactUs = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 overflow-hidden flex items-center justify-center">
      {/* Ambient Background Glows (Theme-adapted) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-start opacity-20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-end opacity-20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative max-w-7xl w-full mx-auto"
      >
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elevated border border-main text-xs font-semibold tracking-wide uppercase text-accent shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-start" />
            <span>Get In Touch</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-main font-['Space_Grotesk']">
            Let's build something{" "}
            <span className="text-transparent bg-clip-text bg-accent">
              extraordinary
            </span>{" "}
            together.
          </h1>

          <p className="text-lg text-muted max-w-2xl mx-auto">
            Have a project in mind, a query, or just want to chat? Drop a line
            and let's craft something stunning.
          </p>
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-main font-['Space_Grotesk'] flex items-center gap-3">
                Reach Out
                <span className="w-12 h-0.5 bg-accent rounded-full inline-block" />
              </h2>
              <p className="text-muted leading-relaxed">
                Whether you're starting a new venture or elevating an existing
                product, we're always excited to collaborate.
              </p>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-2">
                {contactDetails.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 6, transition: { duration: 0.2 } }}
                      className="group p-5 rounded-2xl bg-surface border border-main shadow-card transition-all duration-300 hover:border-accent/40 relative overflow-hidden"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-elevated text-main group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-elevated text-accent border border-soft">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.href ? (
                            <a
                              href={item.href}
                              className="text-base font-semibold text-main hover:text-accent transition-colors block truncate"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-base font-semibold text-main truncate">
                              {item.value}
                            </p>
                          )}
                          {item.subValue && (
                            <p className="text-xs text-muted">
                              {item.subValue}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Quick Note */}
            <div className="p-5 rounded-2xl bg-elevated/60 border border-soft backdrop-blur-sm">
              <div className="flex items-center gap-3 text-sm text-muted">
                <MessageSquare className="w-5 h-5 text-accent shrink-0" />
                <span>
                  Prefer direct chat? We usually respond within{" "}
                  <strong>2 hours</strong> during standard working hours.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Glassmorphic Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative p-8 sm:p-10 rounded-3xl bg-surface border border-main shadow-card flex flex-col justify-between h-full"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-main font-['Space_Grotesk']">
                  Send a Message
                </h3>
                <p className="text-sm text-muted mt-1">
                  Fill out the form below and we'll get back to you shortly.
                </p>
              </div>

              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center space-y-4 my-auto"
                >
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-main font-['Space_Grotesk']">
                    Message Sent!
                  </h4>
                  <p className="text-muted max-w-sm mx-auto text-sm">
                    Thank you for reaching out. A member of our team will be in
                    touch with you shortly.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Your Name
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          placeholder="John Doe"
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full bg-elevated text-main placeholder-text-muted px-4 py-3.5 rounded-xl border transition-all duration-200 outline-none ${
                            focusedField === "name"
                              ? "border-accent ring-2 ring-brand-mid/20 shadow-sm"
                              : "border-main hover:border-soft"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="email"
                          placeholder="john@example.com"
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full bg-elevated text-main placeholder-text-muted px-4 py-3.5 rounded-xl border transition-all duration-200 outline-none ${
                            focusedField === "email"
                              ? "border-accent ring-2 ring-brand-mid/20 shadow-sm"
                              : "border-main hover:border-soft"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Project Inquiry / Partnership"
                      onFocus={() => setFocusedField("subject")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full bg-elevated text-main placeholder-text-muted px-4 py-3.5 rounded-xl border transition-all duration-200 outline-none ${
                        focusedField === "subject"
                          ? "border-accent ring-2 ring-brand-mid/20 shadow-sm"
                          : "border-main hover:border-soft"
                      }`}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                      How can we help?
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your project or goals..."
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full bg-elevated text-main placeholder-text-muted p-4 rounded-xl border transition-all duration-200 outline-none resize-none ${
                        focusedField === "message"
                          ? "border-accent ring-2 ring-brand-mid/20 shadow-sm"
                          : "border-main hover:border-soft"
                      }`}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-xl bg-accent text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-lg shadow-brand-mid/25 hover:shadow-xl hover:shadow-brand-mid/35 active:scale-[0.99] transition-all duration-200"
                  >
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;
