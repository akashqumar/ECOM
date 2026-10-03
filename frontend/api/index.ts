import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CATEGORIES_DATA, PRODUCTS_DATA } from './data';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  createdAt: string;
}

const users: Map<string, User> = new Map();
// Pre-populate with live demo account
users.set('demo@example.com', {
  id: '15f193fa-2e9c-4a39-ac32-ba80be59d95f',
  email: 'demo@example.com',
  firstName: 'Alex',
  lastName: 'Morgan',
  phone: '+1 (555) 234-5678',
  role: 'ROLE_CUSTOMER',
  createdAt: '2026-09-29T18:27:12.441Z',
});

const orders: any[] = [];
const cartStore: Map<string, any[]> = new Map();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse path
  let pathStr = '';
  if (req.query.path) {
    pathStr = Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path;
  } else {
    const rawUrl = req.url || '';
    const qIdx = rawUrl.indexOf('?');
    const pathPart = qIdx !== -1 ? rawUrl.substring(0, qIdx) : rawUrl;
    pathStr = pathPart.replace(/^\/api\/?/, '');
  }

  const parts = pathStr.split('/').filter(Boolean);
  const resource = parts[0] || '';
  const sub = parts[1] || '';

  try {
    // 1. AUTH
    if (resource === 'auth') {
      if (sub === 'login' && req.method === 'POST') {
        const { email } = req.body || {};
        const safeEmail = (email || 'demo@example.com').trim().toLowerCase();
        let user = users.get(safeEmail);
        if (!user) {
          user = {
            id: 'usr-' + Math.random().toString(36).substring(2, 9),
            email: safeEmail,
            firstName: safeEmail.split('@')[0],
            lastName: 'User',
            phone: '+1 (555) 019-2834',
            role: 'ROLE_CUSTOMER',
            createdAt: new Date().toISOString(),
          };
          users.set(safeEmail, user);
        }
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            accessToken: 'live_cloud_jwt_' + Buffer.from(user.email).toString('base64'),
            refreshToken: 'live_cloud_refresh_' + Date.now(),
            tokenType: 'Bearer',
            expiresIn: 86400000,
            user,
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (sub === 'register' && req.method === 'POST') {
        const { firstName, lastName, email, phone } = req.body || {};
        const safeEmail = (email || 'new@example.com').trim().toLowerCase();
        const newUser: User = {
          id: 'usr-' + Math.random().toString(36).substring(2, 9),
          email: safeEmail,
          firstName: firstName || 'First',
          lastName: lastName || 'Last',
          phone: phone || '+1 (555) 000-1122',
          role: 'ROLE_CUSTOMER',
          createdAt: new Date().toISOString(),
        };
        users.set(safeEmail, newUser);
        return res.status(200).json({
          success: true,
          message: 'Registration successful',
          data: {
            accessToken: 'live_cloud_jwt_' + Buffer.from(newUser.email).toString('base64'),
            refreshToken: 'live_cloud_refresh_' + Date.now(),
            tokenType: 'Bearer',
            expiresIn: 86400000,
            user: newUser,
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 2. USERS
    if (resource === 'users' && sub === 'me') {
      const demo = users.get('demo@example.com')!;
      if (req.method === 'PUT') {
        const updated = { ...demo, ...(req.body || {}) };
        users.set('demo@example.com', updated);
        return res.status(200).json({
          success: true,
          message: 'Profile updated',
          data: updated,
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Profile retrieved',
        data: demo,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. CATEGORIES
    if (resource === 'categories') {
      return res.status(200).json(CATEGORIES_DATA);
    }

    // 4. PRODUCTS
    if (resource === 'products') {
      const allProducts: any[] = (PRODUCTS_DATA as any).data?.content || [];
      if (sub && req.method === 'GET') {
        const found = allProducts.find(p => p.id === sub || p.sku === sub) || allProducts[0];
        return res.status(200).json({
          success: true,
          message: 'Product retrieved',
          data: found,
          timestamp: new Date().toISOString(),
        });
      }

      const categoryId = req.query.categoryId as string;
      const search = req.query.search as string;
      const sort = req.query.sort as string;
      const page = parseInt((req.query.page as string) || '0', 10);
      const size = parseInt((req.query.size as string) || '20', 10);

      let filtered = [...allProducts];
      if (categoryId) {
        filtered = filtered.filter(p => p.categoryId === categoryId);
      }
      if (search) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      if (sort) {
        if (sort === 'price,asc') filtered.sort((a, b) => a.price - b.price);
        else if (sort === 'price,desc') filtered.sort((a, b) => b.price - a.price);
        else if (sort === 'rating,desc') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sort.includes('createdAt')) filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      }

      const start = page * size;
      const paginated = filtered.slice(start, start + size);

      return res.status(200).json({
        success: true,
        message: 'Loaded products',
        data: {
          content: paginated,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size) || 1,
          size,
          number: page,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 5. CART
    if (resource === 'cart') {
      const userId = (req.headers['x-user-id'] as string) || 'default-user';
      let items = cartStore.get(userId) || [];

      if (req.method === 'GET') {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return res.status(200).json({
          success: true,
          message: 'Cart retrieved',
          data: {
            userId,
            items,
            totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
            subtotalAmount: subtotal,
            updatedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (req.method === 'POST') {
        const newItem = req.body;
        const existingIdx = items.findIndex(i => i.productId === newItem.productId);
        if (existingIdx !== -1) {
          items[existingIdx].quantity += (newItem.quantity || 1);
          items[existingIdx].subtotal = items[existingIdx].price * items[existingIdx].quantity;
        } else {
          items.push({
            ...newItem,
            subtotal: (newItem.price || 0) * (newItem.quantity || 1),
          });
        }
        cartStore.set(userId, items);
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return res.status(200).json({
          success: true,
          message: 'Item added',
          data: {
            userId,
            items,
            totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
            subtotalAmount: subtotal,
            updatedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (req.method === 'DELETE') {
        cartStore.set(userId, []);
        return res.status(200).json({
          success: true,
          message: 'Cart cleared',
          data: {
            userId,
            items: [],
            totalQuantity: 0,
            subtotalAmount: 0,
            updatedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    // 6. CHECKOUT
    if (resource === 'checkout' && req.method === 'POST') {
      const { shippingAddress, items } = req.body || {};
      const orderId = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const subtotal = (items || []).reduce((sum: number, it: any) => sum + (it.unitPrice * it.quantity), 0);

      const newOrder = {
        id: orderId,
        orderNumber: orderId,
        userId: (req.headers['x-user-id'] as string) || '15f193fa-2e9c-4a39-ac32-ba80be59d95f',
        status: 'CONFIRMED',
        subtotal,
        discount: 0,
        tax: 0,
        shippingFee: 0,
        totalAmount: subtotal,
        currency: 'USD',
        shippingAddress: shippingAddress || '742 Evergreen Terrace, Springfield, OR',
        items: (items || []).map((it: any, idx: number) => ({
          id: 'item-' + idx,
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          price: it.unitPrice,
          quantity: it.quantity,
          subtotal: it.unitPrice * it.quantity,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      orders.unshift(newOrder);

      return res.status(200).json({
        success: true,
        message: 'Order created successfully',
        data: {
          id: orderId,
          orderNumber: orderId,
          status: 'CONFIRMED',
          totalAmount: subtotal,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // 7. ORDERS
    if (resource === 'orders') {
      if (parts[2] === 'timeline') {
        return res.status(200).json({
          success: true,
          message: 'Timeline retrieved',
          data: {
            orderId: parts[1],
            orderNumber: parts[1],
            orderStatus: 'CONFIRMED',
            sagaStatus: 'COMPLETED',
            currentStep: 'ORDER_CONFIRMED',
            timeline: [
              { eventType: 'ORDER_CREATED', title: 'Order Created', description: 'Order payload accepted', timestamp: new Date(Date.now() - 4000).toISOString(), status: 'COMPLETED' },
              { eventType: 'INVENTORY_RESERVED', title: 'Inventory Reserved', description: 'Zero-overselling lock acquired', timestamp: new Date(Date.now() - 3000).toISOString(), status: 'COMPLETED' },
              { eventType: 'PAYMENT_COMPLETED', title: 'Payment Completed', description: 'Payment settled', timestamp: new Date(Date.now() - 1500).toISOString(), status: 'COMPLETED' },
              { eventType: 'ORDER_CONFIRMED', title: 'Order Confirmed', description: 'Order confirmed and ready to pack', timestamp: new Date().toISOString(), status: 'COMPLETED' },
            ]
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (sub && sub !== 'all') {
        const found = orders.find(o => o.id === sub || o.orderNumber === sub);
        if (found) {
          return res.status(200).json({
            success: true,
            message: 'Order retrieved',
            data: found,
            timestamp: new Date().toISOString(),
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Orders retrieved',
        data: {
          content: orders,
          totalElements: orders.length,
          totalPages: 1,
          size: 20,
          number: 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Default 404 for unknown endpoints
    return res.status(404).json({
      success: false,
      message: `Endpoint /api/${pathStr} not found`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
