import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Link2,
  Mail,
  Send,
  Sparkles,
  Tag,
  User,
} from 'lucide-react';
import React, { useState } from 'react';

import { Footer } from './Footer';
import Header from './Header';

interface EventFormState {
  title: string;
  category: string;
  organizer: string;
  startsAt: string;
  endsAt: string;
  registrationUrl: string;
  prizePool: string;
  shortDescription: string;
  fullDescription: string;
  contactEmail: string;
}

export function SubmitEventPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EventFormState>({
    title: '',
    category: 'hackathon',
    organizer: '',
    startsAt: '',
    endsAt: '',
    registrationUrl: '',
    prizePool: '',
    shortDescription: '',
    fullDescription: '',
    contactEmail: '',
  });

  const [errors, setErrors] = useState<Partial<EventFormState>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'competitive-programming', label: 'Coding Contest' },
    { value: 'ctf', label: 'CTF (Capture The Flag)' },
    { value: 'ai-ml', label: 'AI/ML Event' },
    { value: 'web3', label: 'Web3 / Blockchain' },
    { value: 'workshop', label: 'Workshop / BootCamp' },
    { value: 'conference', label: 'Developer Conference' },
  ];

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<EventFormState> = {};
    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = 'Event title is required';
      if (!formData.organizer.trim()) newErrors.organizer = 'Organizer or host platform is required';
    } else if (currentStep === 2) {
      if (!formData.startsAt) newErrors.startsAt = 'Start date and time are required';
      if (!formData.endsAt) newErrors.endsAt = 'End date and time are required';
      if (!formData.registrationUrl.trim()) {
        newErrors.registrationUrl = 'Registration URL is required';
      } else if (!/^https?:\/\/.+/.test(formData.registrationUrl)) {
        newErrors.registrationUrl = 'Please enter a valid HTTP or HTTPS URL';
      }
    } else if (currentStep === 3) {
      if (!formData.shortDescription.trim()) newErrors.shortDescription = 'Short description is required';
      if (!formData.fullDescription.trim()) newErrors.fullDescription = 'Detailed description is required';
      if (!formData.contactEmail.trim()) {
        newErrors.contactEmail = 'Contact email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Please enter a valid email address';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    // Generate the mailto details pre-filled to events@event-io.me
    const emailSubject = encodeURIComponent(`[Event Submission] - ${formData.title}`);
    const emailBody = encodeURIComponent(
      `EVENT SUBMISSION DETAILS\n` +
      `========================\n\n` +
      `Title: ${formData.title}\n` +
      `Category: ${formData.category}\n` +
      `Organizer: ${formData.organizer}\n` +
      `Starts At: ${formData.startsAt}\n` +
      `Ends At: ${formData.endsAt}\n` +
      `Registration URL: ${formData.registrationUrl}\n` +
      `Prize Pool: ${formData.prizePool || 'None listed'}\n` +
      `Contact Email: ${formData.contactEmail}\n\n` +
      `Short Description:\n${formData.shortDescription}\n\n` +
      `Detailed Description:\n${formData.fullDescription}\n`
    );

    const mailtoUrl = `mailto:events@event-io.me?subject=${emailSubject}&body=${emailBody}`;
    
    // Launch the mail client
    window.location.href = mailtoUrl;
    setIsSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof EventFormState]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-stone-200 selection:bg-stone-50 selection:text-black">
      {/* Background glowing effects */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.05),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.01)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <Header />

      <main className="relative z-10 mx-auto max-w-3xl px-6 pt-32 pb-24">
        {isSubmitted ? (
          /* Submission success screen */
          <div className="rounded-3xl border border-white/10 bg-stone-950 p-12 text-center shadow-2xl backdrop-blur-md space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="bg-linear-to-br from-white to-stone-500 bg-clip-text text-3xl font-black tracking-tighter text-transparent">
              Event Submission Received!
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-stone-400">
              We have compiled your submission and pre-loaded your native mail client to send these details directly to <span className="text-emerald-400 font-bold font-mono">events@event-io.me</span>.
            </p>
            <div className="rounded-2xl border border-white/5 bg-black/60 p-6 text-left font-mono text-xs text-stone-400 space-y-2">
              <div className="border-b border-white/5 pb-2 text-[10px] font-black text-stone-500 tracking-wider">PREVIEW SUBMITTED METADATA</div>
              <div><strong className="text-white">Title:</strong> {formData.title}</div>
              <div><strong className="text-white">Category:</strong> {formData.category}</div>
              <div><strong className="text-white">Organizer:</strong> {formData.organizer}</div>
              <div><strong className="text-white">Starts:</strong> {formData.startsAt}</div>
              <div><strong className="text-white">URL:</strong> {formData.registrationUrl}</div>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <a
                href={`mailto:events@event-io.me?subject=${encodeURIComponent(`[Event Submission] - ${formData.title}`)}&body=${encodeURIComponent(
                  `Title: ${formData.title}\nCategory: ${formData.category}\nOrganizer: ${formData.organizer}\nStarts: ${formData.startsAt}\nURL: ${formData.registrationUrl}\n\nDescription: ${formData.shortDescription}`
                )}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-black tracking-widest text-black uppercase transition-all hover:scale-105 active:scale-95"
              >
                <Mail className="h-4 w-4" /> Resend Email
              </a>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setStep(1);
                  setFormData({
                    title: '',
                    category: 'hackathon',
                    organizer: '',
                    startsAt: '',
                    endsAt: '',
                    registrationUrl: '',
                    prizePool: '',
                    shortDescription: '',
                    fullDescription: '',
                    contactEmail: '',
                  });
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 hover:bg-white/5 px-6 py-3 text-xs font-bold text-white transition-colors"
              >
                Submit Another Event
              </button>
            </div>
          </div>
        ) : (
          /* Progressive multi-step submission form */
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="bg-linear-to-br from-white to-stone-500 bg-clip-text text-4xl font-black tracking-tighter text-transparent">
                Submit an Event
              </h1>
              <p className="mx-auto max-w-md text-sm text-stone-400">
                Democratize your developer gather. Add hackathons, contests, AI events, or CTFs to the central EventIO crawler pipeline.
              </p>
            </div>

            {/* Stepper indicator bar */}
            <div className="relative flex justify-between items-center max-w-xs mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 z-0" />
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold transition-all ${
                    s === step
                      ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : s < step
                      ? 'border-white bg-white text-black'
                      : 'border-white/10 bg-black text-stone-500'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-stone-950 p-8 shadow-2xl backdrop-blur-md space-y-6">
              {step === 1 && (
                <div className="space-y-5">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      General Event Details
                    </h3>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Event Title <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Major League Hacking Hackathon 2026"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-black px-4 py-3 text-xs text-white focus:outline-none transition-all ${
                        errors.title ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/10 focus:border-emerald-400'
                      }`}
                    />
                    {errors.title && <p className="mt-1 text-[10px] text-rose-400">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> Category <span className="text-emerald-400">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white focus:border-emerald-400 focus:outline-none transition-all"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value} className="bg-stone-950">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Organizer / Host <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="organizer"
                      placeholder="e.g. IEEE Student Chapter, MLH, Codeforces"
                      value={formData.organizer}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-black px-4 py-3 text-xs text-white focus:outline-none transition-all ${
                        errors.organizer ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/10 focus:border-emerald-400'
                      }`}
                    />
                    {errors.organizer && <p className="mt-1 text-[10px] text-rose-400">{errors.organizer}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      Schedule & Registration
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Starts At <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="startsAt"
                        value={formData.startsAt}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl border bg-black px-4 py-3 text-xs text-white focus:outline-none transition-all ${
                          errors.startsAt ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/10 focus:border-emerald-400'
                        }`}
                      />
                      {errors.startsAt && <p className="mt-1 text-[10px] text-rose-400">{errors.startsAt}</p>}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Ends At <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="endsAt"
                        value={formData.endsAt}
                        onChange={handleInputChange}
                        className={`w-full rounded-xl border bg-black px-4 py-3 text-xs text-white focus:outline-none transition-all ${
                          errors.endsAt ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/10 focus:border-emerald-400'
                        }`}
                      />
                      {errors.endsAt && <p className="mt-1 text-[10px] text-rose-400">{errors.endsAt}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <Link2 className="h-3.5 w-3.5" /> Registration / Source URL <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="url"
                      name="registrationUrl"
                      placeholder="e.g. https://devpost.com/hackathons/my-hackathon"
                      value={formData.registrationUrl}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-black px-4 py-3 text-xs text-white focus:outline-none transition-all ${
                        errors.registrationUrl ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/10 focus:border-emerald-400'
                      }`}
                    />
                    {errors.registrationUrl && <p className="mt-1 text-[10px] text-rose-400">{errors.registrationUrl}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" /> Prize Pool <span className="text-stone-500">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="prizePool"
                      placeholder="e.g. $10,000 cash, MacBooks, global badges"
                      value={formData.prizePool}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white focus:border-emerald-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-400" />
                      Descriptions & Verification Contact
                    </h3>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      Short Description <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="shortDescription"
                      placeholder="A quick one-sentence outline of what this event targets"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-black px-4 py-3 text-xs text-white focus:outline-none transition-all ${
                        errors.shortDescription ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/10 focus:border-emerald-400'
                      }`}
                    />
                    {errors.shortDescription && <p className="mt-1 text-[10px] text-rose-400">{errors.shortDescription}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      Detailed Event Description <span className="text-emerald-400">*</span>
                    </label>
                    <textarea
                      name="fullDescription"
                      rows={5}
                      placeholder="Explain schedules, tracks, qualification criteria, and who should apply..."
                      value={formData.fullDescription}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-black px-4 py-3 text-xs text-white focus:outline-none transition-all resize-none ${
                        errors.fullDescription ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/10 focus:border-emerald-400'
                      }`}
                    />
                    {errors.fullDescription && <p className="mt-1 text-[10px] text-rose-400">{errors.fullDescription}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Your Contact Email <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      placeholder="e.g. builder@example.com"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border bg-black px-4 py-3 text-xs text-white focus:outline-none transition-all ${
                        errors.contactEmail ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/10 focus:border-emerald-400'
                      }`}
                    />
                    {errors.contactEmail && <p className="mt-1 text-[10px] text-rose-400">{errors.contactEmail}</p>}
                  </div>
                </div>
              )}

              {/* Navigation buttons inside the form footer */}
              <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 hover:bg-white/5 px-5 py-2 text-xs font-bold text-stone-300 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-black tracking-wider text-black uppercase transition-transform hover:scale-105 active:scale-95"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-full bg-emerald-400 hover:bg-emerald-300 px-6 py-2.5 text-xs font-black tracking-widest text-black uppercase shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" /> Submit Event
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
