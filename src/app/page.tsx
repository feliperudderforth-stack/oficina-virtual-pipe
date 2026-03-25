'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Users, Video, MessageSquare, Shield, Zap,
  Globe, Monitor, ArrowRight, ChevronRight, Star,
  Headphones, Lock, BarChart3, Layers, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Feature Card ────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, description, color }: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="corporate-card p-6 group">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-sm text-white/60 mt-1">{label}</p>
    </div>
  );
}

// ─── Login Modal ─────────────────────────────────────────────────────────

function LoginModal({ onJoin }: { onJoin: (data: { name: string; email: string; department: string; title: string }) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [title, setTitle] = useState('');
  const [step, setStep] = useState(0);

  const departments = [
    'Engineering', 'Design', 'Product', 'Marketing',
    'Sales', 'HR', 'Finance', 'Operations', 'Executive'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin({
        name: name.trim(),
        email: email.trim(),
        department,
        title: title.trim() || 'Team Member',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Enter Virtual Office</h2>
            <p className="text-brand-200 text-sm mt-2">Join your team in the virtual workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Smith"
                className="input-field"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="input-field"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Software Engineer"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full !py-3 !text-base"
              disabled={!name.trim()}
            >
              Enter Office
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              By entering, you agree to our workspace guidelines
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  const handleJoin = (data: { name: string; email: string; department: string; title: string }) => {
    // Store user data in sessionStorage for the office page
    sessionStorage.setItem('virtualOfficeUser', JSON.stringify(data));
    router.push('/office');
  };

  const features = [
    {
      icon: Building2,
      title: 'Immersive 2D Office',
      description: 'Navigate a beautifully designed virtual office with conference rooms, workspaces, lounges, and more.',
      color: '#4263eb',
    },
    {
      icon: Video,
      title: 'Video & Audio Calls',
      description: 'Crystal-clear video calls with screen sharing. Walk up to someone to start a conversation.',
      color: '#7048e8',
    },
    {
      icon: MessageSquare,
      title: 'Internal Messaging',
      description: 'Channels, direct messages, threads, reactions, and file sharing. Everything you need to communicate.',
      color: '#1098ad',
    },
    {
      icon: Users,
      title: '2000+ Concurrent Users',
      description: 'Enterprise-grade infrastructure supporting thousands of users in the same virtual office.',
      color: '#0ca678',
    },
    {
      icon: Headphones,
      title: 'Proximity Audio',
      description: 'Hear colleagues as you walk near them. Natural, spatial audio just like a real office.',
      color: '#e8590c',
    },
    {
      icon: Lock,
      title: 'Private Rooms',
      description: 'Lock conference rooms for private meetings. Create secure spaces for sensitive discussions.',
      color: '#d6336c',
    },
    {
      icon: Monitor,
      title: 'Screen Sharing',
      description: 'Share your screen in meetings or at your desk. Collaborate visually with your team.',
      color: '#5f3dc4',
    },
    {
      icon: Sparkles,
      title: 'Real-time Presence',
      description: 'See who is online, in meetings, busy, or away. Know your team availability at a glance.',
      color: '#f59f00',
    },
    {
      icon: BarChart3,
      title: 'Meeting Rooms',
      description: 'Boardrooms, huddle rooms, and conference rooms with capacity management and scheduling.',
      color: '#2b8a3e',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-auto">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">VirtualOffice</span>
            <span className="badge bg-brand-100 text-brand-700 !text-[9px] font-bold">ENTERPRISE</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#enterprise" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Enterprise</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowLogin(true)}
          >
            Enter Office
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full text-sm text-brand-700 font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Now supporting 2,000+ concurrent users
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight max-w-4xl mx-auto">
            Your team&apos;s
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent"> virtual office</span>
            {' '}headquarters
          </h1>

          <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            A real-time collaborative workspace where remote teams work together as if they were
            in the same building. Walk, talk, meet, and collaborate — virtually.
          </p>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              className="btn-primary !px-8 !py-4 !text-lg shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 transition-all"
              onClick={() => setShowLogin(true)}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary !px-8 !py-4 !text-lg">
              Watch Demo
            </button>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 overflow-hidden shadow-2xl">
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Simplified office preview */}
                <div className="absolute inset-8 rounded-xl bg-[#ede9e0] opacity-90">
                  {/* Mini rooms */}
                  <div className="absolute left-[5%] top-[5%] w-[25%] h-[35%] rounded-lg bg-[#f0e6d8] border border-[#a0845c]/30" />
                  <div className="absolute left-[35%] top-[5%] w-[30%] h-[25%] rounded-lg bg-[#f0ebe3] border border-[#c4b5a0]/30" />
                  <div className="absolute right-[5%] top-[5%] w-[20%] h-[25%] rounded-lg bg-[#e8edf5] border border-[#8da4c8]/30" />
                  <div className="absolute left-[5%] top-[45%] w-[35%] h-[50%] rounded-lg bg-[#f5f5f0] border border-[#d4cfc5]/30">
                    {/* Mini desks */}
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="absolute rounded-sm bg-[#8b7355]/60" style={{
                        left: `${15 + (i % 3) * 30}%`,
                        top: `${15 + Math.floor(i / 3) * 40}%`,
                        width: '20%',
                        height: '15%',
                      }} />
                    ))}
                  </div>
                  <div className="absolute right-[5%] top-[35%] w-[30%] h-[35%] rounded-lg bg-[#f5f5f0] border border-[#d4cfc5]/30" />
                  <div className="absolute left-[5%] bottom-[2%] w-[25%] h-[0%] rounded-lg bg-[#faf3e8] border border-[#d4a574]/30" />

                  {/* Animated avatars */}
                  {[
                    { x: 20, y: 55, color: '#4c6ef5', name: 'AS' },
                    { x: 30, y: 60, color: '#7950f2', name: 'MK' },
                    { x: 50, y: 15, color: '#be4bdb', name: 'JD' },
                    { x: 75, y: 40, color: '#fa5252', name: 'TW' },
                    { x: 15, y: 20, color: '#40c057', name: 'RL' },
                    { x: 85, y: 15, color: '#fd7e14', name: 'KP' },
                    { x: 60, y: 70, color: '#15aabf', name: 'NC' },
                  ].map((avatar, i) => (
                    <div
                      key={i}
                      className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-[7px] font-bold shadow-md animate-float"
                      style={{
                        left: `${avatar.x}%`,
                        top: `${avatar.y}%`,
                        backgroundColor: avatar.color,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    >
                      {avatar.name}
                    </div>
                  ))}
                </div>

                {/* Top bar mockup */}
                <div className="absolute top-0 inset-x-0 h-8 bg-gray-800/50 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-white/40 text-[10px] ml-4">VirtualOffice — Main Floor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-r from-brand-800 to-brand-900">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-around">
          <StatCard value="2,000+" label="Concurrent Users" />
          <StatCard value="< 50ms" label="Latency" />
          <StatCard value="99.9%" label="Uptime SLA" />
          <StatCard value="E2E" label="Encryption" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900">
              Everything your team needs
            </h2>
            <p className="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
              A complete virtual office platform designed for enterprise teams that demand the best.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-6">Built for Enterprise</h2>
          <p className="text-lg text-gray-500 mb-12">
            SOC2 compliant, SSO support, admin dashboards, and dedicated support for large organizations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="corporate-card p-6 text-center">
              <Shield className="w-10 h-10 text-brand-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900">Enterprise Security</h4>
              <p className="text-sm text-gray-500 mt-2">End-to-end encryption, SSO, SAML, role-based access control</p>
            </div>
            <div className="corporate-card p-6 text-center">
              <Globe className="w-10 h-10 text-brand-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900">Global Infrastructure</h4>
              <p className="text-sm text-gray-500 mt-2">Multi-region deployment, CDN, 99.9% uptime guarantee</p>
            </div>
            <div className="corporate-card p-6 text-center">
              <Layers className="w-10 h-10 text-brand-600 mx-auto mb-4" />
              <h4 className="font-bold text-gray-900">Integrations</h4>
              <p className="text-sm text-gray-500 mt-2">Slack, Teams, Google Workspace, Jira, GitHub, and 50+ more</p>
            </div>
          </div>

          <button
            className="btn-primary !px-8 !py-4 !text-lg mt-12"
            onClick={() => setShowLogin(true)}
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">VirtualOffice</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; 2025 VirtualOffice. All rights reserved. Enterprise Virtual Workspace Platform.
          </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && <LoginModal onJoin={handleJoin} />}
    </div>
  );
}
