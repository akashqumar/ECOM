export interface GiftCard {
  id: string;
  code: string;
  pin: string;
  initialAmount: number;
  currentBalance: number;
  currency: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message?: string;
  cardTheme: 'gold' | 'obsidian' | 'emerald' | 'rose';
  createdAt: string;
  status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED';
  deliveryDate?: string;
}

const STORAGE_KEY = 'lume_gift_cards_registry_v1';
const USER_SAVED_CARDS_KEY = 'lume_user_saved_gift_card_codes_v1';

// Seed demo gift cards for immediate testing
const INITIAL_DEMO_CARDS: GiftCard[] = [
  {
    id: 'gc-demo-1',
    code: 'LUME-2026-GOLD-100',
    pin: '2026',
    initialAmount: 100,
    currentBalance: 100,
    currency: 'USD',
    recipientName: 'Valued Client',
    recipientEmail: 'client@example.com',
    senderName: 'Lumé Concierge',
    message: 'Welcome to Lumé. Enjoy this complimentary $100 digital certificate.',
    cardTheme: 'gold',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'ACTIVE'
  },
  {
    id: 'gc-demo-2',
    code: 'LUME-FASHION-50',
    pin: '5050',
    initialAmount: 50,
    currentBalance: 50,
    currency: 'USD',
    recipientName: 'Style Icon',
    recipientEmail: 'style@example.com',
    senderName: 'Lumé Editorial',
    message: 'Curate your next modern look with our compliments.',
    cardTheme: 'emerald',
    createdAt: '2026-02-14T00:00:00Z',
    status: 'ACTIVE'
  },
  {
    id: 'gc-demo-3',
    code: 'LUME-VIP-250',
    pin: '8888',
    initialAmount: 250,
    currentBalance: 250,
    currency: 'USD',
    recipientName: 'VIP Member',
    recipientEmail: 'vip@example.com',
    senderName: 'Founder Circle',
    message: 'Exclusive gift certificate for our inaugural season collection.',
    cardTheme: 'obsidian',
    createdAt: '2026-03-01T00:00:00Z',
    status: 'ACTIVE'
  }
];

function initializeRegistry(): GiftCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CARDS));
      return INITIAL_DEMO_CARDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CARDS));
      return INITIAL_DEMO_CARDS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse gift card registry', err);
    return INITIAL_DEMO_CARDS;
  }
}

export const giftCardService = {
  getAllCards(): GiftCard[] {
    return initializeRegistry();
  },

  getCardByCode(code: string, pin?: string): { card?: GiftCard; error?: string } {
    if (!code) return { error: 'Please enter a valid gift card code' };
    const cards = initializeRegistry();
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '-');

    const found = cards.find(c => c.code.toUpperCase() === cleanCode);
    if (!found) {
      return { error: 'Gift card code not found. Please verify the code.' };
    }

    if (pin && pin.trim()) {
      if (found.pin !== pin.trim()) {
        return { error: 'Incorrect 4-digit PIN for this gift card.' };
      }
    }

    return { card: found };
  },

  createCard(params: {
    amount: number;
    recipientName: string;
    recipientEmail: string;
    senderName: string;
    message?: string;
    cardTheme?: 'gold' | 'obsidian' | 'emerald' | 'rose';
  }): GiftCard {
    const cards = initializeRegistry();
    const randPart1 = Math.floor(1000 + Math.random() * 9000);
    const randPart2 = Math.floor(1000 + Math.random() * 9000);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const newCard: GiftCard = {
      id: `gc-${Date.now()}-${randPart1}`,
      code: `LUME-${randPart1}-${randPart2}`,
      pin,
      initialAmount: params.amount,
      currentBalance: params.amount,
      currency: 'USD',
      recipientName: params.recipientName.trim() || 'Valued Recipient',
      recipientEmail: params.recipientEmail.trim(),
      senderName: params.senderName.trim() || 'A Friend',
      message: params.message?.trim(),
      cardTheme: params.cardTheme || 'gold',
      createdAt: new Date().toISOString(),
      status: 'ACTIVE'
    };

    cards.unshift(newCard);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    this.saveUserCardCode(newCard.code);

    return newCard;
  },

  redeemCard(code: string, amountToDeduct: number, pin?: string): { 
    success: boolean; 
    deducted: number; 
    remainingBalance: number; 
    error?: string;
  } {
    const { card, error } = this.getCardByCode(code, pin);
    if (!card) {
      return { success: false, deducted: 0, remainingBalance: 0, error: error || 'Card not found' };
    }

    if (card.currentBalance <= 0 || card.status === 'DEPLETED') {
      return { success: false, deducted: 0, remainingBalance: 0, error: 'This gift card has a $0.00 balance.' };
    }

    const cards = initializeRegistry();
    const idx = cards.findIndex(c => c.code.toUpperCase() === card.code.toUpperCase());
    if (idx === -1) {
      return { success: false, deducted: 0, remainingBalance: 0, error: 'Card not found in registry' };
    }

    const actualDeduction = Math.min(amountToDeduct, card.currentBalance);
    const newBalance = Math.round((card.currentBalance - actualDeduction) * 100) / 100;

    cards[idx] = {
      ...cards[idx],
      currentBalance: newBalance,
      status: newBalance <= 0 ? 'DEPLETED' : 'ACTIVE'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));

    return {
      success: true,
      deducted: actualDeduction,
      remainingBalance: newBalance
    };
  },

  saveUserCardCode(code: string): void {
    try {
      const clean = code.trim().toUpperCase();
      const raw = localStorage.getItem(USER_SAVED_CARDS_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(clean)) {
        list.unshift(clean);
        localStorage.setItem(USER_SAVED_CARDS_KEY, JSON.stringify(list));
      }
    } catch (err) {
      console.error('Failed to save user card code', err);
    }
  },

  getUserCards(): GiftCard[] {
    try {
      const raw = localStorage.getItem(USER_SAVED_CARDS_KEY);
      const savedCodes: string[] = raw ? JSON.parse(raw) : [];
      const allCards = initializeRegistry();

      // Include all user-saved codes plus default demo codes
      const codesToInclude = new Set([
        ...savedCodes,
        'LUME-2026-GOLD-100',
        'LUME-FASHION-50',
        'LUME-VIP-250'
      ]);

      return allCards.filter(c => codesToInclude.has(c.code.toUpperCase()));
    } catch (err) {
      return INITIAL_DEMO_CARDS;
    }
  }
};
