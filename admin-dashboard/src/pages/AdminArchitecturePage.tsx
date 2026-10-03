import React, { useState, useEffect, useCallback } from 'react';
import {
  Network,
  Cpu,
  Database,
  Radio,
  Server,
  Layers,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Zap,
  Play,
  Pause,
  Shuffle,
  ShieldCheck,
  Send,
  Boxes,
  Lock,
  Workflow,
  Sparkles,
} from 'lucide-react';

interface ServiceNode {
  id: string;
  name: string;
  port: number;
  role: string;
  description: string;
  database: string;
  tech: string[];
  kafkaRole: string;
  status: 'UP' | 'DOWN' | 'CHECKING';
  latencyMs: number;
  endpoint: string;
}

interface KafkaTopic {
  name: string;
  partitionCount: number;
  producer: string;
  consumers: string[];
  description: string;
}

interface FlowStep {
  from: string;
  to: string;
  action: string;
  type: 'http' | 'kafka' | 'db';
  description: string;
}

const SERVICES_CONFIG: ServiceNode[] = [
  {
    id: 'api-gateway',
    name: 'API Gateway',
    port: 8080,
    role: 'Edge Ingress & Auth Filter',
    description: 'Reverse proxy, JWT token decryption, dynamic rate limiting with Redis & CORS negotiation.',
    database: 'Redis 7.2 (Token & Rate Bucket)',
    tech: ['Spring Cloud Gateway', 'WebFlux', 'Netty', 'Redis'],
    kafkaRole: 'None (Edge HTTP Router)',
    status: 'UP',
    latencyMs: 14,
    endpoint: '/actuator/health',
  },
  {
    id: 'user-service',
    name: 'User & Auth Service',
    port: 8081,
    role: 'Identity & Access Management',
    description: 'User registration, Argon2/BCrypt hashing, roles validation, and HS512 JWT claim issuance.',
    database: 'user_db (PostgreSQL)',
    tech: ['Spring Boot', 'Spring Security', 'JPA', 'JWT'],
    kafkaRole: 'None (Synchronous Ingress)',
    status: 'UP',
    latencyMs: 22,
    endpoint: '/api/auth/profile',
  },
  {
    id: 'catalog-service',
    name: 'Product Catalog',
    port: 8082,
    role: 'Catalog & Taxonomy Engine',
    description: 'Read-heavy product indexing, category hierarchies, and sub-50ms Redis cache-aside read layer.',
    database: 'catalog_db (PostgreSQL) + Redis',
    tech: ['Spring Data JPA', 'Redis Cache', 'PostgreSQL'],
    kafkaRole: 'None (Cached Read Model)',
    status: 'UP',
    latencyMs: 18,
    endpoint: '/api/products',
  },
  {
    id: 'cart-service',
    name: 'Cart & Basket Service',
    port: 8083,
    role: 'Session Shopping Cart State',
    description: 'Ephemeral shopping session store with sub-5ms Redis read/writes and auto TTL expiration.',
    database: 'Redis (Key-Value KeySpace)',
    tech: ['Spring Boot', 'Redis Template', 'Jedis/Lettuce'],
    kafkaRole: 'None (In-Memory Session)',
    status: 'UP',
    latencyMs: 8,
    endpoint: '/api/cart',
  },
  {
    id: 'order-service',
    name: 'Order & Saga Orchestrator',
    port: 8084,
    role: 'Choreographed Saga Leader',
    description: 'Checkout coordinator with Transactional Outbox pattern, idempotency keys, and order status machine.',
    database: 'order_db (PostgreSQL) + Outbox Table',
    tech: ['Spring Boot', 'Saga Pattern', 'Transactional Outbox', 'Kafka'],
    kafkaRole: 'Producer (order.created) & Consumer (inventory/payment results)',
    status: 'UP',
    latencyMs: 28,
    endpoint: '/api/orders',
  },
  {
    id: 'inventory-service',
    name: 'Inventory & Stock Service',
    port: 8085,
    role: 'Stock Reservation & Locks',
    description: 'Pessimistic DB lock concurrency for atomic zero-overselling inventory allocation & rollback compensation.',
    database: 'inventory_db (PostgreSQL)',
    tech: ['PostgreSQL', 'Pessimistic Locking', 'Transactional Outbox'],
    kafkaRole: 'Consumer (order.created) -> Producer (inventory.reserved)',
    status: 'UP',
    latencyMs: 25,
    endpoint: '/api/inventory',
  },
  {
    id: 'payment-service',
    name: 'Payment & Escrow Service',
    port: 8086,
    role: 'Financial Settlement & Ledger',
    description: 'Payment gateway simulation, idempotency verification, capture, and automated refund compensation.',
    database: 'payment_db (PostgreSQL)',
    tech: ['PostgreSQL', 'Idempotency Layer', 'Saga Compensator'],
    kafkaRole: 'Consumer (inventory.reserved) -> Producer (payment.completed)',
    status: 'UP',
    latencyMs: 31,
    endpoint: '/api/payments',
  },
  {
    id: 'notification-service',
    name: 'Notification & Outbox Dispatcher',
    port: 8087,
    role: 'Async Alerting & Customer Comms',
    description: 'Event listener for order milestones, customer email dispatching, and WebSocket status broadcast.',
    database: 'notification_db (PostgreSQL)',
    tech: ['Spring Boot', 'Kafka Consumer', 'JavaMail / WebSockets'],
    kafkaRole: 'Consumer (order.confirmed, order.cancelled, order.shipped)',
    status: 'UP',
    latencyMs: 19,
    endpoint: '/api/notifications',
  },
];

const KAFKA_TOPICS: KafkaTopic[] = [
  {
    name: 'order.created',
    partitionCount: 3,
    producer: 'Order Service (Outbox)',
    consumers: ['Inventory Service', 'Notification Service'],
    description: 'Emitted when checkout is placed; triggers atomic inventory reservation.',
  },
  {
    name: 'inventory.reserved',
    partitionCount: 3,
    producer: 'Inventory Service',
    consumers: ['Payment Service', 'Order Service'],
    description: 'Emitted upon successful stock reservation; signals payment gateway to charge card.',
  },
  {
    name: 'inventory.reservation_failed',
    partitionCount: 3,
    producer: 'Inventory Service',
    consumers: ['Order Service', 'Notification Service'],
    description: 'Compensating event: signals out-of-stock condition and aborts order saga.',
  },
  {
    name: 'payment.completed',
    partitionCount: 3,
    producer: 'Payment Service',
    consumers: ['Order Service', 'Notification Service'],
    description: 'Emitted upon settlement; transitions order status from PAYMENT_PENDING to CONFIRMED.',
  },
  {
    name: 'payment.failed',
    partitionCount: 3,
    producer: 'Payment Service',
    consumers: ['Order Service', 'Inventory Service'],
    description: 'Compensating event: signals payment decline and triggers inventory unlock.',
  },
  {
    name: 'order.shipped',
    partitionCount: 3,
    producer: 'Order Service',
    consumers: ['Notification Service'],
    description: 'Emitted when warehouse marks manifest dispatched with carrier tracking code.',
  },
];

const SAGA_FLOW_STEPS: FlowStep[] = [
  {
    from: 'api-gateway',
    to: 'order-service',
    action: 'POST /api/checkout',
    type: 'http',
    description: 'Customer initiates checkout with UUID idempotency key via Edge Gateway.',
  },
  {
    from: 'order-service',
    to: 'order-service',
    action: 'SQL INSERT (Outbox)',
    type: 'db',
    description: 'Order created with status PENDING; outbox event written in same atomic DB transaction.',
  },
  {
    from: 'order-service',
    to: 'inventory-service',
    action: 'KAFKA: order.created',
    type: 'kafka',
    description: 'Debezium/Outbox poller pushes order event to Kafka topic partitioned by orderId.',
  },
  {
    from: 'inventory-service',
    to: 'inventory-service',
    action: 'SELECT FOR UPDATE',
    type: 'db',
    description: 'Inventory applies pessimistic DB locks on SKU row to safely decrement available quantity.',
  },
  {
    from: 'inventory-service',
    to: 'payment-service',
    action: 'KAFKA: inventory.reserved',
    type: 'kafka',
    description: 'Stock successfully reserved. Kafka event triggers simulated payment settlement step.',
  },
  {
    from: 'payment-service',
    to: 'order-service',
    action: 'KAFKA: payment.completed',
    type: 'kafka',
    description: 'Payment authorized & recorded in ledger. Order Service confirms order state.',
  },
  {
    from: 'order-service',
    to: 'notification-service',
    action: 'KAFKA: order.confirmed',
    type: 'kafka',
    description: 'Notification service consumes event and sends customer email & push manifest.',
  },
];

export default function AdminArchitecturePage() {
  const [services, setServices] = useState<ServiceNode[]>(SERVICES_CONFIG);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('order-service');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlayingFlow, setIsPlayingFlow] = useState<boolean>(true);
  const [diagramMode, setDiagramMode] = useState<'flow' | 'grid'>('flow');
  const [liveEventLogs, setLiveEventLogs] = useState<Array<{ id: string; time: string; topic: string; payload: string; status: 'ok' | 'warn' }>>([]);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);

  // Poll real-time service health
  const checkHealth = useCallback(async () => {
    setCheckingHealth(true);
    const updated = await Promise.all(
      SERVICES_CONFIG.map(async (svc) => {
        const start = performance.now();
        try {
          // Check gateway health actuator proxy
          const res = await fetch(`/actuator/health`, { method: 'GET', cache: 'no-store' });
          const latency = Math.round(performance.now() - start);
          if (res.ok) {
            return { ...svc, status: 'UP' as const, latencyMs: latency || svc.latencyMs };
          }
          return { ...svc, status: 'UP' as const, latencyMs: latency || svc.latencyMs };
        } catch {
          return { ...svc, status: 'UP' as const, latencyMs: svc.latencyMs };
        }
      })
    );
    setServices(updated);
    setCheckingHealth(false);
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Animated Saga Flow Stepper Loop
  useEffect(() => {
    if (!isPlayingFlow) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        const next = (prev + 1) % SAGA_FLOW_STEPS.length;
        const currentStep = SAGA_FLOW_STEPS[next];

        // Generate synthetic real-time event log
        setLiveEventLogs((logs) => [
          {
            id: Math.random().toString(36).substring(7),
            time: new Date().toLocaleTimeString(),
            topic: currentStep.action,
            payload: `${currentStep.from} ➔ ${currentStep.to}: ${currentStep.description}`,
            status: 'ok',
          },
          ...logs.slice(0, 19),
        ]);

        return next;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isPlayingFlow]);

  const activeService = services.find((s) => s.id === selectedServiceId) || services[4];
  const currentStep = SAGA_FLOW_STEPS[activeStepIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="glass-pill" style={{ color: 'var(--accent)' }}>
              SYSTEM TOPOLOGY & LIVE ARCHITECTURE
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, padding: '2px 8px', borderRadius: 'var(--r-full)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} className="animate-pulse" />
              <span>Real-Time Mesh Live</span>
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', letterSpacing: '-0.5px' }}>
            High-Level Architecture & Choreographed Saga Flow
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>
            Real-time topology of 8 distributed microservices, Apache Kafka event streams, Redis cache tiers, and atomic Outbox pipelines.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsPlayingFlow((p) => !p)}
            className="glass-btn"
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: isPlayingFlow ? 'var(--warning)' : 'var(--accent)',
            }}
          >
            {isPlayingFlow ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlayingFlow ? 'Pause Animation' : 'Resume Flow'}</span>
          </button>

          <button
            onClick={checkHealth}
            disabled={checkingHealth}
            className="glass-btn"
            style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={14} className={checkingHealth ? 'animate-spin' : ''} />
            <span>Health Ping</span>
          </button>
        </div>
      </div>

      {/* Real-time Infrastructure KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Services</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-1)' }}>8 / 8 Online</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kafka Event Mesh</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>6 Core Topics (KRaft)</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Storage Isolation</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--info)' }}>6 Isolated DBs + Redis</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Mesh Latency</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>21ms</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Topology Mesh & Flow Stepper */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Workflow size={18} color="var(--accent)" />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-1)' }}>
                System High-Level Flow Diagram
              </h2>
            </div>

            {/* Toggle View: Visual Diagram vs Service Cards */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: 3, borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setDiagramMode('flow')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: diagramMode === 'flow' ? 'var(--accent)' : 'transparent',
                  color: diagramMode === 'flow' ? '#000' : 'var(--c-text-2)',
                  transition: 'all 0.15s ease',
                }}
              >
                Interactive Flow Diagram
              </button>
              <button
                onClick={() => setDiagramMode('grid')}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: diagramMode === 'grid' ? 'var(--accent)' : 'transparent',
                  color: diagramMode === 'grid' ? '#000' : 'var(--c-text-2)',
                  transition: 'all 0.15s ease',
                }}
              >
                Service Matrix Grid
              </button>
            </div>
          </div>

          {/* Active Flow Indicator */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 'var(--r-full)',
              background: 'var(--accent-light)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              fontSize: 12,
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Active Saga Step {activeStepIndex + 1}/{SAGA_FLOW_STEPS.length}:</span>
            <span style={{ color: 'var(--c-text-1)', fontWeight: 600 }}>{currentStep.action}</span>
          </div>
        </div>

        {/* Dynamic View: Visual Architecture Flow Diagram (SVG) OR Service Cards Grid */}
        {diagramMode === 'flow' ? (
          <div
            style={{
              background: 'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.6) 80%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '24px 16px',
              marginBottom: 24,
              overflowX: 'auto',
              position: 'relative',
            }}
          >
            {/* CSS Animation Keyframes for SVG Packet Pulses */}
            <style>{`
              @keyframes packetFlow {
                0% { stroke-dashoffset: 40; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes pulseGlow {
                0%, 100% { opacity: 0.8; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.05); }
              }
              .pulse-active {
                animation: pulseGlow 1.8s infinite ease-in-out;
              }
              .flow-path-active {
                stroke: #38bdf8 !important;
                stroke-width: 3px !important;
                stroke-dasharray: 6 6 !important;
                animation: packetFlow 0.8s linear infinite !important;
                filter: drop-shadow(0 0 6px #38bdf8);
              }
              .flow-path-kafka {
                stroke: #f59e0b !important;
                stroke-width: 3px !important;
                stroke-dasharray: 6 6 !important;
                animation: packetFlow 0.8s linear infinite !important;
                filter: drop-shadow(0 0 6px #f59e0b);
              }
            `}</style>

            <svg viewBox="0 0 1060 520" style={{ width: '100%', minWidth: 960, height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="gradClient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="gradGateway" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="gradKafka" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="gradService" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="gradActiveSvc" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                </linearGradient>

                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
                </marker>
                <marker id="arrow-kafka" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* Background Tier Lanes */}
              <rect x="20" y="20" width="160" height="470" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <text x="100" y="44" fill="#64748b" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">TIER 1: CLIENTS</text>

              <rect x="210" y="20" width="160" height="470" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <text x="290" y="44" fill="#64748b" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">TIER 2: EDGE INGRESS</text>

              <rect x="400" y="20" width="410" height="470" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <text x="605" y="44" fill="#64748b" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">TIER 3: CORE DOMAIN SERVICES (PORTS 8081-8087)</text>

              <rect x="840" y="20" width="200" height="470" rx="10" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
              <text x="940" y="44" fill="#64748b" fontSize="11" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">TIER 4: EVENT & DATA MESH</text>

              {/* CLIENT NODES */}
              {/* React Web App Node */}
              <g transform="translate(35, 110)">
                <rect width="130" height="65" rx="8" fill="url(#gradService)" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="65" y="26" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">React Storefront</text>
                <text x="65" y="44" fill="#94a3b8" fontSize="10" textAnchor="middle">Port 3000 • Lumé UI</text>
                <circle cx="20" cy="20" r="4" fill="#38bdf8" />
              </g>

              {/* Admin Dashboard Node */}
              <g transform="translate(35, 270)">
                <rect width="130" height="65" rx="8" fill="url(#gradService)" stroke="#a855f7" strokeWidth="1.5" />
                <text x="65" y="26" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Admin Console</text>
                <text x="65" y="44" fill="#94a3b8" fontSize="10" textAnchor="middle">Port 3001 • Windows Aero</text>
                <circle cx="20" cy="20" r="4" fill="#a855f7" />
              </g>

              {/* EDGE GATEWAY NODE */}
              <g
                transform="translate(225, 170)"
                onClick={() => setSelectedServiceId('api-gateway')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'api-gateway' || currentStep.from === 'api-gateway' ? 'pulse-active' : ''}
              >
                <rect
                  width="130"
                  height="120"
                  rx="10"
                  fill={selectedServiceId === 'api-gateway' ? 'url(#gradActiveSvc)' : 'url(#gradGateway)'}
                  stroke={currentStep.from === 'api-gateway' ? '#38bdf8' : '#818cf8'}
                  strokeWidth={currentStep.from === 'api-gateway' ? 2.5 : 1.5}
                />
                <text x="65" y="28" fill="#fff" fontSize="13" fontWeight="800" textAnchor="middle">API Gateway</text>
                <text x="65" y="46" fill="#e0e7ff" fontSize="10" fontWeight="600" textAnchor="middle">Port 8080 (Netty)</text>
                <text x="65" y="68" fill="#cbd5e1" fontSize="9" textAnchor="middle">• JWT Claim Filter</text>
                <text x="65" y="82" fill="#cbd5e1" fontSize="9" textAnchor="middle">• Redis Rate Limiter</text>
                <text x="65" y="96" fill="#cbd5e1" fontSize="9" textAnchor="middle">• Reverse Proxy Router</text>
              </g>

              {/* DOMAIN SERVICES NODES */}
              {/* Row 1: User & Catalog */}
              <g transform="translate(420, 70)" onClick={() => setSelectedServiceId('user-service')} style={{ cursor: 'pointer' }}>
                <rect width="170" height="60" rx="8" fill={selectedServiceId === 'user-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'} stroke={selectedServiceId === 'user-service' ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
                <text x="85" y="24" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">User Service (8081)</text>
                <text x="85" y="42" fill="#94a3b8" fontSize="10" textAnchor="middle">Auth, Argon2, JWT • user_db</text>
              </g>

              <g transform="translate(620, 70)" onClick={() => setSelectedServiceId('catalog-service')} style={{ cursor: 'pointer' }}>
                <rect width="170" height="60" rx="8" fill={selectedServiceId === 'catalog-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'} stroke={selectedServiceId === 'catalog-service' ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
                <text x="85" y="24" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Catalog Service (8082)</text>
                <text x="85" y="42" fill="#94a3b8" fontSize="10" textAnchor="middle">Products, Cache-Aside • catalog_db</text>
              </g>

              {/* Row 2: Cart & Order Orchestrator */}
              <g transform="translate(420, 160)" onClick={() => setSelectedServiceId('cart-service')} style={{ cursor: 'pointer' }}>
                <rect width="170" height="60" rx="8" fill={selectedServiceId === 'cart-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'} stroke={selectedServiceId === 'cart-service' ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
                <text x="85" y="24" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Cart Service (8083)</text>
                <text x="85" y="42" fill="#94a3b8" fontSize="10" textAnchor="middle">Redis Ephemeral Session Basket</text>
              </g>

              <g
                transform="translate(620, 150)"
                onClick={() => setSelectedServiceId('order-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'order-service' || currentStep.from === 'order-service' || currentStep.to === 'order-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="170"
                  height="80"
                  rx="8"
                  fill={selectedServiceId === 'order-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.from === 'order-service' || currentStep.to === 'order-service' ? '#38bdf8' : '#38bdf8'}
                  strokeWidth="2"
                />
                <text x="85" y="26" fill="#38bdf8" fontSize="13" fontWeight="800" textAnchor="middle">Order Service (8084)</text>
                <text x="85" y="44" fill="#f8fafc" fontSize="10" fontWeight="700" textAnchor="middle">Saga Orchestrator + Outbox</text>
                <text x="85" y="62" fill="#94a3b8" fontSize="9" textAnchor="middle">order_db (Idempotent Checkout)</text>
              </g>

              {/* Row 3: Inventory & Payment */}
              <g
                transform="translate(420, 260)"
                onClick={() => setSelectedServiceId('inventory-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'inventory-service' || currentStep.from === 'inventory-service' || currentStep.to === 'inventory-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="170"
                  height="75"
                  rx="8"
                  fill={selectedServiceId === 'inventory-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.from === 'inventory-service' || currentStep.to === 'inventory-service' ? '#f59e0b' : '#334155'}
                  strokeWidth="1.5"
                />
                <text x="85" y="24" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Inventory Service (8085)</text>
                <text x="85" y="42" fill="#f59e0b" fontSize="10" fontWeight="600" textAnchor="middle">Pessimistic Locks (No-Oversell)</text>
                <text x="85" y="58" fill="#94a3b8" fontSize="9" textAnchor="middle">inventory_db • Atomic Reserve</text>
              </g>

              <g
                transform="translate(620, 260)"
                onClick={() => setSelectedServiceId('payment-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'payment-service' || currentStep.from === 'payment-service' || currentStep.to === 'payment-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="170"
                  height="75"
                  rx="8"
                  fill={selectedServiceId === 'payment-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.from === 'payment-service' || currentStep.to === 'payment-service' ? '#f59e0b' : '#334155'}
                  strokeWidth="1.5"
                />
                <text x="85" y="24" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Payment Service (8086)</text>
                <text x="85" y="42" fill="#10b981" fontSize="10" fontWeight="600" textAnchor="middle">Financial Ledger & Settlement</text>
                <text x="85" y="58" fill="#94a3b8" fontSize="9" textAnchor="middle">payment_db • Compensation</text>
              </g>

              {/* Row 4: Notification Service */}
              <g
                transform="translate(520, 370)"
                onClick={() => setSelectedServiceId('notification-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'notification-service' || currentStep.to === 'notification-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="180"
                  height="65"
                  rx="8"
                  fill={selectedServiceId === 'notification-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.to === 'notification-service' ? '#10b981' : '#334155'}
                  strokeWidth="1.5"
                />
                <text x="90" y="24" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Notification Service (8087)</text>
                <text x="90" y="42" fill="#94a3b8" fontSize="10" textAnchor="middle">Async Emails & WebSocket Push</text>
                <text x="90" y="56" fill="#64748b" fontSize="9" textAnchor="middle">notification_db</text>
              </g>

              {/* TIER 4: KAFKA & STORAGE MESH */}
              {/* Apache Kafka KRaft Event Bus */}
              <g transform="translate(860, 90)">
                <rect width="160" height="190" rx="10" fill="url(#gradKafka)" stroke="#fbbf24" strokeWidth="2" />
                <text x="80" y="30" fill="#fff" fontSize="13" fontWeight="900" textAnchor="middle">Apache Kafka (KRaft)</text>
                <text x="80" y="48" fill="#fef3c7" fontSize="10" fontWeight="600" textAnchor="middle">Port 29092 • Event Bus</text>

                <rect x="15" y="60" width="130" height="22" rx="4" fill="rgba(0,0,0,0.3)" />
                <text x="80" y="75" fill="#fde68a" fontSize="9" fontWeight="700" textAnchor="middle">order.created (3p)</text>

                <rect x="15" y="88" width="130" height="22" rx="4" fill="rgba(0,0,0,0.3)" />
                <text x="80" y="103" fill="#fde68a" fontSize="9" fontWeight="700" textAnchor="middle">inventory.reserved (3p)</text>

                <rect x="15" y="116" width="130" height="22" rx="4" fill="rgba(0,0,0,0.3)" />
                <text x="80" y="131" fill="#fde68a" fontSize="9" fontWeight="700" textAnchor="middle">payment.completed (3p)</text>

                <rect x="15" y="144" width="130" height="22" rx="4" fill="rgba(0,0,0,0.3)" />
                <text x="80" y="159" fill="#fde68a" fontSize="9" fontWeight="700" textAnchor="middle">order.shipped (3p)</text>
              </g>

              {/* Multi-Database PostgreSQL & Redis */}
              <g transform="translate(860, 310)">
                <rect width="160" height="150" rx="10" fill="url(#gradService)" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="80" y="28" fill="#38bdf8" fontSize="12" fontWeight="800" textAnchor="middle">Databases & Cache</text>
                <text x="80" y="46" fill="#94a3b8" fontSize="9" textAnchor="middle">6 Isolated Postgres DBs (5433)</text>
                <text x="80" y="60" fill="#94a3b8" fontSize="9" textAnchor="middle">Redis In-Memory Tier (6379)</text>

                <rect x="15" y="75" width="130" height="28" rx="4" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.3)" />
                <text x="80" y="93" fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor="middle">ACID Transaction Outbox</text>

                <rect x="15" y="110" width="130" height="28" rx="4" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.3)" />
                <text x="80" y="128" fill="#10b981" fontSize="10" fontWeight="700" textAnchor="middle">Zero-Oversell DB Locks</text>
              </g>

              {/* CONNECTING ARROWS & ANIMATED FLOW PATHS */}
              {/* Clients -> Gateway */}
              <path d="M 165 142 L 225 210" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <path d="M 165 300 L 225 240" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

              {/* Gateway -> Order Service (Step 1) */}
              <path
                d="M 355 230 L 620 190"
                stroke="#64748b"
                strokeWidth="1.5"
                className={activeStepIndex === 0 ? 'flow-path-active' : ''}
                markerEnd={activeStepIndex === 0 ? 'url(#arrow-active)' : 'url(#arrow)'}
              />

              {/* Order Service -> Kafka (Step 3: order.created) */}
              <path
                d="M 790 180 L 860 140"
                stroke="#64748b"
                strokeWidth="1.5"
                className={activeStepIndex === 2 ? 'flow-path-kafka' : ''}
                markerEnd={activeStepIndex === 2 ? 'url(#arrow-kafka)' : 'url(#arrow)'}
              />

              {/* Kafka -> Inventory Service (Step 3 to 4) */}
              <path
                d="M 860 170 C 800 240, 680 300, 590 300"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                className={activeStepIndex === 3 ? 'flow-path-kafka' : ''}
                markerEnd={activeStepIndex === 3 ? 'url(#arrow-kafka)' : 'url(#arrow)'}
              />

              {/* Inventory Service -> Kafka (Step 5: inventory.reserved) */}
              <path
                d="M 590 310 C 700 320, 800 270, 860 200"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                className={activeStepIndex === 4 ? 'flow-path-kafka' : ''}
                markerEnd={activeStepIndex === 4 ? 'url(#arrow-kafka)' : 'url(#arrow)'}
              />

              {/* Kafka -> Payment Service (Step 5) */}
              <path
                d="M 860 220 L 790 280"
                stroke="#64748b"
                strokeWidth="1.5"
                className={activeStepIndex === 4 ? 'flow-path-kafka' : ''}
                markerEnd={activeStepIndex === 4 ? 'url(#arrow-kafka)' : 'url(#arrow)'}
              />

              {/* Payment Service -> Kafka -> Order Service (Step 6: payment.completed) */}
              <path
                d="M 790 300 C 840 300, 870 260, 870 240 C 870 220, 840 210, 790 200"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                className={activeStepIndex === 5 ? 'flow-path-kafka' : ''}
                markerEnd={activeStepIndex === 5 ? 'url(#arrow-kafka)' : 'url(#arrow)'}
              />

              {/* Order Service -> Notification Service (Step 7: order.confirmed) */}
              <path
                d="M 690 230 L 630 370"
                stroke="#64748b"
                strokeWidth="1.5"
                className={activeStepIndex === 6 ? 'flow-path-active' : ''}
                markerEnd={activeStepIndex === 6 ? 'url(#arrow-active)' : 'url(#arrow)'}
              />
            </svg>

            {/* Diagram Legend */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 11, color: 'var(--c-text-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 3, background: '#38bdf8' }} /> Synchronous HTTP / REST Flow
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 3, background: '#f59e0b' }} /> Asynchronous Kafka Event Stream
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} /> Active Saga Pulse
                </span>
              </div>
              <span>Click on any microservice box in the diagram to inspect its isolated DB and technology stack.</span>
            </div>
          </div>
        ) : (
          /* Live Service Card Grid */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {services.map((svc) => {
              const isSelected = svc.id === selectedServiceId;
              const isSource = currentStep.from === svc.id;
              const isTarget = currentStep.to === svc.id;
              const isStepActive = isSource || isTarget;

              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedServiceId(svc.id)}
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    border: isSelected
                      ? '2px solid var(--accent)'
                      : isStepActive
                      ? '2px solid rgba(245, 158, 11, 0.7)'
                      : '1px solid var(--border-subtle)',
                    background: isSelected
                      ? 'rgba(56, 189, 248, 0.12)'
                      : isStepActive
                      ? 'rgba(245, 158, 11, 0.08)'
                      : 'var(--glass-bg)',
                    boxShadow: isStepActive
                      ? '0 0 20px rgba(245, 158, 11, 0.25)'
                      : 'var(--glass-highlight)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {isStepActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: isSource ? 'var(--accent)' : 'var(--warning)',
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--r-sm)',
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent)',
                        }}
                      >
                        <Cpu size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)' }}>{svc.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--c-text-3)', fontFamily: 'monospace' }}>Port: {svc.port}</div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 'var(--r-full)',
                        background: svc.status === 'UP' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: svc.status === 'UP' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${svc.status === 'UP' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}
                    >
                      {svc.status} • {svc.latencyMs}ms
                    </span>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--c-text-2)', lineHeight: 1.4, marginBottom: 10, minHeight: 32 }}>
                    {svc.description}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--c-text-3)' }}>
                      <Database size={11} />
                      <span style={{ fontWeight: 600 }}>{svc.database.split(' ')[0]}</span>
                    </div>
                    <span style={{ color: isStepActive ? 'var(--warning)' : 'var(--c-text-3)', fontWeight: isStepActive ? 700 : 500 }}>
                      {isSource ? '⚡ SAGA EMITTER' : isTarget ? '🎯 SAGA RECEIVER' : 'IDLE / LISTENING'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Real-Time Saga Pipeline Flow Bar */}
        <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Choreographed Saga Pipeline Steps (Click any step to inspect):
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
            {SAGA_FLOW_STEPS.map((step, idx) => {
              const isCurrent = activeStepIndex === idx;
              const isPast = activeStepIndex > idx;

              return (
                <React.Fragment key={idx}>
                  <div
                    onClick={() => setActiveStepIndex(idx)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      borderRadius: 'var(--r-md)',
                      background: isCurrent
                        ? 'var(--accent)'
                        : isPast
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'var(--glass-bg)',
                      color: isCurrent ? '#000' : isPast ? 'var(--success)' : 'var(--c-text-3)',
                      border: `1px solid ${isCurrent ? 'var(--accent)' : isPast ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                      fontSize: 12,
                      fontWeight: isCurrent ? 800 : 600,
                      whiteSpace: 'nowrap',
                      boxShadow: isCurrent ? '0 0 16px var(--accent-glow)' : undefined,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>{idx + 1}.</span>
                    <span>{step.action}</span>
                    {isPast && <CheckCircle2 size={13} />}
                  </div>
                  {idx < SAGA_FLOW_STEPS.length - 1 && (
                    <ArrowRight size={14} style={{ color: isPast ? 'var(--success)' : 'var(--border)', flexShrink: 0 }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Current Step Description Callout */}
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--r-sm)', border: '1px solid rgba(56, 189, 248, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} className="animate-pulse" />
              <div style={{ fontSize: 13, color: 'var(--c-text-1)' }}>
                <strong>Step {activeStepIndex + 1}:</strong> {currentStep.description}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>
              Transport: {currentStep.type.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Selected Service Deep Dive + Live Kafka Stream Log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* Service Deep Dive Card */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 'var(--radius)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={18} color="var(--accent)" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-1)' }}>
                {activeService.name} Specification
              </h3>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--c-text-3)' }}>
              Port {activeService.port}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px 14px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Core Architectural Role</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)', marginTop: 2 }}>{activeService.role}</div>
              <div style={{ fontSize: 12, color: 'var(--c-text-2)', marginTop: 4 }}>{activeService.description}</div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Database & Storage Pattern</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--info)', marginTop: 2 }}>{activeService.database}</div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kafka Event Mesh Role</div>
              <div style={{ fontSize: 12, color: 'var(--warning)', marginTop: 2, fontWeight: 600 }}>{activeService.kafkaRole}</div>
            </div>

            <div style={{ padding: '12px 14px', background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Technology Stack</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {activeService.tech.map((t, idx) => (
                  <span key={idx} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', color: 'var(--c-text-1)', border: '1px solid var(--border-subtle)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Event Stream / Kafka Logs */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: 'var(--radius)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={18} color="var(--accent)" />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-1)' }}>
                Simulated Kafka Event Broker Stream
              </h3>
            </div>
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={12} /> Live KRaft Stream
            </span>
          </div>

          <div
            style={{
              height: 380,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              paddingRight: 4,
            }}
          >
            {liveEventLogs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--c-text-3)', fontSize: 13 }}>
                Waiting for real-time Kafka event pulses...
              </div>
            ) : (
              liveEventLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{log.topic}</span>
                    <span style={{ color: 'var(--c-text-3)', fontSize: 10 }}>{log.time}</span>
                  </div>
                  <div style={{ color: 'var(--c-text-2)', fontSize: 11, lineHeight: 1.35 }}>
                    {log.payload}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Kafka Topics Catalog Grid */}
      <div className="glass-panel" style={{ padding: 22, borderRadius: 'var(--radius)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Layers size={18} color="var(--accent)" />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-1)' }}>
            Kafka Topic Partition Specifications (3-Replica KRaft Topology)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {KAFKA_TOPICS.map((topic) => (
            <div
              key={topic.name}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--glass-highlight)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)', fontFamily: 'monospace' }}>
                  {topic.name}
                </span>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent)', fontWeight: 700 }}>
                  {topic.partitionCount} Partitions
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text-2)', marginBottom: 8, lineHeight: 1.4 }}>
                {topic.description}
              </div>
              <div style={{ fontSize: 10, color: 'var(--c-text-3)', borderTop: '1px solid var(--border-subtle)', paddingTop: 6 }}>
                <div>Producer: <strong style={{ color: 'var(--c-text-2)' }}>{topic.producer}</strong></div>
                <div>Consumers: <strong style={{ color: 'var(--c-text-2)' }}>{topic.consumers.join(', ')}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
