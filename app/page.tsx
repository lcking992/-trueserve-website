export const dynamic = "force-dynamic";

import Link from "next/link";
import LandingSearch from "@/components/LandingSearch";
import NotificationBell from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";
import { cookies } from "next/headers";
import EmergencyBanner from "@/components/EmergencyBanner";
import Logo from "@/components/Logo";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  return (
    <div className="min-h-screen relative font-sans text-slate-300 bg-black selection:bg-primary/30">
      <EmergencyBanner />

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-[100] bg-black/60 backdrop-blur-3xl border-b border-white/10 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <Logo size="lg" />

          <div className="hidden lg:flex items-center gap-12 text-[12px] font-black uppercase tracking-[0.4em] text-slate-400">
            <Link href="/restaurants" className="hover:text-primary transition-colors">ORDER FOOD</Link>
            <Link href="/merchant" className="hover:text-primary transition-colors whitespace-nowrap">FOR MERCHANTS</Link>
            <Link href="/driver" className="hover:text-primary transition-colors whitespace-nowrap">DRIVER HUB</Link>
          </div>

          <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link 
              href="https://www.instagram.com/trueserve_food/" 
              target="_blank" 
              className="hidden lg:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-slate-400 hover:text-primary hover:bg-white/10 transition-all border border-white/5 hover:scale-110"
              title="Instagram"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>
            <Link 
              href="https://www.facebook.com/share/1EHeS1jdoq/?mibextid=wwXIfr" 
              target="_blank" 
              className="hidden lg:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-slate-400 hover:text-primary hover:bg-white/10 transition-all border border-white/5 hover:scale-110"
              title="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
              </svg>
            </Link>
            <Link 
              href="https://www.linkedin.com/company/112360123/admin/dashboard/" 
              target="_blank" 
              className="hidden lg:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-slate-400 hover:text-primary hover:bg-white/10 transition-all border border-white/5 hover:scale-110"
              title="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </Link>
          </div>
            {userId ? (
              <div className="flex items-center gap-4">
                <NotificationBell userId={userId} />
                <Link href="/user/settings" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10 hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link href="/login" className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all border border-white/10 rounded-full px-5 py-2 hover:bg-white/5 italic">Sign In</Link>
                <Link href="/restaurants" className="badge-solid-primary !px-10 !py-3 !text-[11px] h-glow">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/hero_food_delivery.png"
              alt="Fine Dining"
              className="w-full h-full object-cover opacity-30 brightness-50 blur-3xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black" />
          </div>

          <div className="relative z-10 max-w-6xl space-y-6 sm:space-y-12 animate-fade-in text-center flex flex-col items-center justify-center glow-blur-primary px-2">
            
            <h1 className="text-[2.25rem] sm:text-5xl md:text-[115px] leading-[0.85] md:leading-[0.8] text-white font-black tracking-tighter italic animate-slide-up select-none">
              Cravings meet <br />
              <span className="text-primary not-italic tracking-[-0.03em] drop-shadow-[5px_5px_0px_rgba(255,255,255,0.1)] uppercase italic">Lightning Speed.</span>
            </h1>

            <p className="max-w-3xl mx-auto text-lg md:text-2xl text-slate-400 font-bold leading-relaxed italic animate-fade-in delay-200">
              Experience the future of local food delivery. Zero platform fees, fair driver pay, and the best local flavors delivered to your door.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-8 sm:pt-12 w-full px-2">
              <Link href="/restaurants" className="badge-solid-primary !px-8 sm:!px-16 !py-4 sm:!py-6 !text-sm w-full sm:w-auto">
                Browse Restaurants
              </Link>
              <Link href="/merchant" className="badge-outline-white !px-8 sm:!px-16 !py-4 sm:!py-6 !text-sm h-glow w-full sm:w-auto">
                For Businesses
              </Link>
            </div>
          </div>
        </section>

        {/* ── PLATFORM FEATURES ───────────────────────────────────────────── */}
        <section className="py-16 sm:py-32 bg-[#0a0a0b] w-full flex flex-col items-center">
          <div className="w-full max-w-7xl px-4 sm:px-8 flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3 sm:gap-10 text-primary font-black uppercase tracking-[0.3em] sm:tracking-[1em] text-[9px] mb-12 sm:mb-24 opacity-80 select-none w-full">
                <div className="flex-1 h-px bg-primary/20 max-w-[40px] sm:max-w-[80px]" />
                <span className="shrink-0 px-2 sm:px-4">Platform Features</span>
                <div className="flex-1 h-px bg-primary/20 max-w-[40px] sm:max-w-[80px]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {[
                { 
                  title: "Order Locally.", 
                  img: "/community_section.png",
                  desc: "Support independent gems. Zero platform fees ensure local restaurants stay in business.",
                  cta: "Explore Menus",
                  link: "/restaurants"
                },
                { 
                  title: "Grow Partners.", 
                  img: "/merchant_section.png",
                  desc: "Stop losing margins to big apps. Fair pricing and elite dispatch built for you.",
                  cta: "Partner Hub",
                  link: "/merchant"
                },
                { 
                  title: "Drive More.", 
                  img: "/diverse_drivers.png",
                  desc: "Join our fleet and earn 20-30% more with optimized routing and reliable local payouts.",
                  cta: "Start Driving",
                  link: "/driver"
                }
              ].map((card, i) => (
                <Link key={i} href={card.link} className={`reveal-scale delay-${(i + 1) * 200} group relative min-h-[340px] sm:min-h-[480px] md:min-h-[600px] bg-black overflow-hidden border border-white/5 transition-all duration-700 flex flex-col justify-end p-6 sm:p-10 md:p-12 hover:bg-white/[0.02] active:scale-[0.98] shadow-2xl`}>
                  <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2.5s] opacity-20 group-hover:opacity-45 brightness-50" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="relative z-10 space-y-3 sm:space-y-6 flex flex-col items-center text-center">
                    <h3 className="text-3xl sm:text-4xl md:text-6xl font-[900] text-white leading-[0.85] italic uppercase font-serif tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        {card.title}
                    </h3>
                    <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity italic">
                        {card.desc}
                    </p>
                    <div className="pt-2 sm:pt-6">
                      <div className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-white border border-white/20 rounded-md px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm bg-black/40 group-hover:border-primary group-hover:text-primary transition-all duration-500 italic">
                         {card.cta} <span className="group-hover:translate-x-2 transition-transform duration-500">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
       <footer className="py-16 sm:py-32 bg-black border-t border-white/10 px-6 sm:px-10">
        <div className="container mx-auto max-w-7xl text-center space-y-20">
          <div className="flex flex-col items-center gap-10">
            <Logo size="xl" className="animate-pulse" />
            
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-10 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 italic">
              <Link href="/privacy" className="hover:text-white transition-colors">Safety</Link>
              <Link href="/merchant" className="hover:text-primary transition-colors">Merchant Help</Link>
              <Link href="/driver" className="hover:text-primary transition-colors">Driver Guide</Link>
              <Link 
                href="https://www.instagram.com/trueserve_food/" 
                target="_blank" 
                className="text-slate-500 hover:text-primary flex items-center gap-2 group/insta transition-all"
              >
                <svg className="w-5 h-5 group-hover/insta:scale-125 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              <Link 
                href="https://www.facebook.com/share/1EHeS1jdoq/?mibextid=wwXIfr" 
                target="_blank" 
                className="text-slate-500 hover:text-primary flex items-center gap-2 group/fb transition-all"
              >
                <svg className="w-5 h-5 group-hover/fb:scale-125 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.248h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
              </Link>
              <Link 
                href="https://www.linkedin.com/company/112360123/admin/dashboard/" 
                target="_blank" 
                className="text-slate-500 hover:text-primary flex items-center gap-2 group/linkedin transition-all"
              >
                <svg className="w-5 h-5 group-hover/linkedin:scale-125 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="pt-16 border-t border-white/5 text-slate-700 text-[11px] font-black uppercase tracking-[0.4em] italic">
            © {new Date().getFullYear()} TrueServe. Empowering local businesses through strategic logistics and elite partnerships.
          </div>
        </div>
      </footer>
    </div>
  );
}
