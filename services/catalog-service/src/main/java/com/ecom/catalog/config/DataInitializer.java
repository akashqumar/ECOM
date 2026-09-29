package com.ecom.catalog.config;

import com.ecom.catalog.entity.Category;
import com.ecom.catalog.entity.Product;
import com.ecom.catalog.repository.CategoryRepository;
import com.ecom.catalog.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataInitializer(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Catalog database already seeded. Skipping initial seeding.");
            return;
        }

        log.info("Seeding Catalog Database with 10 categories and 50+ premium products...");

        // 1. Create 10 Categories
        Map<String, Category> categories = new HashMap<>();
        String[][] categoryDefs = {
                {"Smartphones", "smartphones", "Flagship, foldable, and performance mobile devices"},
                {"Laptops", "laptops", "Ultrabooks, workstation, and mobile computing laptops"},
                {"Audio", "audio", "Audiophile headphones, wireless earbuds, and studio monitors"},
                {"Gaming", "gaming", "Next-gen consoles, mechanical keyboards, and gaming gear"},
                {"Wearables", "wearables", "Smartwatches, fitness bands, and wearable tech"},
                {"Cameras", "cameras", "Mirrorless cameras, prime lenses, and cinema gear"},
                {"Monitors", "monitors", "Ultra-wide 4K HDR displays and OLED gaming monitors"},
                {"Accessories", "accessories", "Chargers, hubs, premium cables, and desk mats"},
                {"Home Office", "home-office", "Ergonomic chairs, standing desks, and ambient lighting"},
                {"Storage", "storage", "High-speed NVMe SSDs, external enclosures, and NAS arrays"}
        };

        for (String[] def : categoryDefs) {
            Category c = new Category(def[0], def[1], def[2], null);
            categories.put(def[1], categoryRepository.save(c));
        }

        // 2. Create 50+ Products
        List<Product> products = new ArrayList<>();

        // Helper record for product specification
        record P(String sku, String name, String slug, String desc, String brand, String cat,
                 double price, Double discount, String img, double rating, int reviews) {}

        List<P> items = List.of(
                // Smartphones (1-6)
                new P("SKU-PHONE-01", "Aura Pro Max 256GB", "aura-pro-max-256gb",
                        "Flagship smartphone featuring ceramic shield, 120Hz LTPO display, and 48MP pro camera system.",
                        "Aura", "smartphones", 1199.00, 1099.00, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80", 4.9, 320),
                new P("SKU-PHONE-02", "Nova Fold 5 Ultra", "nova-fold-5-ultra",
                        "Revolutionary dual-screen foldable phone with ultra-thin glass and multi-tasking desktop mode.",
                        "Nova", "smartphones", 1799.00, null, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80", 4.7, 185),
                new P("SKU-PHONE-03", "Pixelate 9 Pro Studio", "pixelate-9-pro-studio",
                        "AI-native smartphone with real-time translation, computational photography, and all-day battery.",
                        "Pixelate", "smartphones", 999.00, 899.00, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80", 4.8, 290),
                new P("SKU-PHONE-04", "Veloce 12R Gaming Phone", "veloce-12r-gaming-phone",
                        "Liquid-cooled mobile beast with 165Hz AMOLED, dual haptic triggers, and 120W hypercharge.",
                        "Veloce", "smartphones", 749.00, 679.00, "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80", 4.6, 142),
                new P("SKU-PHONE-05", "Apex Compact 5G", "apex-compact-5g",
                        "Ergonomic one-handed powerhouse with flagship Snapdragon silicon and IP68 waterproof rating.",
                        "Apex", "smartphones", 599.00, null, "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80", 4.5, 98),
                new P("SKU-PHONE-06", "Lumix Mobile Pro Cam", "lumix-mobile-pro-cam",
                        "Smartphone designed for cinematographers with 1-inch sensor and physical variable aperture.",
                        "Lumix", "smartphones", 1299.00, 1199.00, "https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=800&auto=format&fit=crop&q=80", 4.7, 88),

                // Laptops (7-12)
                new P("SKU-LAP-01", "TitanBook Pro 16 M3-Max", "titanbook-pro-16-m3-max",
                        "16-inch Liquid Retina XDR display, 36GB unified memory, and 22-hour battery life for creative pros.",
                        "Titan", "laptops", 2499.00, 2299.00, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80", 5.0, 480),
                new P("SKU-LAP-02", "Aerolite Ultra 14 OLED", "aerolite-ultra-14-oled",
                        "Featherweight magnesium alloy laptop weighing under 1kg with breathtaking 2.8K 120Hz OLED screen.",
                        "Aerolite", "laptops", 1399.00, 1249.00, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80", 4.8, 215),
                new P("SKU-LAP-03", "Vortex Raider Gaming Laptop", "vortex-raider-gaming-laptop",
                        "Intel Core i9 14th Gen, RTX 4090 16GB, mechanical RGB keyboard, and 240Hz QHD display.",
                        "Vortex", "laptops", 2899.00, null, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80", 4.9, 160),
                new P("SKU-LAP-04", "Carbon X1 Executive 14", "carbon-x1-executive-14",
                        "The pinnacle of enterprise mobility. Military-spec durability, 5G LTE eSIM, and legendary keyboard.",
                        "Carbon", "laptops", 1699.00, 1549.00, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80", 4.7, 310),
                new P("SKU-LAP-05", "StudioBook DualScreen Duo", "studiobook-dualscreen-duo",
                        "Innovative dual full-width 3K OLED touchscreens designed for music producers and video editors.",
                        "StudioBook", "laptops", 2199.00, 1999.00, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80", 4.6, 75),
                new P("SKU-LAP-06", "NovaBook Air 13 M2", "novabook-air-13-m2",
                        "Silent fanless aluminum unibody, MagSafe charging, and vibrant 13.6-inch retina panel.",
                        "NovaBook", "laptops", 1099.00, 949.00, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80", 4.9, 520),

                // Audio (13-18)
                new P("SKU-AUD-01", "Acoustix ANC Studio Master", "acoustix-anc-studio-master",
                        "Industry-leading active noise cancellation, custom 45mm beryllium drivers, and lossless USB-C audio.",
                        "Acoustix", "audio", 399.00, 349.00, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", 4.9, 610),
                new P("SKU-AUD-02", "SonicPro True Wireless Earbuds", "sonicpro-true-wireless-earbuds",
                        "Adaptive transparency mode, personalized spatial audio with head tracking, and IPX4 case.",
                        "SonicPro", "audio", 249.00, 199.00, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80", 4.8, 780),
                new P("SKU-AUD-03", "Cadence Vintage Hi-Fi Turntable", "cadence-vintage-hi-fi-turntable",
                        "Belt-driven audiophile turntable with walnut plinth, carbon-fiber tonearm, and Ortofon 2M cartridge.",
                        "Cadence", "audio", 649.00, null, "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80", 4.9, 115),
                new P("SKU-AUD-04", "SoundPulse 360 Bluetooth Speaker", "soundpulse-360-bluetooth-speaker",
                        "Rugged IP67 waterproof outdoor speaker with deep bass radiator, party pairing, and 24h battery.",
                        "SoundPulse", "audio", 149.00, 119.00, "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80", 4.7, 340),
                new P("SKU-AUD-05", "Reference Open-Back Headphones", "reference-open-back-headphones",
                        "Studio mixing open-back headphones delivering pristine spatial staging and acoustic transparency.",
                        "Acoustix", "audio", 499.00, 449.00, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80", 4.8, 190),
                new P("SKU-AUD-06", "Broadcast XLR Podcast Mic", "broadcast-xlr-podcast-mic",
                        "Dynamic cardioid broadcast microphone with internal shockmount and pop filter for radio-ready vocals.",
                        "Vocalis", "audio", 299.00, null, "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80", 4.8, 220),

                // Gaming (19-24)
                new P("SKU-GAME-01", "Chronos Handheld OLED Console", "chronos-handheld-oled-console",
                        "Portable PC gaming console powered by AMD Ryzen Z1 Extreme, 7-inch 120Hz VRR touch panel.",
                        "Chronos", "gaming", 699.00, 649.00, "https://images.unsplash.com/photo-1612287233215-680457639538?w=800&auto=format&fit=crop&q=80", 4.8, 410),
                new P("SKU-GAME-02", "HyperStrike Optical Keyboard", "hyperstrike-optical-keyboard",
                        "Hot-swappable magnetic analog switches, sound-dampening foam, per-key RGB, and PBT keycaps.",
                        "HyperStrike", "gaming", 199.00, 169.00, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80", 4.7, 280),
                new P("SKU-GAME-03", "Viper Elite Ultralight Wireless Mouse", "viper-elite-ultralight-wireless-mouse",
                        "49g honeycomb shell, 30,000 DPI sensor, 4000Hz polling rate, and zero-latency wireless.",
                        "HyperStrike", "gaming", 129.00, 99.00, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80", 4.9, 540),
                new P("SKU-GAME-04", "Apex Flight Simulator Yoke", "apex-flight-simulator-yoke",
                        "Hall-effect magnetic sensors, steel shaft, integrated throttle quadrant with realistic detents.",
                        "ApexSim", "gaming", 349.00, null, "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80", 4.6, 68),
                new P("SKU-GAME-05", "Arcade Pro Custom Fightstick", "arcade-pro-custom-fightstick",
                        "Authentic Sanwa Denshi joystick and buttons, tournament lock switch, and aluminum casing.",
                        "HyperStrike", "gaming", 229.00, 199.00, "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=80", 4.7, 95),
                new P("SKU-GAME-06", "Immersion VR Pro Headset", "immersion-vr-pro-headset",
                        "Dual 4K micro-OLED pancake optics, inside-out eye tracking, and haptic feedback controllers.",
                        "Immersion", "gaming", 999.00, 899.00, "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80", 4.8, 175),

                // Wearables (25-30)
                new P("SKU-WEAR-01", "Titan Watch Ultra 2 Titanium", "titan-watch-ultra-2-titanium",
                        "Aerospace titanium case, 3000 nits sapphire display, dual-frequency GPS, and 100m water resistance.",
                        "Titan", "wearables", 799.00, 749.00, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", 4.9, 430),
                new P("SKU-WEAR-02", "Aura Fitness Tracker Ring Gen3", "aura-fitness-tracker-ring-gen3",
                        "Subtle titanium smart ring tracking sleep stages, readiness score, HRV, and body temperature.",
                        "Aura", "wearables", 299.00, 269.00, "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80", 4.6, 210),
                new P("SKU-WEAR-03", "Veloce Sport GPS Smartwatch", "veloce-sport-gps-smartwatch",
                        "Solar charging bezel, topographic offline maps, heart rate zones, and 28-day battery life.",
                        "Veloce", "wearables", 499.00, null, "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80", 4.8, 190),
                new P("SKU-WEAR-04", "Luxe Hybrid Mechanical Smartwatch", "luxe-hybrid-mechanical-smartwatch",
                        "Swiss mechanical analog hands layered over an e-ink display with discreet notification haptics.",
                        "Luxe", "wearables", 349.00, 299.00, "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80", 4.5, 78),
                new P("SKU-WEAR-05", "PulsePro ECG Chest Band", "pulsepro-ecg-chest-band",
                        "Medical-grade optical & electrical heart rate strap for high-intensity training intervals.",
                        "PulsePro", "wearables", 119.00, 99.00, "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&auto=format&fit=crop&q=80", 4.7, 130),
                new P("SKU-WEAR-06", "Smart Vision Audio Glasses", "smart-vision-audio-glasses",
                        "Polarized sunglasses with directional open-ear audio, voice assistant, and ultra-light frame.",
                        "Nova", "wearables", 199.00, 159.00, "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80", 4.4, 92),

                // Cameras (31-36)
                new P("SKU-CAM-01", "Lumix Alpha Cinema 8K Mirrorless", "lumix-alpha-cinema-8k-mirrorless",
                        "Full-frame 45MP stacked BSI sensor, internal 8K ProRes RAW, 5-axis sensor-shift stabilization.",
                        "Lumix", "cameras", 3899.00, 3599.00, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80", 5.0, 140),
                new P("SKU-CAM-02", "RetroRangefinder 35mm Digital", "retrorangefinder-35mm-digital",
                        "Classic brass and leather body with tactile shutter dial, optical viewfinder, and film simulations.",
                        "Vintage", "cameras", 1699.00, null, "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80", 4.8, 85),
                new P("SKU-CAM-03", "Prime 50mm f/1.2 Master Lens", "prime-50mm-f12-master-lens",
                        "Ultra-fast aperture portrait lens with circular 11-blade diaphragm for dreamy bokeh rendering.",
                        "Lumix", "cameras", 1499.00, 1349.00, "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&auto=format&fit=crop&q=80", 4.9, 110),
                new P("SKU-CAM-04", "Acrobat 360 Action Cam 4K", "acrobat-360-action-cam-4k",
                        "Waterproof 360-degree action camera with invisible selfie stick algorithm and FlowState leveling.",
                        "Acrobat", "cameras", 449.00, 399.00, "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80", 4.6, 230),
                new P("SKU-CAM-05", "Gimbal Ronin 3-Axis Stabilizer", "gimbal-ronin-3-axis-stabilizer",
                        "Automated axis locks, carbon fiber arms, 4.5kg payload support, and wireless focus motor.",
                        "Lumix", "cameras", 599.00, 529.00, "https://images.unsplash.com/photo-1589872765306-037149a40590?w=800&auto=format&fit=crop&q=80", 4.8, 160),
                new P("SKU-CAM-06", "AeroDrone 4K Folding Quadcopter", "aerodrone-4k-folding-quadcopter",
                        "Omnidirectional obstacle sensing, 45-minute flight time, and 1/1.3-inch HDR camera.",
                        "AeroDrone", "cameras", 899.00, 799.00, "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80", 4.9, 310),

                // Monitors (37-41)
                new P("SKU-MON-01", "VisionMaster 49 Ultra-Wide OLED", "visionmaster-49-ultra-wide-oled",
                        "49-inch 32:9 dual QHD 240Hz curved OLED monitor with 0.03ms response time and KVM switch.",
                        "VisionMaster", "monitors", 1299.00, 1149.00, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80", 4.9, 215),
                new P("SKU-MON-02", "ProColor 32 4K Mini-LED Studio", "procolor-32-4k-mini-led-studio",
                        "1,152 dimming zones, 1600 nits peak HDR brightness, 99% Adobe RGB coverage for color grading.",
                        "ProColor", "monitors", 1599.00, 1449.00, "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=80", 4.8, 98),
                new P("SKU-MON-03", "ApexSpeed 27 360Hz Esports", "apexspeed-27-360hz-esports",
                        "Fast IPS panel tuned for competitive FPS games with motion blur reduction and ergonomic stand.",
                        "Apex", "monitors", 499.00, 429.00, "https://images.unsplash.com/photo-1586775490184-b79f0621891f?w=800&auto=format&fit=crop&q=80", 4.7, 180),
                new P("SKU-MON-04", "Canvas 27 Ergonomic 4K Touch", "canvas-27-ergonomic-4k-touch",
                        "Direct-pen input monitor with 4096 pressure levels, anti-glare etching, and zero-gravity hinge.",
                        "Canvas", "monitors", 899.00, null, "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80", 4.6, 65),
                new P("SKU-MON-05", "Portable 16 2K OLED Travel Monitor", "portable-16-2k-oled-travel-monitor",
                        "600g magnetic cover display powered via single USB-C cable for dual-screen productivity anywhere.",
                        "Aerolite", "monitors", 349.00, 299.00, "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&auto=format&fit=crop&q=80", 4.7, 140),

                // Accessories (42-46)
                new P("SKU-ACC-01", "ThunderBolt 4 HyperDock 14-in-1", "thunderbolt-4-hyperdock-14-in-1",
                        "Single 40Gbps cable delivers dual 4K 60Hz displays, 100W Power Delivery, SD 4.0, and 2.5GbE.",
                        "HyperDock", "accessories", 249.00, 199.00, "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80", 4.8, 380),
                new P("SKU-ACC-02", "MagStand 3-in-1 Wireless Charger", "magstand-3-in-1-wireless-charger",
                        "Weighted aluminum base charges phone, smartwatch, and wireless earbuds concurrently at 15W.",
                        "Titan", "accessories", 129.00, 99.00, "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&auto=format&fit=crop&q=80", 4.9, 520),
                new P("SKU-ACC-03", "GaN Prime 140W Travel Charger", "gan-prime-140w-travel-charger",
                        "Compact Gallium Nitride fast charger with 3x USB-C and 1x USB-A ports with dynamic load sharing.",
                        "VoltPro", "accessories", 89.00, 69.00, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80", 4.9, 640),
                new P("SKU-ACC-04", "Merino Wool Vegan Leather Desk Mat", "merino-wool-vegan-leather-desk-mat",
                        "Double-sided water-resistant workspace pad with anti-fray stitching and magnetic cable organizers.",
                        "DeskCraft", "accessories", 59.00, 45.00, "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800&auto=format&fit=crop&q=80", 4.7, 210),
                new P("SKU-ACC-05", "4K HDR Streaming Capture Card", "4k-hdr-streaming-capture-card",
                        "Zero-lag passthrough up to 4K 144Hz with hardware AV1/HEVC encoding and OBS plug-and-play.",
                        "HyperStrike", "accessories", 179.00, 149.00, "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&auto=format&fit=crop&q=80", 4.7, 130),

                // Home Office (47-51)
                new P("SKU-HOME-01", "AeroChair Ergonomic Mesh Task Chair", "aerochair-ergonomic-mesh-task-chair",
                        "Dynamic lumbar response, breathable elastomeric mesh, 4D armrests, and 12-year warranty.",
                        "AeroForm", "home-office", 799.00, 699.00, "https://images.unsplash.com/photo-1580481077195-c3c3a9d56f67?w=800&auto=format&fit=crop&q=80", 4.9, 410),
                new P("SKU-HOME-02", "Solid Walnut Dual-Motor Standing Desk", "solid-walnut-dual-motor-standing-desk",
                        "1.5-inch solid American walnut tabletop, whisper-quiet collision-detection motors, 4 presets.",
                        "DeskCraft", "home-office", 999.00, 899.00, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80", 4.8, 185),
                new P("SKU-HOME-03", "ScreenBar Halo Smart Monitor Light", "screenbar-halo-smart-monitor-light",
                        "Asymmetric optical design prevents screen glare, wireless rotary control knob, auto-dimming.",
                        "DeskCraft", "home-office", 169.00, 139.00, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80", 4.8, 310),
                new P("SKU-HOME-04", "Kevlar Acoustic Desk Divider Screen", "kevlar-acoustic-desk-divider-screen",
                        "Sound-absorbing PET felt partition panel reducing echo and visual clutter in open floorplans.",
                        "DeskCraft", "home-office", 129.00, null, "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80", 4.5, 55),
                new P("SKU-HOME-05", "Minimalist Aluminum Laptop Riser", "minimalist-aluminum-laptop-riser",
                        "Sandblasted space-gray ergonomic stand promoting airflow and posture alignment.",
                        "DeskCraft", "home-office", 49.00, 39.00, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80", 4.7, 360),

                // Storage (52-55)
                new P("SKU-STOR-01", "FastNVMe 4TB PCIe Gen5 SSD", "fastnvme-4tb-pcie-gen5-ssd",
                        "Blistering sequential speeds up to 14,500 MB/s with extruded aluminum heatsink and DRAM cache.",
                        "FastDrive", "storage", 499.00, 439.00, "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80", 4.9, 290),
                new P("SKU-STOR-02", "Rugged Armor 2TB Portable SSD", "rugged-armor-2tb-portable-ssd",
                        "Drop-tested to 3 meters, IP65 dust/water resistance, and USB 3.2 Gen 2x2 2000 MB/s transfer.",
                        "FastDrive", "storage", 199.00, 169.00, "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80", 4.8, 480),
                new P("SKU-STOR-03", "Vault 4-Bay Network Attached Storage", "vault-4-bay-network-attached-storage",
                        "Quad-core Intel Celeron CPU, dual 2.5GbE ports, M.2 SSD caching slots, and automated backup.",
                        "DataVault", "storage", 549.00, 489.00, "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80", 4.7, 140),
                new P("SKU-STOR-04", "Pro CFexpress Type B 512GB", "pro-cfexpress-type-b-512gb",
                        "Sustained minimum write speed of 1400 MB/s for continuous 8K RAW cinema camera recording.",
                        "FastDrive", "storage", 299.00, 249.00, "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&auto=format&fit=crop&q=80", 4.9, 75)
        );

        for (P item : items) {
            Category cat = categories.get(item.cat());
            String catId = cat != null ? cat.getId() : categories.values().iterator().next().getId();
            Product product = new Product(
                    item.sku(),
                    item.name(),
                    item.slug(),
                    item.desc(),
                    item.brand(),
                    catId,
                    BigDecimal.valueOf(item.price()),
                    item.discount() != null ? BigDecimal.valueOf(item.discount()) : null,
                    List.of(item.img()),
                    BigDecimal.valueOf(item.rating()),
                    item.reviews()
            );
            products.add(product);
        }

        productRepository.saveAll(products);
        log.info("Successfully seeded {} products across 10 categories!", products.size());
    }
}
