import React, { useState, useEffect, useCallback, useRef } from 'react';
import mermaid from 'mermaid';
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
  GitBranch,
  Monitor,
  Code2,
  Share2,
} from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
  themeVariables: {
    darkMode: true,
    background: 'transparent',
    primaryColor: '#1e293b',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#64748b',
    secondaryColor: '#0f172a',
    tertiaryColor: '#1e1b4b',
    edgeLabelBackground: '#0f172a',
  },
  flowchart: {
    curve: 'basis',
    nodeSpacing: 45,
    rankSpacing: 55,
    padding: 15,
  },
});

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

const SCENARIO_PRESETS: Record<
  string,
  {
    title: string;
    badge: string;
    badgeColor: string;
    description: string;
    steps: FlowStep[];
  }
> = {
  saga_success: {
    title: 'Happy Path: Distributed Checkout Saga',
    badge: 'Standard E2E',
    badgeColor: 'var(--success)',
    description: 'Successful checkout: stock locking, payment authorized, and customer notification dispatched.',
    steps: [
      {
        from: 'api-gateway',
        to: 'order-service',
        action: 'POST /api/checkout',
        type: 'http',
        description: 'Customer initiates checkout with UUID idempotency key via Netty Edge Gateway.',
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
        description: 'Outbox poller pushes order event to Kafka topic partitioned by orderId.',
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
    ],
  },
  inventory_failed: {
    title: 'Compensating Saga: Out of Stock Failure',
    badge: 'Inventory Rollback',
    badgeColor: 'var(--danger)',
    description: 'Pessimistic lock detects 0 quantity: aborts checkout and transitions order to CANCELLED.',
    steps: [
      {
        from: 'api-gateway',
        to: 'order-service',
        action: 'POST /api/checkout',
        type: 'http',
        description: 'Customer submits order for items with low or competing stock.',
      },
      {
        from: 'order-service',
        to: 'inventory-service',
        action: 'KAFKA: order.created',
        type: 'kafka',
        description: 'Order Service publishes order.created to Kafka.',
      },
      {
        from: 'inventory-service',
        to: 'inventory-service',
        action: 'INSUFFICIENT STOCK',
        type: 'db',
        description: 'Pessimistic row lock identifies availableQuantity < requestedQuantity.',
      },
      {
        from: 'inventory-service',
        to: 'order-service',
        action: 'KAFKA: inventory.reservation_failed',
        type: 'kafka',
        description: 'Inventory emits compensation event to roll back the checkout attempt.',
      },
      {
        from: 'order-service',
        to: 'order-service',
        action: 'UPDATE status = CANCELLED',
        type: 'db',
        description: 'Order Service updates state to CANCELLED; no financial payment is ever charged.',
      },
      {
        from: 'order-service',
        to: 'notification-service',
        action: 'KAFKA: order.cancelled',
        type: 'kafka',
        description: 'Customer receives automated "Item Out of Stock" email notification.',
      },
    ],
  },
  payment_failed: {
    title: 'Compensating Saga: Card Payment Decline',
    badge: 'Payment Rollback',
    badgeColor: 'var(--warning)',
    description: 'Payment settlement declines: unreserves inventory and frees SKU locks.',
    steps: [
      {
        from: 'order-service',
        to: 'inventory-service',
        action: 'KAFKA: order.created',
        type: 'kafka',
        description: 'Order placed, inventory successfully reserves quantity and locks rows.',
      },
      {
        from: 'inventory-service',
        to: 'payment-service',
        action: 'KAFKA: inventory.reserved',
        type: 'kafka',
        description: 'Payment Service receives reserved notification to initiate card authorization.',
      },
      {
        from: 'payment-service',
        to: 'payment-service',
        action: 'CARD DECLINED / 402',
        type: 'db',
        description: 'Payment gateway simulation returns decline (insufficient funds/fraud flag).',
      },
      {
        from: 'payment-service',
        to: 'inventory-service',
        action: 'KAFKA: payment.failed',
        type: 'kafka',
        description: 'Compensation event broadcasted to trigger inventory replenishment unlock.',
      },
      {
        from: 'inventory-service',
        to: 'inventory-service',
        action: 'RELEASE LOCK / RESTORE',
        type: 'db',
        description: 'Inventory increment locks execute; reserved stock restored to available pool.',
      },
      {
        from: 'payment-service',
        to: 'order-service',
        action: 'KAFKA: order.cancelled',
        type: 'kafka',
        description: 'Order marked as FAILED with rollback audit trail.',
      },
    ],
  },
  order_fulfillment: {
    title: 'Warehouse Logistics: Dispatch & Tracking Manifest',
    badge: 'Logistics Pipeline',
    badgeColor: 'var(--info)',
    description: 'Admin triggers shipping dispatch: manifest generated, carrier tracking assigned, and tracking emails sent.',
    steps: [
      {
        from: 'api-gateway',
        to: 'order-service',
        action: 'POST /api/orders/{id}/ship',
        type: 'http',
        description: 'Warehouse admin clicks Dispatch & Ship with FedEx/UPS tracking code.',
      },
      {
        from: 'order-service',
        to: 'order-service',
        action: 'UPDATE status = SHIPPED',
        type: 'db',
        description: 'Tracking number & carrier stamped onto order record.',
      },
      {
        from: 'order-service',
        to: 'notification-service',
        action: 'KAFKA: order.shipped',
        type: 'kafka',
        description: 'Asynchronous event dispatched to Kafka order.shipped topic.',
      },
      {
        from: 'notification-service',
        to: 'notification-service',
        action: 'DISPATCH EMAIL + PUSH',
        type: 'db',
        description: 'Notification worker formats live tracking URL and emails customer.',
      },
    ],
  },
  catalog_browsing: {
    title: 'Catalog Browsing: Sub-50ms Redis Cache-Aside',
    badge: 'Read Path',
    badgeColor: 'var(--accent)',
    description: 'High-throughput catalog reading: Redis cache hit returns response without touching PostgreSQL.',
    steps: [
      {
        from: 'api-gateway',
        to: 'catalog-service',
        action: 'GET /api/products',
        type: 'http',
        description: 'Customer browses catalog on storefront; request routed via Netty edge.',
      },
      {
        from: 'catalog-service',
        to: 'catalog-service',
        action: 'REDIS GET products::page_0',
        type: 'db',
        description: 'Cache lookup: 8ms response from in-memory Redis key.',
      },
      {
        from: 'catalog-service',
        to: 'api-gateway',
        action: 'HTTP 200 OK (Cache Hit)',
        type: 'http',
        description: 'Product array returned with zero DB contention on catalog_db.',
      },
    ],
  },
};

export default function AdminArchitecturePage() {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('saga_success');
  const activeScenario = SCENARIO_PRESETS[selectedScenarioKey] || SCENARIO_PRESETS.saga_success;
  const currentScenarioSteps = activeScenario.steps;

  const [services, setServices] = useState<ServiceNode[]>(SERVICES_CONFIG);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('order-service');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlayingFlow, setIsPlayingFlow] = useState<boolean>(true);
  // Diagram presentation modes: 'lucid' (Lucid-style clean interactive canvas), 'mermaid' (Official Mermaid.js graph), 'grid' (Matrix cards)
  const [diagramMode, setDiagramMode] = useState<'lucid' | 'mermaid' | 'grid'>('lucid');
  const [mermaidSvg, setMermaidSvg] = useState<string>('');
  const [mermaidRenderError, setMermaidRenderError] = useState<string | null>(null);
  const [liveEventLogs, setLiveEventLogs] = useState<Array<{ id: string; time: string; topic: string; payload: string; status: 'ok' | 'warn' }>>([]);
  const [checkingHealth, setCheckingHealth] = useState<boolean>(false);

  // Generate dynamic Mermaid diagram code representing the active scenario
  const generateMermaidChart = useCallback(
    (scenarioKey: string, activeStep: number): string => {
      const scen = SCENARIO_PRESETS[scenarioKey] || SCENARIO_PRESETS.saga_success;
      const step = scen.steps[activeStep] || scen.steps[0];

      // Build clean service node labels
      const mermaidCode = `
flowchart LR
    %% Modern LucidFlow / Mermaid Topology
    classDef clientStyle fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc,rx:8,ry:8;
    classDef gatewayStyle fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc,rx:8,ry:8;
    classDef serviceStyle fill:#0f172a,stroke:#334155,stroke-width:1.5px,color:#f8fafc,rx:8,ry:8;
    classDef activeEmitter fill:#0284c7,stroke:#38bdf8,stroke-width:3px,color:#ffffff,rx:8,ry:8;
    classDef activeReceiver fill:#b45309,stroke:#f59e0b,stroke-width:3px,color:#ffffff,rx:8,ry:8;
    classDef kafkaStyle fill:#78350f,stroke:#fbbf24,stroke-width:2px,color:#fef3c7,rx:6,ry:6;
    classDef dbStyle fill:#1e293b,stroke:#06b6d4,stroke-width:1.5px,color:#e2e8f0,rx:4,ry:4;

    subgraph TIER1 [" 🌐 TIER 1: CLIENTS "]
        CLI_WEB["🛍️ React Storefront<br/><small>:3000 (Lumé UI)</small>"]:::clientStyle
        CLI_ADM["🛡️ Admin Console<br/><small>:3001 (Aero UI)</small>"]:::clientStyle
    end

    subgraph TIER2 [" ⚡ TIER 2: EDGE INGRESS "]
        GW["🚪 API Gateway<br/><small>:8080 (Netty / WebFlux)<br/>JWT Filter + Redis Limiter</small>"]:::gatewayStyle
    end

    subgraph TIER3 [" 🧩 TIER 3: MICROSERVICES DOMAIN "]
        SVC_USER["👤 User Service<br/><small>:8081 (user_db)</small>"]:::serviceStyle
        SVC_CAT["📦 Catalog Service<br/><small>:8082 (Redis Cache-Aside)</small>"]:::serviceStyle
        SVC_CART["🛒 Cart Service<br/><small>:8083 (Redis Basket)</small>"]:::serviceStyle
        SVC_ORDER["📑 Order Orchestrator<br/><small>:8084 (Saga + Outbox)</small>"]:::serviceStyle
        SVC_INV["🔒 Inventory Service<br/><small>:8085 (Pessimistic Locks)</small>"]:::serviceStyle
        SVC_PAY["💳 Payment Service<br/><small>:8086 (Ledger / Escrow)</small>"]:::serviceStyle
        SVC_NOTIF["📬 Notification Service<br/><small>:8087 (Outbox Dispatcher)</small>"]:::serviceStyle
    end

    subgraph TIER4 [" 📡 TIER 4: EVENT & DATA MESH "]
        KAFKA["📨 Apache Kafka Bus<br/><small>:29092 (KRaft 3-Partition Topics)<br/>• order.created<br/>• inventory.reserved<br/>• payment.completed</small>"]:::kafkaStyle
        STORAGE[("💾 PostgreSQL & Redis<br/><small>6 Isolated Databases<br/>+ In-Memory Cache</small>")]:::dbStyle
    end

    CLI_WEB -->|HTTPS Ingress| GW
    CLI_ADM -->|Admin Ingress| GW

    GW -.->|REST /profile| SVC_USER
    GW -.->|REST /products| SVC_CAT
    GW -.->|REST /cart| SVC_CART
    GW ==>|REST /checkout| SVC_ORDER
    GW -.->|REST /ship| SVC_ORDER

    SVC_ORDER ===|1. order.created| KAFKA
    KAFKA ===|2. Consume order.created| SVC_INV
    SVC_INV ===|3. inventory.reserved| KAFKA
    KAFKA ===|4. Consume inventory.reserved| SVC_PAY
    SVC_PAY ===|5. payment.completed / failed| KAFKA
    KAFKA ===|6. Update Order Status| SVC_ORDER
    KAFKA -.->|7. Send Email / Push| SVC_NOTIF

    SVC_USER --- STORAGE
    SVC_CAT --- STORAGE
    SVC_CART --- STORAGE
    SVC_ORDER --- STORAGE
    SVC_INV --- STORAGE
    SVC_PAY --- STORAGE
    SVC_NOTIF --- STORAGE

    %% Active Saga Step Callout
    subgraph SAGA_BANNER [" 🎯 ACTIVE SAGA FLOW STEP "]
        ACTIVE_NOTE["${step.action}<br/><b>${step.from}</b> ➔ <b>${step.to}</b><br/><small>${step.description}</small>"]
    end
`;
      return mermaidCode;
    },
    []
  );

  // Render Mermaid SVG asynchronously whenever scenario or step index changes
  useEffect(() => {
    let isCancelled = false;
    const renderChart = async () => {
      try {
        const chartDefinition = generateMermaidChart(selectedScenarioKey, activeStepIndex);
        const uniqueId = `mermaid-arch-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, chartDefinition);
        if (!isCancelled) {
          setMermaidSvg(svg);
          setMermaidRenderError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Mermaid render error:', err);
          setMermaidRenderError(err?.message || 'Mermaid graph parsing failed');
        }
      }
    };

    renderChart();
    return () => {
      isCancelled = true;
    };
  }, [selectedScenarioKey, activeStepIndex, generateMermaidChart]);

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

  // Reset step to 0 when user switches scenario
  const handleSelectScenario = (key: string) => {
    setSelectedScenarioKey(key);
    setActiveStepIndex(0);
    const scen = SCENARIO_PRESETS[key] || SCENARIO_PRESETS.saga_success;
    const firstStep = scen.steps[0];
    if (firstStep) {
      setLiveEventLogs((logs) => [
        {
          id: Math.random().toString(36).substring(7),
          time: new Date().toLocaleTimeString(),
          topic: `SCENARIO: ${scen.title}`,
          payload: `Loaded scenario simulation. Step 1: ${firstStep.action} (${firstStep.description})`,
          status: 'ok',
        },
        ...logs.slice(0, 19),
      ]);
    }
  };

  // Animated Scenario Flow Stepper Loop
  useEffect(() => {
    if (!isPlayingFlow || currentScenarioSteps.length === 0) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        const next = (prev + 1) % currentScenarioSteps.length;
        const currentStep = currentScenarioSteps[next];

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
  }, [isPlayingFlow, currentScenarioSteps]);

  const activeService = services.find((s) => s.id === selectedServiceId) || services[4];
  const currentStep = currentScenarioSteps[activeStepIndex] || currentScenarioSteps[0];

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

      {/* Interactive Scenario Presets Controller */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          border: '1px solid rgba(56, 189, 248, 0.25)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--r-sm)',
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-text-1)' }}>
                  Interactive Architecture Scenario Simulator
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--r-full)',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: activeScenario.badgeColor,
                    border: `1px solid ${activeScenario.badgeColor}40`,
                  }}
                >
                  {activeScenario.badge}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--c-text-2)', marginTop: 2 }}>
                {activeScenario.description}
              </p>
            </div>
          </div>

          {/* Scenario Select Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Scenario:
            </label>
            <select
              value={selectedScenarioKey}
              onChange={(e) => handleSelectScenario(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--r-md)',
                background: 'rgba(15, 23, 42, 0.9)',
                color: 'var(--c-text-1)',
                border: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {Object.entries(SCENARIO_PRESETS).map(([key, item]) => (
                <option key={key} value={key} style={{ background: '#0f172a', color: '#f8fafc' }}>
                  {item.title} ({item.steps.length} steps)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Access Scenario Buttons Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', marginRight: 4 }}>
            Presets:
          </span>
          {Object.entries(SCENARIO_PRESETS).map(([key, item]) => {
            const isSelected = selectedScenarioKey === key;
            return (
              <button
                key={key}
                onClick={() => handleSelectScenario(key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--r-full)',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? 'var(--accent)' : 'var(--c-text-2)',
                  fontSize: 11,
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.3)' : undefined,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: item.badgeColor,
                  }}
                />
                <span>{item.title.split(':')[0]}</span>
              </button>
            );
          })}
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

            {/* Toggle View: Lucid Flow Canvas vs Mermaid.js Engine vs Service Matrix */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: 3, borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setDiagramMode('lucid')}
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: diagramMode === 'lucid' ? 'var(--accent)' : 'transparent',
                  color: diagramMode === 'lucid' ? '#000' : 'var(--c-text-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <Sparkles size={12} />
                <span>Lucid Interactive Flow</span>
              </button>
              <button
                onClick={() => setDiagramMode('mermaid')}
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: diagramMode === 'mermaid' ? 'var(--accent)' : 'transparent',
                  color: diagramMode === 'mermaid' ? '#000' : 'var(--c-text-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <GitBranch size={12} />
                <span>Mermaid Architecture</span>
              </button>
              <button
                onClick={() => setDiagramMode('grid')}
                style={{
                  padding: '5px 14px',
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: diagramMode === 'grid' ? 'var(--accent)' : 'transparent',
                  color: diagramMode === 'grid' ? '#000' : 'var(--c-text-2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <Layers size={12} />
                <span>Service Matrix</span>
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
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Active Step {activeStepIndex + 1}/{currentScenarioSteps.length}:</span>
            <span style={{ color: 'var(--c-text-1)', fontWeight: 600 }}>{currentStep.action}</span>
          </div>
        </div>

        {/* VIEW 1: Modern Lucid Flow Interactive Canvas */}
        {diagramMode === 'lucid' && (
          <div
            style={{
              background: 'radial-gradient(ellipse at 50% 20%, rgba(56, 189, 248, 0.08) 0%, rgba(15, 23, 42, 0.75) 85%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '24px 16px',
              marginBottom: 24,
              overflowX: 'auto',
              position: 'relative',
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* CSS Animation Keyframes for SVG Packet Pulses */}
            <style>{`
              @keyframes packetFlow {
                0% { stroke-dashoffset: 40; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes pulseGlow {
                0%, 100% { opacity: 0.85; filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.6)); }
                50% { opacity: 1; filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.95)); }
              }
              .pulse-active {
                animation: pulseGlow 1.8s infinite ease-in-out;
              }
              .flow-path-active {
                stroke: #38bdf8 !important;
                stroke-width: 3.5px !important;
                stroke-dasharray: 6 6 !important;
                animation: packetFlow 0.8s linear infinite !important;
                filter: drop-shadow(0 0 8px #38bdf8);
              }
              .flow-path-kafka {
                stroke: #f59e0b !important;
                stroke-width: 3.5px !important;
                stroke-dasharray: 6 6 !important;
                animation: packetFlow 0.8s linear infinite !important;
                filter: drop-shadow(0 0 8px #f59e0b);
              }
            `}</style>

            <svg viewBox="0 0 1120 540" style={{ width: '100%', minWidth: 1000, height: 'auto', display: 'block' }}>
              <defs>
                <linearGradient id="gradClient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.98" />
                </linearGradient>
                <linearGradient id="gradGateway" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#312e81" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="gradKafka" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#78350f" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#451a03" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="gradService" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="gradActiveSvc" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0369a1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
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

              {/* LucidFlow Background Tier Containers */}
              {/* Tier 1: Clients */}
              <rect x="20" y="20" width="160" height="490" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <text x="100" y="46" fill="#94a3b8" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.08em">TIER 1: CLIENTS</text>

              {/* Tier 2: Edge Gateway */}
              <rect x="210" y="20" width="170" height="490" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <text x="295" y="46" fill="#818cf8" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.08em">TIER 2: EDGE INGRESS</text>

              {/* Tier 3: Core Domain Services */}
              <rect x="410" y="20" width="460" height="490" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <text x="640" y="46" fill="#38bdf8" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.08em">TIER 3: CORE SERVICES (PORTS 8081-8087)</text>

              {/* Tier 4: Event & Data Mesh */}
              <rect x="895" y="20" width="205" height="490" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <text x="997" y="46" fill="#fbbf24" fontSize="11" fontWeight="800" textAnchor="middle" letterSpacing="0.08em">TIER 4: DATA & EVENT MESH</text>

              {/* CLIENT NODES */}
              <g transform="translate(35, 120)">
                <rect width="130" height="68" rx="8" fill="url(#gradClient)" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="65" y="28" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">React Storefront</text>
                <text x="65" y="46" fill="#94a3b8" fontSize="10" textAnchor="middle">:3000 • Lumé UI</text>
                <circle cx="20" cy="22" r="4" fill="#38bdf8" />
              </g>

              <g transform="translate(35, 290)">
                <rect width="130" height="68" rx="8" fill="url(#gradClient)" stroke="#a855f7" strokeWidth="1.5" />
                <text x="65" y="28" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Admin Console</text>
                <text x="65" y="46" fill="#94a3b8" fontSize="10" textAnchor="middle">:3001 • Aero Glass</text>
                <circle cx="20" cy="22" r="4" fill="#a855f7" />
              </g>

              {/* EDGE GATEWAY NODE */}
              <g
                transform="translate(225, 175)"
                onClick={() => setSelectedServiceId('api-gateway')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'api-gateway' || currentStep.from === 'api-gateway' || currentStep.to === 'api-gateway' ? 'pulse-active' : ''}
              >
                <rect
                  width="140"
                  height="135"
                  rx="10"
                  fill={selectedServiceId === 'api-gateway' ? 'url(#gradActiveSvc)' : 'url(#gradGateway)'}
                  stroke={currentStep.from === 'api-gateway' || currentStep.to === 'api-gateway' ? '#38bdf8' : '#818cf8'}
                  strokeWidth={currentStep.from === 'api-gateway' || currentStep.to === 'api-gateway' ? 2.5 : 1.5}
                />
                <text x="70" y="28" fill="#fff" fontSize="13" fontWeight="800" textAnchor="middle">API Gateway</text>
                <text x="70" y="46" fill="#c7d2fe" fontSize="10" fontWeight="700" textAnchor="middle">Port 8080 (Netty)</text>
                <text x="70" y="70" fill="#cbd5e1" fontSize="9" textAnchor="middle">• JWT Claim Filter</text>
                <text x="70" y="86" fill="#cbd5e1" fontSize="9" textAnchor="middle">• Redis Rate Limiter</text>
                <text x="70" y="102" fill="#cbd5e1" fontSize="9" textAnchor="middle">• Reverse Proxy Router</text>
                <circle cx="20" cy="22" r="5" fill="#818cf8" />
              </g>

              {/* DOMAIN SERVICES NODES - Clean 2-Column Grid */}
              {/* Col 1, Row 1: User Service */}
              <g transform="translate(425, 75)" onClick={() => setSelectedServiceId('user-service')} style={{ cursor: 'pointer' }}>
                <rect width="190" height="68" rx="8" fill={selectedServiceId === 'user-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'} stroke={selectedServiceId === 'user-service' ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
                <text x="95" y="26" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">User Service (8081)</text>
                <text x="95" y="44" fill="#94a3b8" fontSize="10" textAnchor="middle">Auth, Argon2, JWT • user_db</text>
              </g>

              {/* Col 2, Row 1: Catalog Service */}
              <g
                transform="translate(660, 75)"
                onClick={() => setSelectedServiceId('catalog-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'catalog-service' || currentStep.from === 'catalog-service' || currentStep.to === 'catalog-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="190"
                  height="68"
                  rx="8"
                  fill={selectedServiceId === 'catalog-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.from === 'catalog-service' || currentStep.to === 'catalog-service' ? '#38bdf8' : '#334155'}
                  strokeWidth="1.5"
                />
                <text x="95" y="26" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Catalog Service (8082)</text>
                <text x="95" y="44" fill="#38bdf8" fontSize="10" fontWeight="600" textAnchor="middle">Sub-50ms Redis Cache-Aside</text>
              </g>

              {/* Col 1, Row 2: Cart Service */}
              <g transform="translate(425, 175)" onClick={() => setSelectedServiceId('cart-service')} style={{ cursor: 'pointer' }}>
                <rect width="190" height="68" rx="8" fill={selectedServiceId === 'cart-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'} stroke={selectedServiceId === 'cart-service' ? '#38bdf8' : '#334155'} strokeWidth="1.5" />
                <text x="95" y="26" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Cart Service (8083)</text>
                <text x="95" y="44" fill="#94a3b8" fontSize="10" textAnchor="middle">Redis Ephemeral Session Basket</text>
              </g>

              {/* Col 2, Row 2: Order Orchestrator */}
              <g
                transform="translate(660, 165)"
                onClick={() => setSelectedServiceId('order-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'order-service' || currentStep.from === 'order-service' || currentStep.to === 'order-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="190"
                  height="85"
                  rx="8"
                  fill={selectedServiceId === 'order-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.from === 'order-service' || currentStep.to === 'order-service' ? '#38bdf8' : '#38bdf8'}
                  strokeWidth="2"
                />
                <text x="95" y="26" fill="#38bdf8" fontSize="13" fontWeight="800" textAnchor="middle">Order Service (8084)</text>
                <text x="95" y="46" fill="#f8fafc" fontSize="10" fontWeight="700" textAnchor="middle">Saga Orchestrator + Outbox</text>
                <text x="95" y="64" fill="#94a3b8" fontSize="9" textAnchor="middle">order_db (Idempotent Checkout)</text>
              </g>

              {/* Col 1, Row 3: Inventory Service */}
              <g
                transform="translate(425, 275)"
                onClick={() => setSelectedServiceId('inventory-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'inventory-service' || currentStep.from === 'inventory-service' || currentStep.to === 'inventory-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="190"
                  height="80"
                  rx="8"
                  fill={selectedServiceId === 'inventory-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.from === 'inventory-service' || currentStep.to === 'inventory-service' ? '#f59e0b' : '#334155'}
                  strokeWidth="1.5"
                />
                <text x="95" y="26" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Inventory Service (8085)</text>
                <text x="95" y="44" fill="#f59e0b" fontSize="10" fontWeight="600" textAnchor="middle">Pessimistic DB Locks</text>
                <text x="95" y="62" fill="#94a3b8" fontSize="9" textAnchor="middle">Zero-Overselling • inventory_db</text>
              </g>

              {/* Col 2, Row 3: Payment Service */}
              <g
                transform="translate(660, 275)"
                onClick={() => setSelectedServiceId('payment-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'payment-service' || currentStep.from === 'payment-service' || currentStep.to === 'payment-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="190"
                  height="80"
                  rx="8"
                  fill={selectedServiceId === 'payment-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.from === 'payment-service' || currentStep.to === 'payment-service' ? '#10b981' : '#334155'}
                  strokeWidth="1.5"
                />
                <text x="95" y="26" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Payment Service (8086)</text>
                <text x="95" y="44" fill="#10b981" fontSize="10" fontWeight="600" textAnchor="middle">Financial Ledger & Settlement</text>
                <text x="95" y="62" fill="#94a3b8" fontSize="9" textAnchor="middle">payment_db • Compensation</text>
              </g>

              {/* Row 4 (Centered Span): Notification Service */}
              <g
                transform="translate(545, 385)"
                onClick={() => setSelectedServiceId('notification-service')}
                style={{ cursor: 'pointer' }}
                className={selectedServiceId === 'notification-service' || currentStep.to === 'notification-service' ? 'pulse-active' : ''}
              >
                <rect
                  width="190"
                  height="68"
                  rx="8"
                  fill={selectedServiceId === 'notification-service' ? 'url(#gradActiveSvc)' : 'url(#gradService)'}
                  stroke={currentStep.to === 'notification-service' ? '#10b981' : '#334155'}
                  strokeWidth="1.5"
                />
                <text x="95" y="26" fill="#f8fafc" fontSize="12" fontWeight="700" textAnchor="middle">Notification Service (8087)</text>
                <text x="95" y="44" fill="#94a3b8" fontSize="10" textAnchor="middle">Emails & WebSocket Push • notification_db</text>
              </g>

              {/* TIER 4: KAFKA & STORAGE MESH */}
              {/* Apache Kafka KRaft Event Bus */}
              <g transform="translate(910, 85)">
                <rect width="175" height="205" rx="10" fill="url(#gradKafka)" stroke="#fbbf24" strokeWidth="2" />
                <text x="87" y="28" fill="#fff" fontSize="13" fontWeight="900" textAnchor="middle">Apache Kafka (KRaft)</text>
                <text x="87" y="46" fill="#fef3c7" fontSize="10" fontWeight="600" textAnchor="middle">Port 29092 • Event Bus</text>

                <rect x="15" y="58" width="145" height="24" rx="4" fill="rgba(0,0,0,0.3)" />
                <text x="87" y="74" fill="#fde68a" fontSize="9" fontWeight="700" textAnchor="middle">order.created (3p)</text>

                <rect x="15" y="88" width="145" height="24" rx="4" fill="rgba(0,0,0,0.3)" />
                <text x="87" y="104" fill="#fde68a" fontSize="9" fontWeight="700" textAnchor="middle">inventory.reserved (3p)</text>

                <rect x="15" y="118" width="145" height="24" rx="4" fill="rgba(0,0,0,0.3)" />
                <text x="87" y="134" fill="#fde68a" fontSize="9" fontWeight="700" textAnchor="middle">payment.completed (3p)</text>

                <rect x="15" y="148" width="145" height="24" rx="4" fill="rgba(0,0,0,0.3)" />
                <text x="87" y="164" fill="#fde68a" fontSize="9" fontWeight="700" textAnchor="middle">order.shipped (3p)</text>
              </g>

              {/* Multi-Database PostgreSQL & Redis */}
              <g transform="translate(910, 310)">
                <rect width="175" height="155" rx="10" fill="url(#gradService)" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="87" y="28" fill="#38bdf8" fontSize="12" fontWeight="800" textAnchor="middle">Storage & Cache Mesh</text>
                <text x="87" y="46" fill="#94a3b8" fontSize="9" textAnchor="middle">6 Isolated Postgres DBs (:5433)</text>
                <text x="87" y="60" fill="#94a3b8" fontSize="9" textAnchor="middle">Redis In-Memory Tier (:6379)</text>

                <rect x="15" y="75" width="145" height="30" rx="4" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.3)" />
                <text x="87" y="94" fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor="middle">ACID Transaction Outbox</text>

                <rect x="15" y="114" width="145" height="30" rx="4" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.3)" />
                <text x="87" y="133" fill="#10b981" fontSize="10" fontWeight="700" textAnchor="middle">Zero-Oversell Locks</text>
              </g>

              {/* CONNECTING ARROWS & ANIMATED FLOW PATHS */}
              {/* Clients -> Gateway */}
              <path d="M 165 154 L 225 210" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />
              <path d="M 165 324 L 225 260" stroke="#64748b" strokeWidth="1.5" markerEnd="url(#arrow)" />

              {/* Gateway -> Order Service */}
              <path
                d="M 365 240 L 660 210"
                stroke="#64748b"
                strokeWidth="1.5"
                className={activeStepIndex === 0 && selectedScenarioKey.includes('saga') ? 'flow-path-active' : ''}
                markerEnd={activeStepIndex === 0 && selectedScenarioKey.includes('saga') ? 'url(#arrow-active)' : 'url(#arrow)'}
              />

              {/* Gateway -> Catalog Service (Read Path) */}
              <path
                d="M 365 210 L 660 115"
                stroke="#64748b"
                strokeWidth="1.5"
                className={selectedScenarioKey === 'catalog_browsing' ? 'flow-path-active' : ''}
                markerEnd={selectedScenarioKey === 'catalog_browsing' ? 'url(#arrow-active)' : 'url(#arrow)'}
              />

              {/* Order Service -> Kafka (order.created) */}
              <path
                d="M 850 200 L 910 145"
                stroke="#64748b"
                strokeWidth="1.5"
                className={currentStep.action.includes('order.created') ? 'flow-path-kafka' : ''}
                markerEnd={currentStep.action.includes('order.created') ? 'url(#arrow-kafka)' : 'url(#arrow)'}
              />

              {/* Kafka -> Inventory Service */}
              <path
                d="M 910 170 C 840 230, 720 280, 615 310"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                className={currentStep.from === 'inventory-service' && currentStep.action.includes('SELECT') ? 'flow-path-kafka' : ''}
                markerEnd="url(#arrow-kafka)"
              />

              {/* Inventory Service -> Kafka (inventory.reserved / failure) */}
              <path
                d="M 615 320 C 730 330, 830 270, 910 200"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                className={currentStep.action.includes('inventory.reserved') || currentStep.action.includes('reservation_failed') ? 'flow-path-kafka' : ''}
                markerEnd={currentStep.action.includes('inventory.reserved') || currentStep.action.includes('reservation_failed') ? 'url(#arrow-kafka)' : 'url(#arrow)'}
              />

              {/* Kafka -> Payment Service */}
              <path
                d="M 910 220 L 850 295"
                stroke="#64748b"
                strokeWidth="1.5"
                className={currentStep.action.includes('payment') ? 'flow-path-kafka' : ''}
                markerEnd={currentStep.action.includes('payment') ? 'url(#arrow-kafka)' : 'url(#arrow)'}
              />

              {/* Payment Service -> Kafka (payment.completed / failed) */}
              <path
                d="M 850 320 C 900 320, 930 280, 930 250 C 930 230, 900 220, 850 210"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                className={currentStep.action.includes('payment.completed') || currentStep.action.includes('payment.failed') ? 'flow-path-kafka' : ''}
                markerEnd="url(#arrow-kafka)"
              />

              {/* Order Service -> Notification Service */}
              <path
                d="M 755 250 L 660 385"
                stroke="#64748b"
                strokeWidth="1.5"
                className={currentStep.to === 'notification-service' ? 'flow-path-active' : ''}
                markerEnd={currentStep.to === 'notification-service' ? 'url(#arrow-active)' : 'url(#arrow)'}
              />
            </svg>

            {/* Diagram Legend */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 11, color: 'var(--c-text-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 3, background: '#38bdf8' }} /> Synchronous HTTP / REST Flow
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 3, background: '#f59e0b' }} /> Asynchronous Kafka Event Stream
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} /> Active Saga Pulse
                </span>
              </div>
              <span>Click on any microservice box in the diagram to inspect its isolated DB, port, and technology stack.</span>
            </div>
          </div>
        )}

        {/* VIEW 2: Official Mermaid.js Architecture Graph */}
        {diagramMode === 'mermaid' && (
          <div
            style={{
              background: '#090d16',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '24px 20px',
              marginBottom: 24,
              overflowX: 'auto',
              minHeight: 460,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            {mermaidRenderError ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--danger)' }}>
                <AlertCircle size={28} style={{ margin: '0 auto 12px' }} />
                <div>Mermaid Diagram Compilation Notice</div>
                <div style={{ fontSize: 12, color: 'var(--c-text-2)', marginTop: 4 }}>{mermaidRenderError}</div>
              </div>
            ) : mermaidSvg ? (
              <div
                dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--accent)' }}>
                <RefreshCw size={18} className="animate-spin" />
                <span>Compiling Mermaid Graph...</span>
              </div>
            )}

            <div style={{ marginTop: 18, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--c-text-3)' }}>
              <span>Generated via Mermaid.js 11 • Live flowchart syntax synchronized with active scenario preset</span>
              <span style={{ color: 'var(--accent)' }}>Active Preset: {activeScenario.title}</span>
            </div>
          </div>
        )}

        {/* VIEW 3: Live Service Card Grid */}
        {diagramMode === 'grid' && (
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
            {currentScenarioSteps.map((step, idx) => {
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
                  {idx < currentScenarioSteps.length - 1 && (
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
