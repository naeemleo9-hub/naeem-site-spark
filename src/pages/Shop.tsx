import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ExternalLink, ShoppingCart, Tag, Star, Filter, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import productDigestor from '@/assets/product-digestor.jpg';

const products = [
  {
    id: 1,
    name: 'Digestor 24 Pro',
    description: 'Advanced digital productivity suite with AI-powered automation features.',
    price: 49.99,
    originalPrice: 79.99,
    image: productDigestor,
    category: 'Software',
    rating: 4.9,
    featured: true,
  },
  {
    id: 2,
    name: 'Digestor 24 Lite',
    description: 'Essential productivity tools for everyday tasks and workflows.',
    price: 29.99,
    originalPrice: 39.99,
    image: productDigestor,
    category: 'Software',
    rating: 4.7,
    featured: false,
  },
  {
    id: 3,
    name: 'Digestor 24 Enterprise',
    description: 'Complete business solution with team collaboration and analytics.',
    price: 99.99,
    originalPrice: 149.99,
    image: productDigestor,
    category: 'Business',
    rating: 4.8,
    featured: true,
  },
  {
    id: 4,
    name: 'Digestor 24 Student',
    description: 'Perfect for students with special pricing and educational features.',
    price: 14.99,
    originalPrice: 24.99,
    image: productDigestor,
    category: 'Education',
    rating: 4.6,
    featured: false,
  },
];

const blogPosts = [
  {
    id: 1,
    title: 'Getting Started with AI-Powered Productivity',
    excerpt: 'Learn how to leverage AI tools to boost your daily productivity and streamline your workflow.',
    date: 'January 5, 2026',
    category: 'Tips & Tricks',
  },
  {
    id: 2,
    title: 'Top 10 Features of Digestor 24',
    excerpt: 'Discover the powerful features that make Digestor 24 the ultimate productivity solution.',
    date: 'January 3, 2026',
    category: 'Product Updates',
  },
];

const Shop = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Software', 'Business', 'Education'];

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Digestor 24 Products",
    "description": "Browse our Digestor 24 product lineup for digital productivity solutions.",
    "url": "https://naeemonlinestore.com/shop",
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": `https://naeemonlinestore.com${product.image}`,
        "category": product.category,
        "offers": {
          "@type": "Offer",
          "price": product.price,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": product.rating,
          "bestRating": 5,
          "worstRating": 1,
          "ratingCount": Math.floor(Math.random() * 500) + 100
        }
      }
    }))
  };

  return (
    <Layout>
      <Helmet>
        <title>Shop - Digestor 24 Products | Naeem Online Store</title>
        <meta name="description" content="Browse our Digestor 24 product lineup. Find the perfect digital productivity solution for your needs at Naeem Online Store." />
        <link rel="canonical" href="https://naeemonlinestore.com/shop" />
        <meta property="og:title" content="Shop - Digestor 24 Products | Naeem Online Store" />
        <meta property="og:description" content="Browse our Digestor 24 product lineup. Find the perfect digital productivity solution for your needs." />
        <meta property="og:url" content="https://naeemonlinestore.com/shop" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-google-blue via-google-red to-google-yellow py-16 sm:py-20">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-primary-foreground mb-4"
          >
            Shop Our Products
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary-foreground/80 text-lg max-w-2xl mx-auto"
          >
            Discover our premium Digestor 24 product line and digital solutions
          </motion.p>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding">
        <div className="container-custom">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-muted-foreground" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card rounded-2xl overflow-hidden border border-border card-hover ${
                  viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                }`}
              >
                {/* Product Image */}
                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'sm:w-48 h-48 sm:h-auto' : 'aspect-square'}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  {product.featured && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-google-yellow text-foreground text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                  {product.originalPrice > product.price && (
                    <span className="absolute top-3 right-3 px-3 py-1 bg-google-red text-primary-foreground text-xs font-semibold rounded-full">
                      Sale
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{product.category}</span>
                  <h3 className="font-heading font-semibold text-lg mt-1 mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-4 h-4 fill-google-yellow text-google-yellow" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-bold text-google-blue">${product.price}</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" className="flex-1">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Buy Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Latest Blog Posts</h2>
            <p className="text-muted-foreground">Stay updated with tips, news, and product updates</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-google-blue/10 text-google-blue text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-muted-foreground">{post.date}</span>
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3">{post.title}</h3>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <Button variant="link" className="p-0">
                  Read More <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
