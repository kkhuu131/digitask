import React from 'react';
import { Link } from 'react-router-dom';
import DigimonShowcase from '../components/DigimonShowcase';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  {
    title: 'Task Management',
    desc: 'Create daily, recurring, and one-time tasks. Complete them to keep your Digimon happy and growing.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'text-teal-400',
    bg: 'bg-teal-400/10 border-teal-400/20',
  },
  {
    title: 'Digimon Evolution',
    desc: 'Watch your partner grow from Baby to Mega. Meet level and stat requirements to unlock powerful new forms.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  {
    title: 'Battle System',
    desc: 'Form a team of up to 3 Digimon and battle wild opponents or other players to earn rewards.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
];

const steps = [
  { num: '01', text: 'Create tasks categorized by different stats (HP, ATK, DEF, INT, SPD…)' },
  { num: '02', text: 'Complete tasks to earn EXP and feed your Digimon' },
  { num: '03', text: 'Level up and evolve to more powerful forms' },
  { num: '04', text: 'Collect multiple Digimon and build your battle team' },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-[#2A2A38] bg-[#0A0A0F]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="/assets/digimon/agumon_professor.png"
              alt="Digitask Logo"
              className="h-8 w-8"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="font-heading text-xl font-bold text-white">Digitask</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg border border-[#2A2A38] text-gray-400 hover:text-white hover:border-purple-500 text-sm font-body transition-all duration-150"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-body font-semibold transition-all duration-150"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs font-body tracking-widest uppercase">
            Fan Project — Digimon™ owned by Bandai/Toei Animation
          </div>
          <h1
            className="font-heading text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ textShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}
          >
            Raise Digimon.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Complete Your Goals.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-body leading-relaxed">
            Digitask turns real-life productivity into a Digimon adventure. Complete tasks to train, evolve, and battle with 400+ Digimon partners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-bold text-lg transition-all duration-200 shadow-lg shadow-purple-900/40"
            >
              Start Your Journey
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl border border-[#2A2A38] text-gray-300 hover:text-white hover:border-purple-500 font-body font-semibold text-lg transition-all duration-150"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Digimon Showcase */}
        <section className="border-t border-[#2A2A38] py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-2">
              400+ Digimon Partners
            </h2>
            <p className="text-gray-500 text-center font-body mb-6">
              Each with unique evolution paths, stats, and sprites
            </p>
            <div className="flex justify-center mb-8">
              <a
                href="/roster"
                className="px-5 py-2 rounded-lg border border-[#2A2A38] text-gray-400 hover:text-white hover:border-purple-500 text-sm font-body transition-all duration-150"
              >
                Browse Full Roster
              </a>
            </div>
            <DigimonShowcase />
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-[#2A2A38] py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">Everything You Need</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((f) => (
                <div
                  key={f.title}
                  className={`rounded-2xl border p-6 ${f.bg}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color} bg-current/10`}>
                    <span className={f.color}>{f.icon}</span>
                  </div>
                  <h3 className={`font-heading text-xl font-bold mb-2 ${f.color}`}>{f.title}</h3>
                  <p className="text-gray-400 font-body text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-[#2A2A38] py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="space-y-6">
              {steps.map((s) => (
                <div key={s.num} className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                    <span className="font-heading text-purple-400 font-bold text-sm">{s.num}</span>
                  </div>
                  <div className="pt-2.5">
                    <p className="text-gray-300 font-body leading-relaxed">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="border-t border-[#2A2A38] py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-2">See What Awaits You</h2>
            <p className="text-gray-500 text-center font-body mb-10">
              Manage your tasks and watch your Digimon grow as you complete them
            </p>
            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-[#2A2A38] shadow-2xl shadow-purple-900/20">
              <img
                src="/assets/dashboard.png"
                alt="Digitask Dashboard Preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* CTA / Feedback */}
        <section className="border-t border-[#2A2A38] py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-purple-900/30 to-indigo-900/20 rounded-2xl border border-purple-500/20 p-12">
              <h2 className="font-heading text-4xl font-bold mb-4">
                Ready to Begin?
              </h2>
              <p className="text-gray-400 font-body mb-8 leading-relaxed">
                Join and start raising your Digimon today. Found a bug or have a suggestion?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-bold text-lg transition-all duration-200 shadow-lg shadow-purple-900/40"
                >
                  Get Started Free
                </Link>
                <a
                  href="https://forms.gle/4geGdXkywwAQcZDt6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 rounded-xl border border-[#2A2A38] text-gray-300 hover:text-white hover:border-purple-500 font-body font-semibold text-lg transition-all duration-150"
                >
                  Share Feedback
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2A2A38] py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/digimon/agumon_professor.png"
              alt="Digitask"
              className="h-6 w-6 opacity-60"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="font-heading text-gray-500">Digitask</span>
          </div>
          <p className="text-gray-600 font-body text-sm">
            Fan project — Digimon™ is owned by Bandai/Toei Animation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
