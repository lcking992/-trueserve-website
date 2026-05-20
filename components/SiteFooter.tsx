import Link from "next/link";
import Logo from "@/components/Logo";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.8c0-2.47 1.47-3.83 3.72-3.83 1.08 0 2.2.19 2.2.19v2.42h-1.24c-1.22 0-1.6.76-1.6 1.54V12h2.72l-.44 2.89h-2.28v6.98A10 10 0 0 0 22 12Z" />
    </svg>
  );
}
function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.84l-5.36-7.02L4.2 22H.94l8.02-9.17L1.5 2h7.02l4.85 6.41L18.24 2Zm-2.4 18h1.88L8.27 4H6.27l9.58 16Z" />
    </svg>
  );
}
function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="ts-fig-footer">
      <div className="ts-fig-container">
        <div className="ts-fig-footer-grid">
          <div className="ts-fig-footer-brand">
            <Logo size="sm" />
            <p>Your neighborhood, delivered.</p>
            <div className="ts-fig-footer-social" aria-label="Social links">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
                <FacebookIcon />
              </a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">
                <TwitterIcon />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
                <InstagramIcon />
              </a>
            </div>
          </div>
          <div className="ts-fig-footer-col">
            <h4>Get Started</h4>
            <ul>
              <li><Link href="/restaurants">Order Food</Link></li>
              <li><Link href="/signup">Sign Up</Link></li>
              <li><Link href="/about">Download App</Link></li>
              <li><Link href="/rewards">Rewards</Link></li>
            </ul>
          </div>
          <div className="ts-fig-footer-col">
            <h4>Partners</h4>
            <ul>
              <li><Link href="/merchant">Become a Restaurant Partner</Link></li>
              <li><Link href="/drive">Become a Driver</Link></li>
              <li><Link href="/merchant">Business Accounts</Link></li>
            </ul>
          </div>
          <div className="ts-fig-footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/contact">Help Center</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/orders">Track Order</Link></li>
              <li><Link href="/contact">FAQs</Link></li>
            </ul>
          </div>
        </div>
        <div className="ts-fig-footer-bottom">
          <span>© {new Date().getFullYear()} TrueServe. All rights reserved.</span>
          <div className="ts-fig-footer-bottom-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
