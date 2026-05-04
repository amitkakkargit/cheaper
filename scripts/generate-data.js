const fs = require('fs');
const path = require('path');

const states = [
  { code: 'ap', name: 'Andhra Pradesh', city: 'Vijayawada' },
  { code: 'ar', name: 'Arunachal Pradesh', city: 'Itanagar' },
  { code: 'as', name: 'Assam', city: 'Guwahati' },
  { code: 'br', name: 'Bihar', city: 'Patna' },
  { code: 'ct', name: 'Chhattisgarh', city: 'Raipur' },
  { code: 'ga', name: 'Goa', city: 'Panaji' },
  { code: 'gj', name: 'Gujarat', city: 'Ahmedabad' },
  { code: 'hr', name: 'Haryana', city: 'Gurugram' },
  { code: 'hp', name: 'Himachal Pradesh', city: 'Shimla' },
  { code: 'jh', name: 'Jharkhand', city: 'Ranchi' },
  { code: 'ka', name: 'Karnataka', city: 'Bengaluru' },
  { code: 'kl', name: 'Kerala', city: 'Kochi' },
  { code: 'mp', name: 'Madhya Pradesh', city: 'Bhopal' },
  { code: 'mh', name: 'Maharashtra', city: 'Mumbai' },
  { code: 'mn', name: 'Manipur', city: 'Imphal' },
  { code: 'ml', name: 'Meghalaya', city: 'Shillong' },
  { code: 'mz', name: 'Mizoram', city: 'Aizawl' },
  { code: 'nl', name: 'Nagaland', city: 'Kohima' },
  { code: 'or', name: 'Odisha', city: 'Bhubaneswar' },
  { code: 'pb', name: 'Punjab', city: 'Amritsar' },
  { code: 'rj', name: 'Rajasthan', city: 'Jaipur' },
  { code: 'sk', name: 'Sikkim', city: 'Gangtok' },
  { code: 'tn', name: 'Tamil Nadu', city: 'Chennai' },
  { code: 'tl', name: 'Telangana', city: 'Hyderabad' },
  { code: 'tr', name: 'Tripura', city: 'Agartala' },
  { code: 'up', name: 'Uttar Pradesh', city: 'Lucknow' },
  { code: 'ut', name: 'Uttarakhand', city: 'Dehradun' },
  { code: 'wb', name: 'West Bengal', city: 'Kolkata' },
];

const categories = ['Electronics', 'Home', 'Fashion', 'Vehicles', 'Food', 'Books', 'Sports', 'Garden', 'Mobile', 'Appliances'];
const videoLibrary = {
  Electronics: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  Home: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  Fashion: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  Vehicles: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  Food: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  Books: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  Sports: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  Garden: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  Mobile: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  Appliances: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
};

const itemTemplates = [
  'Smart TV',
  'Wireless Headphones',
  'Coffee Maker',
  'Bike',
  'Sofa Set',
  'Dining Table',
  'Air Fryer',
  'Smartphone',
  'Laptop',
  'Camera',
  'Running Shoes',
  'Backpack',
  'Bluetooth Speaker',
  'Fitness Tracker',
  'Office Chair',
  'Blender',
  'LED Lamp',
  'Gym Set',
  'Guitar',
  'Watch',
];

const imageQueries = {
  'Smart TV': 'smart tv',
  'Wireless Headphones': 'headphones',
  'Coffee Maker': 'coffee maker',
  Bike: 'bike',
  'Sofa Set': 'sofa',
  'Dining Table': 'dining table',
  'Air Fryer': 'air fryer',
  Smartphone: 'smartphone',
  Laptop: 'laptop',
  Camera: 'camera',
  'Running Shoes': 'running shoes',
  Backpack: 'backpack',
  'Bluetooth Speaker': 'bluetooth speaker',
  'Fitness Tracker': 'fitness tracker',
  'Office Chair': 'office chair',
  Blender: 'blender',
  'LED Lamp': 'led lamp',
  'Gym Set': 'gym equipment',
  Guitar: 'guitar',
  Watch: 'watch',
};

const reviewPhrases = [
  'Very happy with the condition and delivery.',
  'Great value for the price.',
  'Exactly as described and works well.',
  'Quick seller response and good packaging.',
  'Lovely product, would buy again.',
  'Nice quality and friendly seller.',
  'Good condition and prompt delivery.',
  'Impressed with how good this item looks.',
  'Recommended for anyone looking for a bargain.',
  'Works perfectly and feels new.',
];

const sellerReviewPhrases = [
  'Friendly seller and smooth pickup.',
  'Good communication and quick reply.',
  'Seller was helpful and honest.',
  'Pickup was easy and product matched the listing.',
  'Very polite and responsive seller.',
  'Nice seller, would recommend.',
  'Great experience buying from this seller.',
  'Product was exactly as advertised, thanks!',
  'Seller made the transaction easy.',
  'Fast and clear communication.',
];

function randomFrom(array, index) {
  return array[index % array.length];
}

function randomBetween(min, max, index) {
  const value = min + ((index * 37) % (max - min + 1));
  return Math.round(value);
}

const sellers = states.map((state) => ({
  id: `s-${state.code}`,
  name: `${state.city} Market`,
  location: `${state.city}, ${state.name}`,
  bio: `Local seller based in ${state.city} offering affordable goods across categories.`,
  avatarUrl: `https://picsum.photos/seed/seller-${state.code}/200/200`,
}));

const products = [];
const productRatings = [];
const sellerRatings = [];
let productId = 1;

states.forEach((state) => {
  for (let i = 1; i <= 100; i += 1) {
    const itemName = randomFrom(itemTemplates, i + state.code.length);
    const category = randomFrom(categories, i + state.code.length);
    const condition = ['New', 'Second-hand', 'Used', 'Refurbished'][i % 4];
    const currentPrice = randomBetween(499, 25999, i + state.code.length);
    const priceDelta = randomBetween(250, Math.max(300, Math.floor(currentPrice * 0.4)), i + state.code.length + 5);
    const previousPrice = currentPrice + priceDelta;
    const discountPercentage = Math.max(5, Math.min(55, Math.round(((previousPrice - currentPrice) / previousPrice) * 100)));
    const description =
      condition === 'New'
        ? `Brand new ${itemName.toLowerCase()} with warranty and ready for delivery in ${state.city}.`
        : `Well-maintained ${itemName.toLowerCase()} priced to sell quickly in ${state.city}. Perfect for buyers who want a great bargain.`;

    const categoryColors = {
      Electronics: 'e8f4f8',
      Home: 'fff7ed',
      Fashion: 'fce7f3',
      Vehicles: 'f3e8ff',
      Food: 'fee2e2',
      Books: 'e0e7ff',
      Sports: 'd1fae5',
      Garden: 'cffafe',
      Mobile: 'ccfbf1',
      Appliances: 'fed7aa',
    };
    const bgColor = categoryColors[category] || 'd1d5db';
    const textColor = '1f2937';
    const imageUrl = `https://fakeimg.pl/900x700/${bgColor.slice(1)}/${textColor.slice(1)}?text=${encodeURIComponent(itemName)}&font=roboto`;
    const videoUrl = videoLibrary[category] || videoLibrary.Home;

    const product = {
      id: `pr-${state.code}-${String(i).padStart(3, '0')}`,
      title: `${itemName} for sale in ${state.city}`,
      description,
      imageUrl,
      videoUrl,
      currentPrice,
      previousPrice,
      discountPercentage: condition === 'New' ? Math.max(discountPercentage, 10) : discountPercentage,
      condition,
      location: `${state.city}, ${state.name}`,
      category,
      sellerId: `s-${state.code}`,
    };

    products.push(product);

    const ratingsCount = randomBetween(1, 5, i + state.code.length);
    for (let r = 1; r <= ratingsCount; r += 1) {
      const score = parseFloat((3.5 + ((i * r * 13) % 15) * 0.1).toFixed(1));
      productRatings.push({
        id: `pr-rate-${product.id}-${r}`,
        targetId: product.id,
        score: Math.min(5, Math.max(3.5, score)),
        review: randomFrom(reviewPhrases, i + r),
      });
    }

    productId += 1;
  }
});

sellers.forEach((seller, index) => {
  const sellerRatingCount = randomBetween(3, 7, index + 5);
  for (let r = 1; r <= sellerRatingCount; r += 1) {
    const score = parseFloat((3.8 + ((index * r * 11) % 12) * 0.1).toFixed(1));
    sellerRatings.push({
      id: `sr-${seller.id}-${r}`,
      targetId: seller.id,
      score: Math.min(5, Math.max(3.7, score)),
      review: randomFrom(sellerReviewPhrases, index + r),
    });
  }
});

fs.writeFileSync(path.join(__dirname, '../data/sellers.json'), JSON.stringify(sellers, null, 2));
fs.writeFileSync(path.join(__dirname, '../data/products.json'), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(__dirname, '../data/productRatings.json'), JSON.stringify(productRatings, null, 2));
fs.writeFileSync(path.join(__dirname, '../data/sellerRatings.json'), JSON.stringify(sellerRatings, null, 2));

console.log(`Generated ${products.length} products and ${sellers.length} sellers.`);
