import Link from 'next/link';
import {
  TrendingUp, BarChart3, BookOpen,
  BookMarked, Upload, ArrowRight,
  CheckCircle, Zap, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: TrendingUp,
    title: 'Trade Journal',
    description:
        'Log every trade with entry, exit, tags, screenshots and notes. Never lose track of a setup again.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description:
        'Equity curve, win rate, profit factor, drawdown, streaks and P&L breakdowns by symbol and day.',
  },
  {
    icon: BookOpen,
    title: 'Daily Journal',
    description:
        'Write pre-market plans and post-market reviews. Track your mood and emotional discipline over time.',
  },
  {
    icon: BookMarked,
    title: 'Playbooks',
    description:
        'Define your trading strategies as playbooks. Link trades to strategies and measure what works.',
  },
  {
    icon: Upload,
    title: 'CSV Import',
    description:
        'Import trades from MT4, MT5, Tradovate, Interactive Brokers, Webull and more.',
  },
  {
    icon: Shield,
    title: 'Rule Enforcement',
    description:
        'Set planned risk per trade. Ebenezer flags trades that violated your own risk rules automatically.',
  },
];

const stats = [
  { value: '100%', label: 'Free Forever' },
  { value: '10+', label: 'Broker Formats' },
  { value: '50+', label: 'Analytics Metrics' },
  { value: '∞', label: 'Trades Logged' },
];

export default function LandingPage() {
  return (
      <div className="min-h-screen bg-background">
        {/* Nav */}
        <nav className="border-b border-border px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center
          justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary
              flex items-center justify-center">
              <span className="text-primary-foreground
                font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-lg">Ebenezer</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2
            rounded-full border border-border bg-muted text-sm
            text-muted-foreground">
              <Zap size={14} className="text-primary" />
              100% Free — No subscriptions, ever
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Everything you need to{' '}
              <span className="text-primary">trade better</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ebenezer is a professional trading journal that helps you
              log trades, analyze performance, and build the discipline
              that leads to consistent profits.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Journaling Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-6 border-y border-border bg-muted/30">
          <div className="max-w-4xl mx-auto grid grid-cols-2
          md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-4xl font-bold text-primary">
                    {value}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {label}
                  </p>
                </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold">
                Everything in one place
              </h2>
              <p className="text-muted-foreground mt-3 text-lg">
                All the tools a serious trader needs to grow
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2
            lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, title, description }) => (
                  <div
                      key={title}
                      className="p-6 rounded-xl border border-border
                  bg-card hover:border-primary/50 transition-colors
                  group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10
                  flex items-center justify-center mb-4
                  group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-primary/5 border-t
        border-border">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">
              Ready to level up your trading?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of traders using Ebenezer to track
              and improve their performance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3
            justify-center">
              {[
                'No credit card required',
                'Free forever',
                'Unlimited trades',
              ].map((item) => (
                  <div key={item}
                       className="flex items-center gap-2 text-sm
                  text-muted-foreground">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {item}
                  </div>
              ))}
            </div>
            <Button size="lg" asChild>
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col
          md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary
              flex items-center justify-center">
              <span className="text-primary-foreground
                font-bold text-xs">E</span>
              </div>
              <span className="font-semibold">Ebenezer</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Ebenezer. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
  );
}