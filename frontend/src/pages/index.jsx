import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>AI DeFi Funding Platform</title>
        <meta name="description" content="Democratizing AI infrastructure funding through blockchain technology" />
      </Head>
      
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AI DeFi Funding Platform
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#666', 
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Democratizing AI infrastructure funding through Real-World Asset (RWA) tokenization and DeFi. 
            Invest in the future of artificial intelligence.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{
              padding: '1rem 2rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Start Investing →
            </button>
            <button style={{
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              color: '#007bff',
              border: '2px solid #007bff',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Launch Project
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '4rem 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '3rem' }}>
            Why Choose Our Platform?
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>AI-Powered</h3>
              <p style={{ color: '#666' }}>
                Leverage cutting-edge AI technology to identify and fund the most promising projects.
              </p>
            </div>
            
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Secure</h3>
              <p style={{ color: '#666' }}>
                Built on blockchain technology with smart contracts ensuring transparency and security.
              </p>
            </div>
            
            <div style={{ 
              padding: '2rem', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Profitable</h3>
              <p style={{ color: '#666' }}>
                Earn revenue shares from successful AI projects through tokenized investments.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ 
          padding: '4rem 0', 
          backgroundColor: '#007bff', 
          borderRadius: '16px',
          color: 'white',
          textAlign: 'center',
          margin: '2rem 0'
        }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Platform Statistics</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>$10M+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>Total Funding</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>50+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>AI Projects</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>1000+</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>Investors</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>25%</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>Avg. Returns</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
            Join thousands of investors and startups building the future of AI.
          </p>
          <button style={{
            padding: '1.2rem 3rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            Connect Wallet & Start
          </button>
        </section>
      </div>
    </>
  );
}