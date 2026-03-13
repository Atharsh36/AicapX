import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Network, Wallet, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <Network size={28} className={styles.logoIcon} />
          <span className={styles.logoText}>Omni<span className="gradient-text">AI</span></span>
        </Link>
        
        <nav className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          <Link href="/market" className={styles.navLink}>Marketplace</Link>
          <Link href="/startups" className={styles.navLink}>For Startups</Link>
          <Link href="/portfolio" className={styles.navLink}>Portfolio</Link>
          <Link href="/admin" className={styles.navLink}>Admin</Link>
          <div className={styles.walletBtn}>
            <ConnectButton />
          </div>
        </nav>

        <button 
          className={styles.mobileToggle} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}