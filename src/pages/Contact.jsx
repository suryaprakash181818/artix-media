import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, ChevronDown, Clock } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { supabase } from '../lib/supabase';

const projectTypeOptions = [
  { value: "Short-form", label: "Short-form (Reels/TikTok)" },
  { value: "Long-form", label: "Long-form (YouTube)" },
  { value: "Commercial", label: "Commercial / Ad" },
  { value: "Retainer", label: "Monthly Retainer" }
];

const budgetOptions = [
  { value: "15k-30k", label: "₹15,000 - ₹30,000" },
  { value: "30k-80k", label: "₹30,000 - ₹80,000" },
  { value: "80k-2L", label: "₹80,000 - ₹2,00,000" },
  { value: "2L+", label: "₹2,00,000+" },
  { value: "Custom", label: "Custom Budget" }
];

const contactMethodOptions = [
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Email", label: "Email" },
  { value: "Google Meet", label: "Google Meet" }
];

const ALLOWED_PROJECT_TYPES = projectTypeOptions.map(o => o.value);
const ALLOWED_BUDGETS = budgetOptions.map(o => o.value);
const ALLOWED_CONTACT_METHODS = contactMethodOptions.map(o => o.value);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CustomSelect = ({ name, options, disabled, value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-base text-white transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: error
            ? '1px solid rgba(239,68,68,0.6)'
            : isOpen ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isOpen ? '0 0 0 3px rgba(139,92,246,0.08)' : 'none',
        }}
      >
        <span>{options.find(o => o.value === value)?.label || options[0].label}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(20,20,28,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option, i) => (
                <motion.li
                  key={option.value}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onChange) {
                        onChange({ target: { name, value: option.value } });
                      }
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-5 py-4 text-base transition-all"
                    style={{
                      color: value === option.value ? 'rgb(167,139,250)' : 'rgba(255,255,255,0.7)',
                      background: value === option.value ? 'rgba(139,92,246,0.1)' : 'transparent',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = value === option.value ? 'rgba(139,92,246,0.1)' : 'transparent'}
                  >
                    {option.label}
                  </button>
                </motion.li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredContact: 'WhatsApp',
    projectType: 'Short-form',
    budget: '15k-30k',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('idle');
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const turnstileRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const message = formData.message.trim();

    if (!name) errors.name = 'Name is required';
    else if (name.length > 80) errors.name = 'Name must be under 80 characters';
    else if (/<[^>]*>/.test(name)) errors.name = 'Name contains invalid characters';

    if (!email) errors.email = 'Valid email required';
    else if (!EMAIL_REGEX.test(email)) errors.email = 'Valid email required';
    else if (email.length > 254) errors.email = 'Email is too long';

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.preferredContact || !ALLOWED_CONTACT_METHODS.includes(formData.preferredContact))
      errors.preferredContact = 'Select a contact method';

    if (!formData.projectType || !ALLOWED_PROJECT_TYPES.includes(formData.projectType))
      errors.projectType = 'Select a project type';

    if (!formData.budget || !ALLOWED_BUDGETS.includes(formData.budget))
      errors.budget = 'Select a budget range';

    if (!message) errors.message = 'Message is required';
    else if (message.length > 1000) errors.message = `Message too long (${message.length}/1000)`;

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot — silent block
    if (honeypot) return;

    console.log("Current token:", turnstileToken);

    // Turnstile check
    if (!turnstileToken) {
      setFieldErrors(prev => ({ ...prev, turnstile: 'Please complete the verification' }));
      return;
    }

    // Validation
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Cooldown check
    const lastSubmit = localStorage.getItem('artix_last_submit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 30000) {
      setFormStatus('cooldown');
      return;
    }

    setFormStatus('loading');
    setFieldErrors({});
    setErrorMessage('');

    try {
      // 1. Insert lead details into leads table with selection of ID
      const { data: insertedData, error: dbError } = await supabase
        .from('leads')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          preferred_contact: formData.preferredContact,
          project_type: formData.projectType,
          budget: formData.budget,
          message: formData.message.trim(),
          status: 'pending'
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. Invoke the Edge Function via the production endpoint to process notifications and verify turnstile token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://jhrmrtsenlrehzmblxrz.supabase.co";
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impocm1ydHNlbmxyZWh6bWJseHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODQyMjYsImV4cCI6MjA5NDY2MDIyNn0.ipEtzukIce2MX-Zj1M3q8iJJVFGV3ZUvSQXUgRd1gDw";

      const response = await fetch(`${supabaseUrl}/functions/v1/notify-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          type: "lead",
          id: insertedData?.id,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          preferred_contact: formData.preferredContact,
          project_type: formData.projectType,
          budget: formData.budget,
          message: formData.message.trim(),
          cf_turnstile_response: turnstileToken
        })
      });

      // Temporary debug logging as requested
      console.log(turnstileToken);
      console.log(formData);
      console.log(response);

      const responseTextClone = response.clone();
      const responseJsonClone = response.clone();

      try {
        console.log(await responseTextClone.text());
      } catch (err) {
        console.log("Error logging response text:", err);
      }

      try {
        console.log(await responseJsonClone.json());
      } catch (err) {
        console.log("Error logging response json:", err);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge function returned status ${response.status}: ${errorText}`);
      }

      localStorage.setItem('artix_last_submit', Date.now().toString());
      setFormStatus('success');
      setTurnstileToken('');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        preferredContact: 'WhatsApp',
        projectType: 'Short-form',
        budget: '15k-30k',
        message: ''
      });

      // Reset Turnstile widget
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }

    } catch (err) {
      console.error("Submission flow error:", err);
      setErrorMessage(err.message || String(err));
      setFormStatus('error');
    }
  };

  const isDisabled = formStatus === 'loading' || formStatus === 'success' || formStatus === 'cooldown';

  return (
    <div className="pt-20 pb-14 tablet:pt-32 tablet:pb-32">
      <div className="max-w-[1280px] mx-auto px-6">
        
        {/* Editorial Opening */}
        <div className="mb-24 flex flex-col items-start max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl tablet:text-7xl desktop:text-8xl font-heading font-bold text-white mb-8 tracking-[-0.04em] leading-[1.05]"
          >
            Tell us what<br />needs attention.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl tablet:text-2xl text-secondaryText leading-relaxed tracking-[-0.01em] font-light max-w-2xl tablet:pl-12 border-l-0 tablet:border-l border-white/10"
          >
            Every project begins with pacing, clarity, and intent.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface p-10 tablet:p-16 rounded-[2.5rem] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] to-transparent pointer-events-none" />
            <AnimatePresence mode="wait">
              {formStatus !== "success" ? (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  className="space-y-8 relative z-10"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      opacity: 0,
                      pointerEvents: 'none',
                      tabIndex: -1
                    }}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Name</label>
                      <input type="text" name="name" disabled={isDisabled} value={formData.name} onChange={handleChange}
                        className="w-full bg-deep border rounded-xl px-5 py-4 text-white text-base focus:outline-none focus:border-accent focus:bg-accentSoft transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: fieldErrors.name ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.04)' }}
                        placeholder="John Doe" />
                      {fieldErrors.name && (
                        <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Email</label>
                      <input type="text" name="email" disabled={isDisabled} value={formData.email} onChange={handleChange}
                        className="w-full bg-deep border rounded-xl px-5 py-4 text-white text-base focus:outline-none focus:border-accent focus:bg-accentSoft transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: fieldErrors.email ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.04)' }}
                        placeholder="john@example.com" />
                      {fieldErrors.email && (
                        <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone + Preferred Contact Method */}
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Phone Number</label>
                      <input type="tel" name="phone" disabled={isDisabled} value={formData.phone} onChange={handleChange}
                        className="w-full bg-deep border rounded-xl px-5 py-4 text-white text-base focus:outline-none focus:border-accent focus:bg-accentSoft transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderColor: fieldErrors.phone ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.04)' }}
                        placeholder="+91 98765 43210" />
                      {fieldErrors.phone && (
                        <p className="text-xs text-red-400 mt-1">{fieldErrors.phone}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Preferred Contact Method</label>
                      <CustomSelect name="preferredContact" options={contactMethodOptions} disabled={isDisabled} value={formData.preferredContact} onChange={handleChange} error={fieldErrors.preferredContact} />
                      {fieldErrors.preferredContact && (
                        <p className="text-xs text-red-400 mt-1">{fieldErrors.preferredContact}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Project Type + Budget */}
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Project Type</label>
                      <CustomSelect name="projectType" options={projectTypeOptions} disabled={isDisabled} value={formData.projectType} onChange={handleChange} error={fieldErrors.projectType} />
                      {fieldErrors.projectType && (
                        <p className="text-xs text-red-400 mt-1">{fieldErrors.projectType}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Estimated Budget</label>
                      <CustomSelect name="budget" options={budgetOptions} disabled={isDisabled} value={formData.budget} onChange={handleChange} error={fieldErrors.budget} />
                      {fieldErrors.budget && (
                        <p className="text-xs text-red-400 mt-1">{fieldErrors.budget}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">
                      Message
                      {formData.message.length > 800 && (
                        <span className={`ml-2 font-normal normal-case tracking-normal ${formData.message.length > 1000 ? 'text-red-400' : 'text-yellow-400/70'}`}>
                          {formData.message.length}/1000
                        </span>
                      )}
                    </label>
                    <textarea name="message" rows={5} disabled={isDisabled} value={formData.message} onChange={handleChange}
                      className="w-full bg-deep border rounded-xl px-5 py-4 text-white text-base focus:outline-none focus:border-accent focus:bg-accentSoft transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderColor: fieldErrors.message ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.04)' }}
                      placeholder="Describe the story, audience, or emotional momentum you want the edit to create." />
                    {fieldErrors.message && (
                      <p className="text-xs text-red-400 mt-1">{fieldErrors.message}</p>
                    )}
                  </div>

                  {/* Cloudflare Turnstile */}
                  {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                    <div className="flex flex-col items-start gap-2">
                      <Turnstile
                        key="stable-turnstile"
                        ref={turnstileRef}
                        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                        onSuccess={(token) => {
                          console.log("Turnstile success:", token);
                          setTurnstileToken(token);
                          setFieldErrors(prev => ({ ...prev, turnstile: '' }));
                        }}
                        onExpire={() => {
                          console.log("Turnstile expired");
                          setTurnstileToken('');
                        }}
                        onError={() => {
                          console.log("Turnstile error");
                          setTurnstileToken('');
                        }}
                        options={{ theme: 'dark', size: 'normal' }}
                      />
                      {fieldErrors.turnstile && (
                        <p className="text-xs text-red-400">{fieldErrors.turnstile}</p>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button 
                    type="submit" 
                    whileHover={!isDisabled ? { scale: 1.02, filter: "brightness(1.05)", boxShadow: "0 0 25px rgba(139, 92, 246, 0.2)" } : {}}
                    whileTap={!isDisabled ? { scale: 0.96 } : {}}
                    transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
                    disabled={isDisabled}
                    className={`w-full py-5 rounded-xl font-bold text-lg transition-all duration-500 flex justify-center items-center overflow-hidden bg-accent text-white ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    <AnimatePresence mode="wait">
                      {formStatus === "loading" && (
                        <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </motion.div>
                      )}
                      {formStatus === "cooldown" && (
                        <motion.span key="cooldown" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex items-center gap-2 font-medium text-base text-white">
                          <Clock className="w-5 h-5 opacity-80" />
                          Please wait...
                        </motion.span>
                      )}
                      {(formStatus === "idle" || formStatus === "error") && (
                        <motion.span key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                          Send Message
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                  
                  {/* Status Messages */}
                  <div className="mt-6 h-6 relative flex justify-center items-center">
                    <AnimatePresence mode="wait">
                      {formStatus === "error" && (
                        <motion.p 
                          key="error-note"
                          initial={{ opacity: 0, y: -8 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0 }}
                          className="text-sm text-red-400 text-center absolute w-full mt-3 px-4"
                        >
                          {errorMessage || "Something went wrong. Please try again or email us directly."}
                        </motion.p>
                      )}
                      {formStatus === "cooldown" && (
                        <motion.p 
                          key="cooldown-note"
                          initial={{ opacity: 0, y: -8 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0 }}
                          className="text-sm text-yellow-400 text-center absolute w-full mt-3"
                        >
                          Please wait 30 seconds before submitting again.
                        </motion.p>
                      )}
                      {(formStatus === "idle" || formStatus === "loading") && (
                        <motion.p
                          key="default-note"
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(4px)" }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="text-xs text-secondaryText/50 font-light tracking-wide absolute text-center w-full"
                        >
                          Selected inquiries are typically answered within 24–48 hours.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  className="relative z-10 py-8 flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-8"
                  >
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </motion.div>

                  <h2 className="text-3xl tablet:text-4xl font-heading font-bold text-white mb-4 tracking-tight">
                    Inquiry Submitted
                  </h2>
                  <p className="text-secondaryText font-light text-base tablet:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                    Thank you for sharing your project details. We limit our intake to ensure absolute focus on each narrative. We will review your vision and reply within 24–48 hours.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md">
                    <a
                      href="https://wa.me/919398501153"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 group"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(139,92,246,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.15)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span>Continue via WhatsApp</span>
                      <svg className="w-4 h-4 text-white/60 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
