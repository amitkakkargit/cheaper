const fs = require('fs');

const products = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));

products.forEach(product => {
  // Random lat lng for India
  product.latitude = 8.4 + Math.random() * (37.6 - 8.4);
  product.longitude = 68.7 + Math.random() * (97.25 - 68.7);
  // Change imageUrl to imageUrls
  product.imageUrls = [product.imageUrl];
  delete product.imageUrl;
});

fs.writeFileSync('data/products.json', JSON.stringify(products, null, 2));