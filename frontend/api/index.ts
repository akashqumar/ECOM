// Real Seed Data Extracted from Database
export const CATEGORIES_DATA = {
  "success": true,
  "message": "Operation completed successfully",
  "data": [
    {
      "id": "3bb2dd22-2bef-4568-8f56-4c07106e6f8c",
      "name": "Smartphones",
      "slug": "smartphones",
      "description": "Flagship, foldable, and performance mobile devices",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.623987Z"
    },
    {
      "id": "e241c2bb-54aa-466e-9e8e-d90927cc9e16",
      "name": "Laptops",
      "slug": "laptops",
      "description": "Ultrabooks, workstation, and mobile computing laptops",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.649519Z"
    },
    {
      "id": "ab13c946-86a6-45f0-b7df-86582d3b5519",
      "name": "Audio",
      "slug": "audio",
      "description": "Audiophile headphones, wireless earbuds, and studio monitors",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.652228Z"
    },
    {
      "id": "ead74b05-8d74-4a01-929b-06cf1edbb29e",
      "name": "Gaming",
      "slug": "gaming",
      "description": "Next-gen consoles, mechanical keyboards, and gaming gear",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.655431Z"
    },
    {
      "id": "991bb796-7a67-4038-9342-ef4297c15285",
      "name": "Wearables",
      "slug": "wearables",
      "description": "Smartwatches, fitness bands, and wearable tech",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.658295Z"
    },
    {
      "id": "d02bfcee-6dde-44a8-b87f-d5a23bdf4b6c",
      "name": "Cameras",
      "slug": "cameras",
      "description": "Mirrorless cameras, prime lenses, and cinema gear",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.661211Z"
    },
    {
      "id": "2700eee2-25a3-4a10-8b2a-8840c8400d8f",
      "name": "Monitors",
      "slug": "monitors",
      "description": "Ultra-wide 4K HDR displays and OLED gaming monitors",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.669614Z"
    },
    {
      "id": "caf249cf-f69b-4208-8287-59236a30ba8b",
      "name": "Accessories",
      "slug": "accessories",
      "description": "Chargers, hubs, premium cables, and desk mats",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.675218Z"
    },
    {
      "id": "d5b02a64-f1b2-429e-a49f-da08ffdc8a2f",
      "name": "Home Office",
      "slug": "home-office",
      "description": "Ergonomic chairs, standing desks, and ambient lighting",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.678102Z"
    },
    {
      "id": "67574209-d7a1-4b95-ac62-7087a83e67c5",
      "name": "Storage",
      "slug": "storage",
      "description": "High-speed NVMe SSDs, external enclosures, and NAS arrays",
      "parentCategoryId": null,
      "createdAt": "2026-09-29T18:34:46.680361Z"
    }
  ],
  "timestamp": "2026-10-03T16:10:41.109682Z"
};

export const PRODUCTS_DATA = {
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "content": [
      {
        "id": "ca8b0393-2515-48a1-8fed-e63067a89180",
        "sku": "SKU-STOR-04",
        "name": "Pro CFexpress Type B 512GB",
        "slug": "pro-cfexpress-type-b-512gb",
        "description": "Sustained minimum write speed of 1400 MB/s for continuous 8K RAW cinema camera recording.",
        "brand": "FastDrive",
        "categoryId": "67574209-d7a1-4b95-ac62-7087a83e67c5",
        "categoryName": "Storage",
        "price": 299,
        "discountPrice": 249,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 75,
        "createdAt": "2026-09-29T18:34:46.685607Z"
      },
      {
        "id": "158a96c0-50c2-4df9-af1a-1da1d9483f75",
        "sku": "SKU-STOR-03",
        "name": "Vault 4-Bay Network Attached Storage",
        "slug": "vault-4-bay-network-attached-storage",
        "description": "Quad-core Intel Celeron CPU, dual 2.5GbE ports, M.2 SSD caching slots, and automated backup.",
        "brand": "DataVault",
        "categoryId": "67574209-d7a1-4b95-ac62-7087a83e67c5",
        "categoryName": "Storage",
        "price": 549,
        "discountPrice": 489,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 140,
        "createdAt": "2026-09-29T18:34:46.685350Z"
      },
      {
        "id": "a7db7689-2099-4444-8905-b48e38f247dd",
        "sku": "SKU-STOR-02",
        "name": "Rugged Armor 2TB Portable SSD",
        "slug": "rugged-armor-2tb-portable-ssd",
        "description": "Drop-tested to 3 meters, IP65 dust/water resistance, and USB 3.2 Gen 2x2 2000 MB/s transfer.",
        "brand": "FastDrive",
        "categoryId": "67574209-d7a1-4b95-ac62-7087a83e67c5",
        "categoryName": "Storage",
        "price": 199,
        "discountPrice": 169,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 480,
        "createdAt": "2026-09-29T18:34:46.685301Z"
      },
      {
        "id": "0d87f94d-f8d2-4bed-9853-1e7a23ef4885",
        "sku": "SKU-STOR-01",
        "name": "FastNVMe 4TB PCIe Gen5 SSD",
        "slug": "fastnvme-4tb-pcie-gen5-ssd",
        "description": "Blistering sequential speeds up to 14,500 MB/s with extruded aluminum heatsink and DRAM cache.",
        "brand": "FastDrive",
        "categoryId": "67574209-d7a1-4b95-ac62-7087a83e67c5",
        "categoryName": "Storage",
        "price": 499,
        "discountPrice": 439,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 290,
        "createdAt": "2026-09-29T18:34:46.685236Z"
      },
      {
        "id": "22920a69-5aac-4bd2-909c-2903fd6e804d",
        "sku": "SKU-HOME-05",
        "name": "Minimalist Aluminum Laptop Riser",
        "slug": "minimalist-aluminum-laptop-riser",
        "description": "Sandblasted space-gray ergonomic stand promoting airflow and posture alignment.",
        "brand": "DeskCraft",
        "categoryId": "d5b02a64-f1b2-429e-a49f-da08ffdc8a2f",
        "categoryName": "Home Office",
        "price": 49,
        "discountPrice": 39,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 360,
        "createdAt": "2026-09-29T18:34:46.685132Z"
      },
      {
        "id": "d9ce4626-3e4d-4245-95d2-ec35aca836aa",
        "sku": "SKU-HOME-04",
        "name": "Kevlar Acoustic Desk Divider Screen",
        "slug": "kevlar-acoustic-desk-divider-screen",
        "description": "Sound-absorbing PET felt partition panel reducing echo and visual clutter in open floorplans.",
        "brand": "DeskCraft",
        "categoryId": "d5b02a64-f1b2-429e-a49f-da08ffdc8a2f",
        "categoryName": "Home Office",
        "price": 129,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.5,
        "reviewCount": 55,
        "createdAt": "2026-09-29T18:34:46.685116Z"
      },
      {
        "id": "aa44312c-3bcc-47f7-b896-67c0626c82bd",
        "sku": "SKU-HOME-03",
        "name": "ScreenBar Halo Smart Monitor Light",
        "slug": "screenbar-halo-smart-monitor-light",
        "description": "Asymmetric optical design prevents screen glare, wireless rotary control knob, auto-dimming.",
        "brand": "DeskCraft",
        "categoryId": "d5b02a64-f1b2-429e-a49f-da08ffdc8a2f",
        "categoryName": "Home Office",
        "price": 169,
        "discountPrice": 139,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 310,
        "createdAt": "2026-09-29T18:34:46.685099Z"
      },
      {
        "id": "0f12df46-cf3f-4275-9f26-f78ed55abf77",
        "sku": "SKU-HOME-02",
        "name": "Solid Walnut Dual-Motor Standing Desk",
        "slug": "solid-walnut-dual-motor-standing-desk",
        "description": "1.5-inch solid American walnut tabletop, whisper-quiet collision-detection motors, 4 presets.",
        "brand": "DeskCraft",
        "categoryId": "d5b02a64-f1b2-429e-a49f-da08ffdc8a2f",
        "categoryName": "Home Office",
        "price": 999,
        "discountPrice": 899,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 185,
        "createdAt": "2026-09-29T18:34:46.685032Z"
      },
      {
        "id": "53743f64-01eb-4abd-865c-57f1d8058a58",
        "sku": "SKU-HOME-01",
        "name": "AeroChair Ergonomic Mesh Task Chair",
        "slug": "aerochair-ergonomic-mesh-task-chair",
        "description": "Dynamic lumbar response, breathable elastomeric mesh, 4D armrests, and 12-year warranty.",
        "brand": "AeroForm",
        "categoryId": "d5b02a64-f1b2-429e-a49f-da08ffdc8a2f",
        "categoryName": "Home Office",
        "price": 799,
        "discountPrice": 699,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1580481077195-c3c3a9d56f67?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 410,
        "createdAt": "2026-09-29T18:34:46.685002Z"
      },
      {
        "id": "9f494d25-4e9d-4ce9-aeb8-e979ed75e1c3",
        "sku": "SKU-ACC-05",
        "name": "4K HDR Streaming Capture Card",
        "slug": "4k-hdr-streaming-capture-card",
        "description": "Zero-lag passthrough up to 4K 144Hz with hardware AV1/HEVC encoding and OBS plug-and-play.",
        "brand": "HyperStrike",
        "categoryId": "caf249cf-f69b-4208-8287-59236a30ba8b",
        "categoryName": "Accessories",
        "price": 179,
        "discountPrice": 149,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 130,
        "createdAt": "2026-09-29T18:34:46.684948Z"
      },
      {
        "id": "bed18124-2a55-486f-9f43-e45326a628d4",
        "sku": "SKU-ACC-04",
        "name": "Merino Wool Vegan Leather Desk Mat",
        "slug": "merino-wool-vegan-leather-desk-mat",
        "description": "Double-sided water-resistant workspace pad with anti-fray stitching and magnetic cable organizers.",
        "brand": "DeskCraft",
        "categoryId": "caf249cf-f69b-4208-8287-59236a30ba8b",
        "categoryName": "Accessories",
        "price": 59,
        "discountPrice": 45,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 210,
        "createdAt": "2026-09-29T18:34:46.684891Z"
      },
      {
        "id": "615b0bbe-3be9-4337-a2a8-2bc936775d0f",
        "sku": "SKU-ACC-03",
        "name": "GaN Prime 140W Travel Charger",
        "slug": "gan-prime-140w-travel-charger",
        "description": "Compact Gallium Nitride fast charger with 3x USB-C and 1x USB-A ports with dynamic load sharing.",
        "brand": "VoltPro",
        "categoryId": "caf249cf-f69b-4208-8287-59236a30ba8b",
        "categoryName": "Accessories",
        "price": 89,
        "discountPrice": 69,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 640,
        "createdAt": "2026-09-29T18:34:46.684826Z"
      },
      {
        "id": "2f66b35f-cf8f-40f7-8436-fdd79b8e3e35",
        "sku": "SKU-ACC-02",
        "name": "MagStand 3-in-1 Wireless Charger",
        "slug": "magstand-3-in-1-wireless-charger",
        "description": "Weighted aluminum base charges phone, smartwatch, and wireless earbuds concurrently at 15W.",
        "brand": "Titan",
        "categoryId": "caf249cf-f69b-4208-8287-59236a30ba8b",
        "categoryName": "Accessories",
        "price": 129,
        "discountPrice": 99,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 520,
        "createdAt": "2026-09-29T18:34:46.684774Z"
      },
      {
        "id": "8773df6d-7b3c-4fe7-8dc3-a06ca034d040",
        "sku": "SKU-ACC-01",
        "name": "ThunderBolt 4 HyperDock 14-in-1",
        "slug": "thunderbolt-4-hyperdock-14-in-1",
        "description": "Single 40Gbps cable delivers dual 4K 60Hz displays, 100W Power Delivery, SD 4.0, and 2.5GbE.",
        "brand": "HyperDock",
        "categoryId": "caf249cf-f69b-4208-8287-59236a30ba8b",
        "categoryName": "Accessories",
        "price": 249,
        "discountPrice": 199,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 380,
        "createdAt": "2026-09-29T18:34:46.684738Z"
      },
      {
        "id": "6c90b377-3ca1-4b88-be75-c33ed0539fa8",
        "sku": "SKU-MON-05",
        "name": "Portable 16 2K OLED Travel Monitor",
        "slug": "portable-16-2k-oled-travel-monitor",
        "description": "600g magnetic cover display powered via single USB-C cable for dual-screen productivity anywhere.",
        "brand": "Aerolite",
        "categoryId": "2700eee2-25a3-4a10-8b2a-8840c8400d8f",
        "categoryName": "Monitors",
        "price": 349,
        "discountPrice": 299,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 140,
        "createdAt": "2026-09-29T18:34:46.684706Z"
      },
      {
        "id": "4f745d70-8d44-489e-8fe2-deafb2bb8db8",
        "sku": "SKU-MON-04",
        "name": "Canvas 27 Ergonomic 4K Touch",
        "slug": "canvas-27-ergonomic-4k-touch",
        "description": "Direct-pen input monitor with 4096 pressure levels, anti-glare etching, and zero-gravity hinge.",
        "brand": "Canvas",
        "categoryId": "2700eee2-25a3-4a10-8b2a-8840c8400d8f",
        "categoryName": "Monitors",
        "price": 899,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.6,
        "reviewCount": 65,
        "createdAt": "2026-09-29T18:34:46.684653Z"
      },
      {
        "id": "386b36b1-b71b-47b0-8577-c34ae55feec4",
        "sku": "SKU-MON-03",
        "name": "ApexSpeed 27 360Hz Esports",
        "slug": "apexspeed-27-360hz-esports",
        "description": "Fast IPS panel tuned for competitive FPS games with motion blur reduction and ergonomic stand.",
        "brand": "Apex",
        "categoryId": "2700eee2-25a3-4a10-8b2a-8840c8400d8f",
        "categoryName": "Monitors",
        "price": 499,
        "discountPrice": 429,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1586775490184-b79f0621891f?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 180,
        "createdAt": "2026-09-29T18:34:46.684549Z"
      },
      {
        "id": "5e553848-a71e-4126-9930-8d7e7ed1d4e2",
        "sku": "SKU-MON-02",
        "name": "ProColor 32 4K Mini-LED Studio",
        "slug": "procolor-32-4k-mini-led-studio",
        "description": "1,152 dimming zones, 1600 nits peak HDR brightness, 99% Adobe RGB coverage for color grading.",
        "brand": "ProColor",
        "categoryId": "2700eee2-25a3-4a10-8b2a-8840c8400d8f",
        "categoryName": "Monitors",
        "price": 1599,
        "discountPrice": 1449,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 98,
        "createdAt": "2026-09-29T18:34:46.684531Z"
      },
      {
        "id": "649c1b87-b76b-43f0-9835-9bee9c5b5ae3",
        "sku": "SKU-MON-01",
        "name": "VisionMaster 49 Ultra-Wide OLED",
        "slug": "visionmaster-49-ultra-wide-oled",
        "description": "49-inch 32:9 dual QHD 240Hz curved OLED monitor with 0.03ms response time and KVM switch.",
        "brand": "VisionMaster",
        "categoryId": "2700eee2-25a3-4a10-8b2a-8840c8400d8f",
        "categoryName": "Monitors",
        "price": 1299,
        "discountPrice": 1149,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 215,
        "createdAt": "2026-09-29T18:34:46.684505Z"
      },
      {
        "id": "802d1251-57ed-44a6-8cb6-a3eee2487875",
        "sku": "SKU-CAM-06",
        "name": "AeroDrone 4K Folding Quadcopter",
        "slug": "aerodrone-4k-folding-quadcopter",
        "description": "Omnidirectional obstacle sensing, 45-minute flight time, and 1/1.3-inch HDR camera.",
        "brand": "AeroDrone",
        "categoryId": "d02bfcee-6dde-44a8-b87f-d5a23bdf4b6c",
        "categoryName": "Cameras",
        "price": 899,
        "discountPrice": 799,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 310,
        "createdAt": "2026-09-29T18:34:46.684437Z"
      },
      {
        "id": "f27395fa-7b25-4907-9353-1a3a842ae1f3",
        "sku": "SKU-CAM-05",
        "name": "Gimbal Ronin 3-Axis Stabilizer",
        "slug": "gimbal-ronin-3-axis-stabilizer",
        "description": "Automated axis locks, carbon fiber arms, 4.5kg payload support, and wireless focus motor.",
        "brand": "Lumix",
        "categoryId": "d02bfcee-6dde-44a8-b87f-d5a23bdf4b6c",
        "categoryName": "Cameras",
        "price": 599,
        "discountPrice": 529,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1589872765306-037149a40590?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 160,
        "createdAt": "2026-09-29T18:34:46.684419Z"
      },
      {
        "id": "bd4b1611-7203-4356-9b59-1bd85c10a415",
        "sku": "SKU-CAM-04",
        "name": "Acrobat 360 Action Cam 4K",
        "slug": "acrobat-360-action-cam-4k",
        "description": "Waterproof 360-degree action camera with invisible selfie stick algorithm and FlowState leveling.",
        "brand": "Acrobat",
        "categoryId": "d02bfcee-6dde-44a8-b87f-d5a23bdf4b6c",
        "categoryName": "Cameras",
        "price": 449,
        "discountPrice": 399,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.6,
        "reviewCount": 230,
        "createdAt": "2026-09-29T18:34:46.684402Z"
      },
      {
        "id": "74cad8f9-c4fc-4e0f-a8c9-ba21dadd3ef7",
        "sku": "SKU-CAM-03",
        "name": "Prime 50mm f/1.2 Master Lens",
        "slug": "prime-50mm-f12-master-lens",
        "description": "Ultra-fast aperture portrait lens with circular 11-blade diaphragm for dreamy bokeh rendering.",
        "brand": "Lumix",
        "categoryId": "d02bfcee-6dde-44a8-b87f-d5a23bdf4b6c",
        "categoryName": "Cameras",
        "price": 1499,
        "discountPrice": 1349,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 110,
        "createdAt": "2026-09-29T18:34:46.684345Z"
      },
      {
        "id": "775f5010-2d8b-42e4-b090-1b58e337471a",
        "sku": "SKU-CAM-02",
        "name": "RetroRangefinder 35mm Digital",
        "slug": "retrorangefinder-35mm-digital",
        "description": "Classic brass and leather body with tactile shutter dial, optical viewfinder, and film simulations.",
        "brand": "Vintage",
        "categoryId": "d02bfcee-6dde-44a8-b87f-d5a23bdf4b6c",
        "categoryName": "Cameras",
        "price": 1699,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 85,
        "createdAt": "2026-09-29T18:34:46.684330Z"
      },
      {
        "id": "38a156b8-237b-4a27-acd7-ca18f7c3837c",
        "sku": "SKU-CAM-01",
        "name": "Lumix Alpha Cinema 8K Mirrorless",
        "slug": "lumix-alpha-cinema-8k-mirrorless",
        "description": "Full-frame 45MP stacked BSI sensor, internal 8K ProRes RAW, 5-axis sensor-shift stabilization.",
        "brand": "Lumix",
        "categoryId": "d02bfcee-6dde-44a8-b87f-d5a23bdf4b6c",
        "categoryName": "Cameras",
        "price": 3899,
        "discountPrice": 3599,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 5,
        "reviewCount": 140,
        "createdAt": "2026-09-29T18:34:46.684323Z"
      },
      {
        "id": "b77f9528-7fc6-49a5-98a8-f8328fee756b",
        "sku": "SKU-WEAR-06",
        "name": "Smart Vision Audio Glasses",
        "slug": "smart-vision-audio-glasses",
        "description": "Polarized sunglasses with directional open-ear audio, voice assistant, and ultra-light frame.",
        "brand": "Nova",
        "categoryId": "991bb796-7a67-4038-9342-ef4297c15285",
        "categoryName": "Wearables",
        "price": 199,
        "discountPrice": 159,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.4,
        "reviewCount": 92,
        "createdAt": "2026-09-29T18:34:46.684309Z"
      },
      {
        "id": "4fe47fe3-a83f-4110-b74b-ab5d177fbbee",
        "sku": "SKU-WEAR-05",
        "name": "PulsePro ECG Chest Band",
        "slug": "pulsepro-ecg-chest-band",
        "description": "Medical-grade optical & electrical heart rate strap for high-intensity training intervals.",
        "brand": "PulsePro",
        "categoryId": "991bb796-7a67-4038-9342-ef4297c15285",
        "categoryName": "Wearables",
        "price": 119,
        "discountPrice": 99,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 130,
        "createdAt": "2026-09-29T18:34:46.684292Z"
      },
      {
        "id": "15b6802e-1a99-4a2b-93f3-9600b6b4530f",
        "sku": "SKU-WEAR-04",
        "name": "Luxe Hybrid Mechanical Smartwatch",
        "slug": "luxe-hybrid-mechanical-smartwatch",
        "description": "Swiss mechanical analog hands layered over an e-ink display with discreet notification haptics.",
        "brand": "Luxe",
        "categoryId": "991bb796-7a67-4038-9342-ef4297c15285",
        "categoryName": "Wearables",
        "price": 349,
        "discountPrice": 299,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.5,
        "reviewCount": 78,
        "createdAt": "2026-09-29T18:34:46.684270Z"
      },
      {
        "id": "cbbd1460-846f-449d-bb6b-9db81d9218d0",
        "sku": "SKU-WEAR-03",
        "name": "Veloce Sport GPS Smartwatch",
        "slug": "veloce-sport-gps-smartwatch",
        "description": "Solar charging bezel, topographic offline maps, heart rate zones, and 28-day battery life.",
        "brand": "Veloce",
        "categoryId": "991bb796-7a67-4038-9342-ef4297c15285",
        "categoryName": "Wearables",
        "price": 499,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 190,
        "createdAt": "2026-09-29T18:34:46.684251Z"
      },
      {
        "id": "833f729a-3315-4ea3-953b-7f7534c83348",
        "sku": "SKU-WEAR-02",
        "name": "Aura Fitness Tracker Ring Gen3",
        "slug": "aura-fitness-tracker-ring-gen3",
        "description": "Subtle titanium smart ring tracking sleep stages, readiness score, HRV, and body temperature.",
        "brand": "Aura",
        "categoryId": "991bb796-7a67-4038-9342-ef4297c15285",
        "categoryName": "Wearables",
        "price": 299,
        "discountPrice": 269,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.6,
        "reviewCount": 210,
        "createdAt": "2026-09-29T18:34:46.684218Z"
      },
      {
        "id": "790b2378-a153-42fc-9051-e743f302de95",
        "sku": "SKU-WEAR-01",
        "name": "Titan Watch Ultra 2 Titanium",
        "slug": "titan-watch-ultra-2-titanium",
        "description": "Aerospace titanium case, 3000 nits sapphire display, dual-frequency GPS, and 100m water resistance.",
        "brand": "Titan",
        "categoryId": "991bb796-7a67-4038-9342-ef4297c15285",
        "categoryName": "Wearables",
        "price": 799,
        "discountPrice": 749,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 430,
        "createdAt": "2026-09-29T18:34:46.684188Z"
      },
      {
        "id": "89a4fb9d-2a0b-4536-81af-af139cf94685",
        "sku": "SKU-GAME-06",
        "name": "Immersion VR Pro Headset",
        "slug": "immersion-vr-pro-headset",
        "description": "Dual 4K micro-OLED pancake optics, inside-out eye tracking, and haptic feedback controllers.",
        "brand": "Immersion",
        "categoryId": "ead74b05-8d74-4a01-929b-06cf1edbb29e",
        "categoryName": "Gaming",
        "price": 999,
        "discountPrice": 899,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 175,
        "createdAt": "2026-09-29T18:34:46.684144Z"
      },
      {
        "id": "c8db61d1-4b32-46e6-b579-da806625a434",
        "sku": "SKU-GAME-05",
        "name": "Arcade Pro Custom Fightstick",
        "slug": "arcade-pro-custom-fightstick",
        "description": "Authentic Sanwa Denshi joystick and buttons, tournament lock switch, and aluminum casing.",
        "brand": "HyperStrike",
        "categoryId": "ead74b05-8d74-4a01-929b-06cf1edbb29e",
        "categoryName": "Gaming",
        "price": 229,
        "discountPrice": 199,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 95,
        "createdAt": "2026-09-29T18:34:46.684074Z"
      },
      {
        "id": "eb6482cb-c89b-4291-84c3-0c97e6f6a6bb",
        "sku": "SKU-GAME-04",
        "name": "Apex Flight Simulator Yoke",
        "slug": "apex-flight-simulator-yoke",
        "description": "Hall-effect magnetic sensors, steel shaft, integrated throttle quadrant with realistic detents.",
        "brand": "ApexSim",
        "categoryId": "ead74b05-8d74-4a01-929b-06cf1edbb29e",
        "categoryName": "Gaming",
        "price": 349,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.6,
        "reviewCount": 68,
        "createdAt": "2026-09-29T18:34:46.684013Z"
      },
      {
        "id": "519b227c-a7c1-477f-9c7d-1b228acbd33e",
        "sku": "SKU-GAME-03",
        "name": "Viper Elite Ultralight Wireless Mouse",
        "slug": "viper-elite-ultralight-wireless-mouse",
        "description": "49g honeycomb shell, 30,000 DPI sensor, 4000Hz polling rate, and zero-latency wireless.",
        "brand": "HyperStrike",
        "categoryId": "ead74b05-8d74-4a01-929b-06cf1edbb29e",
        "categoryName": "Gaming",
        "price": 129,
        "discountPrice": 99,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 540,
        "createdAt": "2026-09-29T18:34:46.683990Z"
      },
      {
        "id": "9afd75c5-e241-43fe-a2c7-2842950712c0",
        "sku": "SKU-GAME-02",
        "name": "HyperStrike Optical Keyboard",
        "slug": "hyperstrike-optical-keyboard",
        "description": "Hot-swappable magnetic analog switches, sound-dampening foam, per-key RGB, and PBT keycaps.",
        "brand": "HyperStrike",
        "categoryId": "ead74b05-8d74-4a01-929b-06cf1edbb29e",
        "categoryName": "Gaming",
        "price": 199,
        "discountPrice": 169,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 280,
        "createdAt": "2026-09-29T18:34:46.683948Z"
      },
      {
        "id": "05d80566-bbda-4519-a55d-975936a72328",
        "sku": "SKU-GAME-01",
        "name": "Chronos Handheld OLED Console",
        "slug": "chronos-handheld-oled-console",
        "description": "Portable PC gaming console powered by AMD Ryzen Z1 Extreme, 7-inch 120Hz VRR touch panel.",
        "brand": "Chronos",
        "categoryId": "ead74b05-8d74-4a01-929b-06cf1edbb29e",
        "categoryName": "Gaming",
        "price": 699,
        "discountPrice": 649,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1612287233215-680457639538?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 410,
        "createdAt": "2026-09-29T18:34:46.683889Z"
      },
      {
        "id": "060b874c-9a70-44be-87a9-cc601da2f0bb",
        "sku": "SKU-AUD-06",
        "name": "Broadcast XLR Podcast Mic",
        "slug": "broadcast-xlr-podcast-mic",
        "description": "Dynamic cardioid broadcast microphone with internal shockmount and pop filter for radio-ready vocals.",
        "brand": "Vocalis",
        "categoryId": "ab13c946-86a6-45f0-b7df-86582d3b5519",
        "categoryName": "Audio",
        "price": 299,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 220,
        "createdAt": "2026-09-29T18:34:46.683765Z"
      },
      {
        "id": "df88ac25-f11f-44d8-a8fc-181135772402",
        "sku": "SKU-AUD-05",
        "name": "Reference Open-Back Headphones",
        "slug": "reference-open-back-headphones",
        "description": "Studio mixing open-back headphones delivering pristine spatial staging and acoustic transparency.",
        "brand": "Acoustix",
        "categoryId": "ab13c946-86a6-45f0-b7df-86582d3b5519",
        "categoryName": "Audio",
        "price": 499,
        "discountPrice": 449,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 190,
        "createdAt": "2026-09-29T18:34:46.683621Z"
      },
      {
        "id": "7061acb1-4269-4cfc-bdb3-6fa400d42085",
        "sku": "SKU-AUD-04",
        "name": "SoundPulse 360 Bluetooth Speaker",
        "slug": "soundpulse-360-bluetooth-speaker",
        "description": "Rugged IP67 waterproof outdoor speaker with deep bass radiator, party pairing, and 24h battery.",
        "brand": "SoundPulse",
        "categoryId": "ab13c946-86a6-45f0-b7df-86582d3b5519",
        "categoryName": "Audio",
        "price": 149,
        "discountPrice": 119,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 340,
        "createdAt": "2026-09-29T18:34:46.683612Z"
      },
      {
        "id": "e153b2b5-eb52-4b4f-9e63-c8d7a81c6843",
        "sku": "SKU-AUD-03",
        "name": "Cadence Vintage Hi-Fi Turntable",
        "slug": "cadence-vintage-hi-fi-turntable",
        "description": "Belt-driven audiophile turntable with walnut plinth, carbon-fiber tonearm, and Ortofon 2M cartridge.",
        "brand": "Cadence",
        "categoryId": "ab13c946-86a6-45f0-b7df-86582d3b5519",
        "categoryName": "Audio",
        "price": 649,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 115,
        "createdAt": "2026-09-29T18:34:46.683596Z"
      },
      {
        "id": "9610dfa1-a583-4743-a396-25f7598f421b",
        "sku": "SKU-AUD-02",
        "name": "SonicPro True Wireless Earbuds",
        "slug": "sonicpro-true-wireless-earbuds",
        "description": "Adaptive transparency mode, personalized spatial audio with head tracking, and IPX4 case.",
        "brand": "SonicPro",
        "categoryId": "ab13c946-86a6-45f0-b7df-86582d3b5519",
        "categoryName": "Audio",
        "price": 249,
        "discountPrice": 199,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 780,
        "createdAt": "2026-09-29T18:34:46.683582Z"
      },
      {
        "id": "328fd8e9-9d84-47c1-90e6-3aa387ba343a",
        "sku": "SKU-AUD-01",
        "name": "Acoustix ANC Studio Master",
        "slug": "acoustix-anc-studio-master",
        "description": "Industry-leading active noise cancellation, custom 45mm beryllium drivers, and lossless USB-C audio.",
        "brand": "Acoustix",
        "categoryId": "ab13c946-86a6-45f0-b7df-86582d3b5519",
        "categoryName": "Audio",
        "price": 399,
        "discountPrice": 349,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 610,
        "createdAt": "2026-09-29T18:34:46.683565Z"
      },
      {
        "id": "07139347-c2f0-443b-b5c1-79e1766af383",
        "sku": "SKU-LAP-06",
        "name": "NovaBook Air 13 M2",
        "slug": "novabook-air-13-m2",
        "description": "Silent fanless aluminum unibody, MagSafe charging, and vibrant 13.6-inch retina panel.",
        "brand": "NovaBook",
        "categoryId": "e241c2bb-54aa-466e-9e8e-d90927cc9e16",
        "categoryName": "Laptops",
        "price": 1099,
        "discountPrice": 949,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 520,
        "createdAt": "2026-09-29T18:34:46.683471Z"
      },
      {
        "id": "a29711ef-6b04-4252-8635-0bb1401d8c35",
        "sku": "SKU-LAP-05",
        "name": "StudioBook DualScreen Duo",
        "slug": "studiobook-dualscreen-duo",
        "description": "Innovative dual full-width 3K OLED touchscreens designed for music producers and video editors.",
        "brand": "StudioBook",
        "categoryId": "e241c2bb-54aa-466e-9e8e-d90927cc9e16",
        "categoryName": "Laptops",
        "price": 2199,
        "discountPrice": 1999,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.6,
        "reviewCount": 75,
        "createdAt": "2026-09-29T18:34:46.683463Z"
      },
      {
        "id": "d8a6f411-cd47-471d-8fe7-cf8064b7db3f",
        "sku": "SKU-LAP-04",
        "name": "Carbon X1 Executive 14",
        "slug": "carbon-x1-executive-14",
        "description": "The pinnacle of enterprise mobility. Military-spec durability, 5G LTE eSIM, and legendary keyboard.",
        "brand": "Carbon",
        "categoryId": "e241c2bb-54aa-466e-9e8e-d90927cc9e16",
        "categoryName": "Laptops",
        "price": 1699,
        "discountPrice": 1549,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 310,
        "createdAt": "2026-09-29T18:34:46.683448Z"
      },
      {
        "id": "3ded2228-3490-43aa-88ce-db86b9bc963c",
        "sku": "SKU-LAP-03",
        "name": "Vortex Raider Gaming Laptop",
        "slug": "vortex-raider-gaming-laptop",
        "description": "Intel Core i9 14th Gen, RTX 4090 16GB, mechanical RGB keyboard, and 240Hz QHD display.",
        "brand": "Vortex",
        "categoryId": "e241c2bb-54aa-466e-9e8e-d90927cc9e16",
        "categoryName": "Laptops",
        "price": 2899,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 160,
        "createdAt": "2026-09-29T18:34:46.683432Z"
      },
      {
        "id": "0a8ccaa2-bb27-4623-a8ea-ad477fc06fbc",
        "sku": "SKU-LAP-02",
        "name": "Aerolite Ultra 14 OLED",
        "slug": "aerolite-ultra-14-oled",
        "description": "Featherweight magnesium alloy laptop weighing under 1kg with breathtaking 2.8K 120Hz OLED screen.",
        "brand": "Aerolite",
        "categoryId": "e241c2bb-54aa-466e-9e8e-d90927cc9e16",
        "categoryName": "Laptops",
        "price": 1399,
        "discountPrice": 1249,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 215,
        "createdAt": "2026-09-29T18:34:46.683417Z"
      },
      {
        "id": "a0fa5e82-4d9b-467f-9131-063b18851e3c",
        "sku": "SKU-LAP-01",
        "name": "TitanBook Pro 16 M3-Max",
        "slug": "titanbook-pro-16-m3-max",
        "description": "16-inch Liquid Retina XDR display, 36GB unified memory, and 22-hour battery life for creative pros.",
        "brand": "Titan",
        "categoryId": "e241c2bb-54aa-466e-9e8e-d90927cc9e16",
        "categoryName": "Laptops",
        "price": 2499,
        "discountPrice": 2299,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 5,
        "reviewCount": 480,
        "createdAt": "2026-09-29T18:34:46.683401Z"
      },
      {
        "id": "fa85d0ee-5a1d-47ef-b79d-312a3ba8b655",
        "sku": "SKU-PHONE-06",
        "name": "Lumix Mobile Pro Cam",
        "slug": "lumix-mobile-pro-cam",
        "description": "Smartphone designed for cinematographers with 1-inch sensor and physical variable aperture.",
        "brand": "Lumix",
        "categoryId": "3bb2dd22-2bef-4568-8f56-4c07106e6f8c",
        "categoryName": "Smartphones",
        "price": 1299,
        "discountPrice": 1199,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 88,
        "createdAt": "2026-09-29T18:34:46.683394Z"
      },
      {
        "id": "b7bb19f5-27fa-4089-9446-9c72d25576cb",
        "sku": "SKU-PHONE-05",
        "name": "Apex Compact 5G",
        "slug": "apex-compact-5g",
        "description": "Ergonomic one-handed powerhouse with flagship Snapdragon silicon and IP68 waterproof rating.",
        "brand": "Apex",
        "categoryId": "3bb2dd22-2bef-4568-8f56-4c07106e6f8c",
        "categoryName": "Smartphones",
        "price": 599,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.5,
        "reviewCount": 98,
        "createdAt": "2026-09-29T18:34:46.683378Z"
      },
      {
        "id": "c54bb29e-c710-49ab-9748-74a93e7cc130",
        "sku": "SKU-PHONE-04",
        "name": "Veloce 12R Gaming Phone",
        "slug": "veloce-12r-gaming-phone",
        "description": "Liquid-cooled mobile beast with 165Hz AMOLED, dual haptic triggers, and 120W hypercharge.",
        "brand": "Veloce",
        "categoryId": "3bb2dd22-2bef-4568-8f56-4c07106e6f8c",
        "categoryName": "Smartphones",
        "price": 749,
        "discountPrice": 679,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.6,
        "reviewCount": 142,
        "createdAt": "2026-09-29T18:34:46.683363Z"
      },
      {
        "id": "bd2eda26-7807-4870-8fe7-67f6dae9b99c",
        "sku": "SKU-PHONE-03",
        "name": "Pixelate 9 Pro Studio",
        "slug": "pixelate-9-pro-studio",
        "description": "AI-native smartphone with real-time translation, computational photography, and all-day battery.",
        "brand": "Pixelate",
        "categoryId": "3bb2dd22-2bef-4568-8f56-4c07106e6f8c",
        "categoryName": "Smartphones",
        "price": 999,
        "discountPrice": 899,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.8,
        "reviewCount": 290,
        "createdAt": "2026-09-29T18:34:46.683345Z"
      },
      {
        "id": "4b7e66ab-d78a-4498-9bf0-0569593f9ff6",
        "sku": "SKU-PHONE-02",
        "name": "Nova Fold 5 Ultra",
        "slug": "nova-fold-5-ultra",
        "description": "Revolutionary dual-screen foldable phone with ultra-thin glass and multi-tasking desktop mode.",
        "brand": "Nova",
        "categoryId": "3bb2dd22-2bef-4568-8f56-4c07106e6f8c",
        "categoryName": "Smartphones",
        "price": 1799,
        "discountPrice": null,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.7,
        "reviewCount": 185,
        "createdAt": "2026-09-29T18:34:46.683324Z"
      },
      {
        "id": "eb2f3427-df6a-4aea-b46f-7da32c4e70dd",
        "sku": "SKU-PHONE-01",
        "name": "Aura Pro Max 256GB",
        "slug": "aura-pro-max-256gb",
        "description": "Flagship smartphone featuring ceramic shield, 120Hz LTPO display, and 48MP pro camera system.",
        "brand": "Aura",
        "categoryId": "3bb2dd22-2bef-4568-8f56-4c07106e6f8c",
        "categoryName": "Smartphones",
        "price": 1199,
        "discountPrice": 1099,
        "currency": "USD",
        "images": [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"
        ],
        "status": "ACTIVE",
        "rating": 4.9,
        "reviewCount": 320,
        "createdAt": "2026-09-29T18:34:46.683299Z"
      }
    ],
    "pageNumber": 0,
    "pageSize": 60,
    "totalElements": 55,
    "totalPages": 1,
    "last": true
  },
  "timestamp": "2026-10-03T16:10:41.131329Z"
};


import type { VercelRequest, VercelResponse } from '@vercel/node';

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
