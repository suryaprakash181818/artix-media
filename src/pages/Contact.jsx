import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, ChevronDown, Clock } from 'lucide-react';
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

const CustomSelect = ({ name, options, disabled, value, onChange }) => {
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
          border: isOpen ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
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
    projectType: 'Short-form',
    budget: '15k-30k',
    message: ''
  });

  const [formStatus, setFormStatus] = useState('idle');
  const [honeypot, setHoneypot] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot — silent block
    if (honeypot) return;

    // Cooldown check
    const lastSubmit = localStorage.getItem('artix_last_submit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 30000) {
      setFormStatus('cooldown');
      return;
    }

    setFormStatus('loading');

    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: formData.name,
          email: formData.email,
          project_type: formData.projectType,
          budget: formData.budget,
          message: formData.message,
          status: 'new'
        }]);

      if (error) throw error;

      // Store cooldown timestamp
      localStorage.setItem('artix_last_submit', Date.now().toString());

      setFormStatus('success');

      // Reset form
      setFormData({
        name: '',
        email: '',
        projectType: 'Short-form',
        budget: '15k-30k',
        message: ''
      });

    } catch (err) {
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
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              
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

              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Name</label>
                  <input type="text" name="name" required disabled={isDisabled} value={formData.name} onChange={handleChange}
                    className="w-full bg-deep border border-white/[0.04] rounded-xl px-5 py-4 text-white text-base focus:outline-none focus:border-accent focus:bg-accentSoft transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="John Doe" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Email</label>
                  <input type="email" name="email" required disabled={isDisabled} value={formData.email} onChange={handleChange}
                    className="w-full bg-deep border border-white/[0.04] rounded-xl px-5 py-4 text-white text-base focus:outline-none focus:border-accent focus:bg-accentSoft transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="john@example.com" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Project Type</label>
                  <CustomSelect name="projectType" options={projectTypeOptions} disabled={isDisabled} value={formData.projectType} onChange={handleChange} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Estimated Budget</label>
                  <CustomSelect name="budget" options={budgetOptions} disabled={isDisabled} value={formData.budget} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-secondaryText/80 tracking-[0.2em] uppercase block">Message</label>
                <textarea name="message" required rows={5} disabled={isDisabled} value={formData.message} onChange={handleChange}
                  className="w-full bg-deep border border-white/[0.04] rounded-xl px-5 py-4 text-white text-base focus:outline-none focus:border-accent focus:bg-accentSoft transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Describe the story, audience, or emotional momentum you want the edit to create."></textarea>
              </div>

              <motion.button 
                type="submit" 
                whileHover={!isDisabled ? { scale: 1.02, filter: "brightness(1.05)", boxShadow: "0 0 25px rgba(139, 92, 246, 0.2)" } : {}}
                whileTap={!isDisabled ? { scale: 0.96 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
                disabled={isDisabled}
                className={`w-full py-5 rounded-xl font-bold text-lg transition-all duration-500 flex justify-center items-center overflow-hidden ${
                  formStatus === "success" ? "bg-white/[0.03] text-white border border-white/10" : "bg-accent text-white"
                } ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <AnimatePresence mode="wait">
                  {formStatus === "loading" && (
                    <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </motion.div>
                  )}
                  {formStatus === "success" && (
                    <motion.span key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex items-center gap-2 font-medium text-base text-white">
                      <CheckCircle className="w-5 h-5 opacity-80" />
                      Message Sent
                    </motion.span>
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
              
              <div className="mt-6 h-6 relative flex justify-center items-center">
                <AnimatePresence mode="wait">
                  {formStatus === "success" && (
                    <motion.p
                      key="success-note"
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(4px)" }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-xs text-secondaryText/50 font-light tracking-wide absolute text-center w-full"
                    >
                      We’ll review the details and respond if the project aligns with our workflow.
                    </motion.p>
                  )}
                  {formStatus === "error" && (
                    <motion.p 
                      key="error-note"
                      initial={{ opacity: 0, y: -8 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400 text-center absolute w-full mt-3"
                    >
                      Something went wrong. Please try again or email us directly.
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
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
