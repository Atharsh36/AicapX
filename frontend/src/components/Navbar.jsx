import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Cpu, Wallet, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => router.pathname === path;

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="AiCapX Logo" className={styles.logoImg} />
          <span className={styles.logoText}>AiCap<span className={styles.logoX}>X</span></span>
        </Link>
        
        <nav className={`${styles.navLinks} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          <Link href="/market" className={`${styles.navLink} ${isActive('/market') ? styles.active : ''}`}>Marketplace</Link>
          <Link href="/startups" className={`${styles.navLink} ${isActive('/startups') ? styles.active : ''}`}>Startups</Link>
          <Link href="/portfolio" className={`${styles.navLink} ${isActive('/portfolio') ? styles.active : ''}`}>Portfolio</Link>
          <Link href="/admin" className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}>Admin</Link>
          <div className={styles.walletBtn}>
            <ConnectButton showBalance={true} chainStatus="icon" />
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