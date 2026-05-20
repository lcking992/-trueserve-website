"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { label: "Order", href: "/restaurants" },
  { label: "Rewards", href: "/rewards" },
  { label: "For Merchants", href: "/merchant" },
  { label: "Drive & Earn", href: "/drive" },
  { label: "Help", href: "/contact" },
];

const FAQS = [
  {
    q: "Where is my order?",
    a: "Sign in and open Orders to see live status, ETA, and handoff updates. If anything looks stuck, Ask Serv can route it to support.",
  },
  {
    q: "How do I cancel a TrueServe Plus or Premium subscription?",
    a: "Open Rewards, choose your current plan, and select manage plan. You can also email help@trueserve.delivery and we will help with the account change.",
  },
  {
    q: "My item is missing or wrong. What now?",
    a: "Start with Ask Serv or email help@trueserve.delivery with the order number, missing item, and a photo if you have one. We will review it with the restaurant.",
  },
  {
    q: "Can I tip after delivery?",
    a: "Yes. Open your completed order and choose the tip option when available. Drivers keep 100% of their tips.",
  },
  {
    q: "How do points work?",
    a: "Rewards points are added after delivered orders. Plus and Premium members earn faster multipliers and can unlock credit, perks, and priority support.",
  },
  {
    q: "How do I become a driver or partner restaurant?",
    a: "Drivers can apply from Drive & Earn. Restaurants can start from For Merchants. Both applications route to the admin team for review.",
  },
];

function openServ(prefill?: string) {
  window.dispatchEvent(new CustomEvent("ts:support:open", { detail: { prefill } }));
}

export default function ContactPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="ts-app-shell ts-help-page">
      <header className="ts-app-header">
        <Link href="/" aria-label="TrueServe home">
          <Logo size="sm" />
        </Link>
        <nav className="ts-app-desktop-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={item.href === "/contact" ? "active" : ""}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/login" className="ts-app-signin">Sign in</Link>
        <Link href="/restaurants" className="ts-app-order-now">Order now</Link>
      </header>

      <main>
        <section className="ts-help-hero">
          <span className="ts-help-chip">
            <Sparkles size={16} aria-hidden="true" />
            Help Center
          </span>
          <h1>How can we <em>help?</em></h1>
          <p>Most answers in under a minute. Real humans are always one tap away.</p>
          <form
            className="ts-help-search"
            onSubmit={(event) => {
              event.preventDefault();
              const value = new FormData(event.currentTarget).get("q");
              openServ(typeof value === "string" ? value : undefined);
            }}
          >
            <Search size={24} aria-hidden="true" />
            <input name="q" placeholder="Search 'cancel subscription', 'missing item'..." aria-label="Search help" />
            <button type="submit">Search</button>
          </form>
        </section>

        <section className="ts-help-action-grid" aria-label="Support options">
          <button
            type="button"
            className="ts-help-action-card primary"
            onClick={() => openServ("I need help with my TrueServe account.")}
          >
            <Sparkles size={30} aria-hidden="true" />
            <strong>Ask Serv</strong>
            <span>AI helper · instant</span>
            <em>Open chat <ArrowRight size={19} aria-hidden="true" /></em>
          </button>
          <button
            type="button"
            className="ts-help-action-card"
            onClick={() => openServ("I need live chat support.")}
          >
            <MessageCircle size={30} aria-hidden="true" />
            <strong>Live chat</strong>
            <span>Avg. under 2 min</span>
            <em>Start chat <ArrowRight size={19} aria-hidden="true" /></em>
          </button>
          <a className="ts-help-action-card" href="tel:8008787378">
            <Phone size={30} aria-hidden="true" />
            <strong>Call support</strong>
            <span>(800) TRU-SERV</span>
            <em>Call now <ArrowRight size={19} aria-hidden="true" /></em>
          </a>
        </section>

        <section className="ts-help-faq">
          <h2>Top questions</h2>
          <div className="ts-help-faq-list">
            {FAQS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <article key={item.q} className={isOpen ? "open" : ""}>
                  <button type="button" onClick={() => setOpenIndex(isOpen ? -1 : index)}>
                    <span>{item.q}</span>
                    <ChevronDown size={24} aria-hidden="true" />
                  </button>
                  <div>
                    <p>{item.a}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="ts-help-human">
          <div>
            <h2>Still need a human?</h2>
            <p>Drop us a line. We answer every email within 4 hours.</p>
          </div>
          <a href="mailto:help@trueserve.delivery">
            <Mail size={22} aria-hidden="true" />
            help@trueserve.delivery
          </a>
        </section>
      </main>
    </div>
  );
}
