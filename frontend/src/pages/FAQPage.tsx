import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, HelpCircle, MessageSquare, ShieldCheck, Truck, RotateCcw, CreditCard } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'orders' | 'shipping' | 'returns' | 'sizing' | 'payment';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: '1',
    category: 'orders',
    question: 'How do I track my order status?',
    answer: 'Once your order is confirmed, you can track its progress in real-time under My Orders in your account dashboard. You will also receive an email notification with tracking details as soon as your package ships.'
  },
  {
    id: '2',
    category: 'orders',
    question: 'Can I cancel or modify an order after placing it?',
    answer: 'Orders enter automated processing immediately. If your order is still in "Processing" status, you can cancel it directly from the My Orders page or contact our concierge within 30 minutes of placing the order.'
  },
  {
    id: '3',
    category: 'shipping',
    question: 'What are your delivery times and costs?',
    answer: 'We offer complimentary standard shipping on all orders over $75 (delivered in 3–5 business days). Expedited shipping is available at checkout for $15 (2 business days), and overnight priority delivery for $25.'
  },
  {
    id: '4',
    category: 'shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes! Lumé delivers to over 65 countries worldwide. International shipping charges and estimated duties are calculated transparently at checkout with no hidden arrival fees.'
  },
  {
    id: '5',
    category: 'returns',
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in their original packaging with tags intact. Return shipping is free for all domestic orders.'
  },
  {
    id: '6',
    category: 'returns',
    question: 'How quickly will I receive my refund?',
    answer: 'Once our fulfillment center inspects your return (typically 1–2 business days), your refund is immediately processed to your original payment method. Depending on your financial institution, it usually posts in 3–5 business days.'
  },
  {
    id: '7',
    category: 'sizing',
    question: 'How do I find my ideal size?',
    answer: 'Please consult our interactive Size Guide which includes exact body measurements, garment tolerances, and international size conversions. If you fall between sizes, we recommend sizing up for outerwear and tailored fits.'
  },
  {
    id: '8',
    category: 'sizing',
    question: 'Are garment fabrics pre-shrunk?',
    answer: 'All Lumé cotton, linen, and blended textiles are pre-washed and pre-shrunk during artisan garment dying to ensure minimal dimensional change when cared for as directed.'
  },
  {
    id: '9',
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept Visa, MasterCard, American Express, Apple Pay, Google Pay, and Lumé Digital Gift Cards. All transactions are encrypted with 256-bit SSL security.'
  },
  {
    id: '10',
    category: 'payment',
    question: 'Can I split payments or use multiple gift cards?',
    answer: 'You can combine a Lumé Gift Card with any credit or debit card during checkout to cover the remaining balance.'
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<string[]>(['1', '3', '5']);

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="faq-page">
      {/* Hero Header */}
      <div className="faq-hero">
        <div className="faq-hero-tag">Help & Knowledge Base</div>
        <h1 className="faq-hero-title">Frequently Asked Questions</h1>
        <p className="faq-hero-subtitle">
          Everything you need to know about our products, deliveries, returns, and services.
        </p>

        {/* Search Bar */}
        <div className="faq-search-wrap">
          <Search size={18} className="faq-search-icon" />
          <input 
            type="text" 
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faq-search-input"
          />
          {searchQuery && (
            <button 
              className="faq-search-clear" 
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="faq-categories">
        {[
          { id: 'all', label: 'All Topics', icon: HelpCircle },
          { id: 'orders', label: 'Orders & Tracking', icon: MessageSquare },
          { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
          { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
          { id: 'sizing', label: 'Size & Fit', icon: ShieldCheck },
          { id: 'payment', label: 'Payments', icon: CreditCard },
        ].map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              className={`faq-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="faq-list-container">
        {filteredFaqs.length === 0 ? (
          <div className="faq-empty">
            <HelpCircle size={40} style={{ color: 'var(--c-text-3)', marginBottom: '16px' }} />
            <h3>No matching questions found</h3>
            <p>Try searching with different keywords or browse our categories above.</p>
            <button 
              className="faq-reset-btn"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map(faq => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div key={faq.id} className={`faq-card ${isOpen ? 'open' : ''}`}>
                <button 
                  className="faq-card-header"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">{faq.question}</span>
                  <div className="faq-toggle-icon">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>
                {isOpen && (
                  <div className="faq-card-body">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Have Questions Box */}
      <div className="faq-contact-card">
        <div className="faq-contact-text">
          <h3>Still have questions?</h3>
          <p>Our dedicated client concierge is available 7 days a week to assist you.</p>
        </div>
        <Link to="/contact" className="faq-contact-btn">
          Contact Support
        </Link>
      </div>

      <style>{`
        .faq-page {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          box-sizing: border-box;
        }

        .faq-hero {
          text-align: center;
          margin-bottom: 40px;
        }

        .faq-hero-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--c-accent-2);
          background: rgba(196, 151, 74, 0.12);
          padding: 6px 14px;
          border-radius: var(--r-full);
          margin-bottom: 16px;
        }

        .faq-hero-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          margin: 0 0 14px;
        }

        .faq-hero-subtitle {
          font-size: 16px;
          color: var(--c-text-2);
          max-width: 600px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .faq-search-wrap {
          position: relative;
          max-width: 580px;
          margin: 0 auto;
        }

        .faq-search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--c-text-3);
          pointer-events: none;
        }

        .faq-search-input {
          width: 100%;
          height: 52px;
          border-radius: var(--r-full);
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          box-shadow: var(--glass-highlight), var(--shadow-sm);
          padding: 0 90px 0 50px;
          font-size: 15px;
          color: var(--c-text-1);
          box-sizing: border-box;
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
        }

        .faq-search-input:focus {
          border-color: var(--c-accent-2);
          box-shadow: 0 0 0 3px rgba(196, 151, 74, 0.2);
        }

        .faq-search-clear {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 12px;
          font-weight: 600;
          color: var(--c-text-3);
          cursor: pointer;
        }

        .faq-search-clear:hover {
          color: var(--c-text-1);
        }

        .faq-categories {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 36px;
        }

        .faq-cat-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: var(--r-full);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          color: var(--c-text-2);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .faq-cat-pill:hover {
          color: var(--c-text-1);
          border-color: var(--c-text-2);
          transform: translateY(-1px);
        }

        .faq-cat-pill.active {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border-color: var(--c-accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .faq-list-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 48px;
        }

        .faq-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          border-radius: var(--r-lg);
          overflow: hidden;
          transition: border-color var(--transition), box-shadow var(--transition);
        }

        .faq-card:hover {
          border-color: var(--glass-border-hover);
        }

        .faq-card.open {
          border-color: var(--c-accent-2);
        }

        .faq-card-header {
          width: 100%;
          padding: 20px 24px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          gap: 16px;
        }

        .faq-question-text {
          font-size: 16px;
          font-weight: 600;
          color: var(--c-text-1);
          line-height: 1.4;
        }

        .faq-toggle-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--c-surface-raised);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--c-text-2);
          flex-shrink: 0;
          transition: background var(--transition);
        }

        .faq-card:hover .faq-toggle-icon {
          color: var(--c-text-1);
        }

        .faq-card-body {
          padding: 0 24px 22px;
          font-size: 14px;
          color: var(--c-text-2);
          line-height: 1.7;
          border-top: 1px solid var(--c-border-subtle);
          padding-top: 16px;
        }

        .faq-card-body p {
          margin: 0;
        }

        .faq-empty {
          text-align: center;
          padding: 60px 20px;
          background: var(--glass-bg);
          border-radius: var(--r-xl);
          border: 1px solid var(--glass-border);
        }

        .faq-reset-btn {
          margin-top: 16px;
          padding: 10px 24px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .faq-contact-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 32px;
          border-radius: var(--r-xl);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          gap: 24px;
          flex-wrap: wrap;
        }

        .faq-contact-text h3 {
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .faq-contact-text p {
          margin: 0;
          font-size: 14px;
          color: var(--c-text-2);
        }

        .faq-contact-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 28px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity var(--transition), transform var(--transition);
        }

        .faq-contact-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .faq-contact-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .faq-contact-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
