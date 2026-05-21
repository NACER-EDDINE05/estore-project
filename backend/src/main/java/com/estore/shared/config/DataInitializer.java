package com.estore.shared.config;

import com.estore.billing.entity.Order;
import com.estore.billing.entity.OrderItem;
import com.estore.billing.repository.OrderRepository;
import com.estore.catalog.entity.Category;
import com.estore.catalog.entity.Product;
import com.estore.catalog.repository.CategoryRepository;
import com.estore.catalog.repository.ProductRepository;
import com.estore.customer.entity.Profile;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.shopping.entity.Cart;
import com.estore.shopping.entity.CartItem;
import com.estore.shopping.repository.CartRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           CartRepository cartRepository,
                           OrderRepository orderRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        log.info("Initializing demo data...");

        User admin = createUser("Admin", "User", "admin@estore.com", "ADMIN");
        User user1 = createUser("Omar", "Zahour", "omar@test.com", "USER");
        User user2 = createUser("Fatima", "Alami", "fatima@test.com", "USER");

        // ── Parent Categories ──
        Category mobileTech = createCategory("Mobile & Personal Tech", "Smartphones, tablets, and wearables", null);
        Category audioSound = createCategory("Audio & Sound", "Headphones, earbuds, and speakers", null);
        Category computing = createCategory("Computing", "Laptops, monitors, and PC accessories", null);
        Category smartHome = createCategory("Smart Home", "Home automation, security, and lighting", null);

        // ── Subcategories ──
        Category smartphones = createCategory("Smartphones", "Flagship and budget smartphones", mobileTech);
        Category wearables = createCategory("Wearables", "Smartwatches and fitness trackers", mobileTech);
        Category tablets = createCategory("Tablets", "Tablets and e-readers", mobileTech);

        Category headphones = createCategory("Headphones", "Over-ear noise-cancelling headphones", audioSound);
        Category earbuds = createCategory("Earbuds", "True wireless earbuds", audioSound);
        Category speakers = createCategory("Speakers", "Portable and home speakers", audioSound);

        Category laptops = createCategory("Laptops", "High-performance and ultralight laptops", computing);
        Category accessories = createCategory("PC Accessories", "Mice, keyboards, and webcams", computing);

        Category security = createCategory("Security Cameras", "Smart doorbells and home security", smartHome);
        Category lighting = createCategory("Smart Lighting", "Smart bulbs and LED strips", smartHome);

        // ── Products: Smartphones ──
        createProduct("Apple iPhone 15 Pro Max", 1199.99, "A17 Pro chip, Titanium design, 48MP camera system",
                "", smartphones, 45);
        createProduct("Samsung Galaxy S24 Ultra", 1299.99, "Snapdragon 8 Gen 3, S-Pen, 200MP camera",
                "", smartphones, 30);
        createProduct("Google Pixel 8 Pro", 999.99, "Tensor G3, Advanced AI photography, Super Actua display",
                "", smartphones, 25);

        // ── Products: Wearables ──
        createProduct("Apple Watch Ultra 2", 799.99, "Rugged titanium case, bright display, advanced fitness tracking",
                "", wearables, 20);
        createProduct("Garmin Fenix 7X Pro", 899.99, "Multisport GPS watch with solar charging",
                "", wearables, 15);
        createProduct("Samsung Galaxy Watch 6 Classic", 399.99, "Rotating bezel, advanced health monitoring",
                "", wearables, 35);

        // ── Products: Tablets ──
        createProduct("Apple iPad Pro 12.9 (M2)", 1099.99, "M2 chip, Liquid Retina XDR display, Apple Pencil support",
                "", tablets, 22);
        createProduct("Samsung Galaxy Tab S9 Ultra", 1199.99, "14.6-inch AMOLED display, Snapdragon 8 Gen 2",
                "", tablets, 18);

        // ── Products: Headphones ──
        createProduct("Sony WH-1000XM5", 398.00, "Industry-leading noise cancellation, 30-hour battery",
                "", headphones, 50);
        createProduct("Bose QuietComfort Ultra", 429.00, "Immersive spatial audio, world-class ANC",
                "", headphones, 40);
        createProduct("Sennheiser Momentum 4", 349.95, "Audiophile-inspired sound, 60-hour battery life",
                "", headphones, 25);

        // ── Products: Earbuds ──
        createProduct("Apple AirPods Pro (2nd Gen)", 249.00, "H2 chip, excellent noise cancellation, MagSafe charging",
                "", earbuds, 100);
        createProduct("Sony WF-1000XM5", 298.00, "Premium noise-cancelling true wireless earbuds",
                "", earbuds, 45);

        // ── Products: Speakers ──
        createProduct("Sonos Era 300", 449.00, "Spatial audio smart speaker with Dolby Atmos",
                "", speakers, 20);
        createProduct("JBL Charge 5", 149.95, "Portable waterproof Bluetooth speaker with powerbank",
                "", speakers, 80);

        // ── Products: Laptops ──
        createProduct("Apple MacBook Pro 14 (M3)", 1599.00, "M3 chip, Liquid Retina XDR display, long battery life",
                "", laptops, 15);
        createProduct("Dell XPS 15", 1499.00, "15.6-inch OLED laptop, Intel Core i7, NVIDIA RTX 4050",
                "", laptops, 20);
        createProduct("Lenovo ThinkPad X1 Carbon Gen 11", 1699.00, "Premium ultralight business laptop",
                "", laptops, 12);

        // ── Products: PC Accessories ──
        createProduct("Logitech MX Master 3S", 99.99, "Advanced wireless mouse with quiet clicks",
                "", accessories, 60);
        createProduct("Keychron Q1 Pro", 199.00, "Wireless custom mechanical keyboard, aluminum body",
                "", accessories, 30);

        // ── Products: Smart Home ──
        createProduct("Google Nest Hub Max", 229.00, "Smart display with Google Assistant and security camera",
                "", smartHome, 25);
        createProduct("Ring Video Doorbell Pro 2", 249.99, "Premium wired video doorbell with 3D motion detection",
                "", security, 40);
        createProduct("Philips Hue Starter Kit", 199.99, "Color smart bulbs and Hue Bridge",
                "", lighting, 50);

        // ── Demo Cart for user1 ──
        if (cartRepository.findByUserId(user1.getId()).isEmpty()) {
            Product demoProduct = productRepository.findByName("Apple iPhone 15 Pro Max").orElse(null);
            if (demoProduct != null) {
                Cart cart1 = new Cart();
                cart1.setUser(user1);
                cart1.setCreatedAt(LocalDateTime.now());
                cart1 = cartRepository.save(cart1);

                CartItem ci1 = new CartItem();
                ci1.setProduct(demoProduct);
                ci1.setQuantity(1);
                ci1.setUnitPrice(demoProduct.getPrice());
                ci1.setCart(cart1);
                cart1.setItems(List.of(ci1));
                cartRepository.save(cart1);
            }
        }

        log.info("Demo data initialized successfully!");
        log.info("Accounts: admin@estore.com / admin123, omar@test.com / user123, fatima@test.com / user123");
    }

    private User createUser(String first, String last, String email, String role) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email).get();
        }
        String password = role.equals("ADMIN") ? "admin123" : "user123";
        User user = User.builder()
                .firstName(first)
                .lastName(last)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(role)
                .build();
        Profile profile = Profile.builder()
                .user(user)
                .phone("+212600000000")
                .address("123 Demo Street")
                .city("Casablanca")
                .country("Morocco")
                .build();
        user.setProfile(profile);
        return userRepository.save(user);
    }

    private Category createCategory(String name, String description, Category parent) {
        if (categoryRepository.findByName(name).isPresent()) {
            return categoryRepository.findByName(name).get();
        }
        Category category = Category.builder()
                .name(name)
                .description(description)
                .parent(parent)
                .build();
        return categoryRepository.save(category);
    }

    private Product createProduct(String name, Double price, String desc, String imageUrl, Category category, Integer stock) {
        if (productRepository.findByName(name).isPresent()) {
            return productRepository.findByName(name).get();
        }
        Product product = Product.builder()
                .name(name)
                .price(price)
                .description(desc)
                .imageUrl(imageUrl)
                .category(category)
                .stock(stock)
                .build();
        return productRepository.save(product);
    }
}