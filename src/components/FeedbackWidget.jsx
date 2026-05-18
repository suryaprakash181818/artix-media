import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Star, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['Website Experience', 'Editing Service', 'Communication', 'Pricing', 'Other'];

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [formData, setFormData] = useState({ category: 'Website Experience', rating: 5, message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase.from('feedback').insert([{
        category: formData.category,
        rating: formData.rating,
        message: formData.message
      }]);
      if (error) throw error;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/notify-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          type: 'feedback',
          category: formData.category,
          rating: formData.rating,
          message: formData.message
        })
      });

      setStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => {
          setStatus('idle');
          setFormData({ category: 'Website Experience', rating: 5, message: '' });
        }, 500);
      }, 3000);
    } catch {
      setStatus('error');
    }
  };

  const displayRating = hoveredStar ?? formData.rating;

  return (
    <>
      {/* Feedback FAB */}
      <div className="fixed bottom-24 right-6 z-50 flex items-center justify-end">
        <AnimatePresence>
          {hovered && !isOpen && (
            <motion.span
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="mr-3 px-3 py-1.5 rounded-lg text-sm font-medium text-white whitespace-nowrap"
              style={{
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Share Feedback
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full text-white"
          style={{
            background: '#7C3AED',
            boxShadow: hovered
              ? '0 0 0 8px rgba(139,92,246,0.12), 0 0 32px rgba(139,92,246,0.45), 0 4px 20px rgba(139,92,246,0.3)'
              : '0 4px 20px rgba(139,92,246,0.25)',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          <AnimatePresence>
            {hovered && (
              <motion.span
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.7, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
                style={{ background: 'rgba(139,92,246,0.3)' }}
              />
            )}
          </AnimatePresence>
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Feedback Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed bottom-44 right-6 z-50 w-[320px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(14,14,18,0.95)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500" style={{ boxShadow: '0 0 6px rgba(139,92,246,0.8)' }} />
                <h3 className="text-white font-semibold text-sm tracking-wide">Feedback</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white/80 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="py-10 flex flex-col items-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 16 }}
                  >
                    <CheckCircle className="w-14 h-14 text-violet-400 mb-4" style={{ filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.6))' }} />
                  </motion.div>
                  <h4 className="text-white text-lg font-semibold mb-1">Thank you!</h4>
                  <p className="text-white/50 text-sm">Your feedback helps us improve.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Custom Dropdown */}
                  <div>
                    <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1.5">What's this about?</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen(p => !p)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-white transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: dropdownOpen ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow: dropdownOpen ? '0 0 0 3px rgba(139,92,246,0.08)' : 'none',
                        }}
                      >
                        <span>{formData.category}</span>
                        <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {dropdownOpen && (
                          <motion.ul
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                            style={{
                              background: 'rgba(20,20,28,0.98)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              backdropFilter: 'blur(20px)',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            }}
                          >
                            {CATEGORIES.map((cat, i) => (
                              <motion.li
                                key={cat}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                              >
                                <button
                                  type="button"
                                  onClick={() => { setFormData(p => ({ ...p, category: cat })); setDropdownOpen(false); }}
                                  className="w-full text-left px-3 py-2.5 text-sm transition-all"
                                  style={{
                                    color: formData.category === cat ? 'rgb(167,139,250)' : 'rgba(255,255,255,0.7)',
                                    background: formData.category === cat ? 'rgba(139,92,246,0.1)' : 'transparent',
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                                  onMouseLeave={e => e.currentTarget.style.background = formData.category === cat ? 'rgba(139,92,246,0.1)' : 'transparent'}
                                >
                                  {cat}
                                </button>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Cinematic Stars */}
                  <div>
                    <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-2">Your Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isActive = star <= displayRating;
                        return (
                          <motion.button
                            key={star}
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, rating: star }))}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            whileHover={{ scale: 1.3, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className="focus:outline-none"
                          >
                            <Star
                              className="w-7 h-7 transition-colors duration-150"
                              style={{
                                color: isActive ? '#FBBF24' : 'rgba(255,255,255,0.15)',
                                fill: isActive ? '#FBBF24' : 'transparent',
                                filter: isActive ? 'drop-shadow(0 0 6px rgba(251,191,36,0.7))' : 'none',
                              }}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div>
                    <label className="block text-white/40 text-[10px] uppercase tracking-widest mb-1.5">Tell us more</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      required
                      rows={3}
                      placeholder="Share your experience..."
                      className="w-full text-sm text-white rounded-xl px-3 py-2.5 focus:outline-none resize-none transition-all placeholder:text-white/20"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                      onFocus={e => {
                        e.target.style.border = '1px solid rgba(139,92,246,0.5)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)';
                      }}
                      onBlur={e => {
                        e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center transition-all disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                      boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
                    }}
                  >
                    {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
                  </motion.button>

                  {status === 'error' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-xs text-center"
                    >
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackWidget;