import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Fuse from "fuse.js";

export default function ProductRecommender() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Load CSV automatically on component mount
  useEffect(() => {
    loadCSVData();
  }, []);

  const loadCSVData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/data/intern_data_ikarus.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          setProducts(res.data);
          setLoading(false);
          console.log(`Loaded ${res.data.length} products`);
        },
        error: (error) => {
          console.error("Error loading CSV:", error);
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Failed to load CSV file:", error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim() || products.length === 0) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(products, {
      keys: ["title", "description", "categories", "brand"],
      threshold: 0.3,
      includeScore: true,
    });

    const fuseResults = fuse.search(query);
    const filteredResults = fuseResults.map((r) => r.item);

    const finalResults = selectedCategory === "all" 
      ? filteredResults 
      : filteredResults.filter(product => 
          product.categories && product.categories.toLowerCase().includes(selectedCategory.toLowerCase())
        );

    setResults(finalResults);
  };

  const parseImages = (imgField) => {
    if (!imgField) return [];
    
    try {
      const cleanedString = imgField
        .replace(/'/g, '"')
        .replace(/,\s*\]/g, '"]')
        .replace(/,\s*$/g, '')
        .trim();
      
      if (cleanedString.startsWith("[")) {
        const parsed = JSON.parse(cleanedString);
        return Array.isArray(parsed) 
          ? parsed.map(url => url.trim()).filter(url => url.length > 0)
          : [parsed];
      }
    } catch (e) {
      console.log("JSON parse failed, trying alternative parsing");
    }
    
    return imgField.split(",")
      .map(url => url.trim().replace(/'/g, '').replace(/"/g, ''))
      .filter(url => url.length > 0 && url !== "'" && url !== '"');
  };

  const getCategories = () => {
    const allCategories = products.flatMap(p => {
      if (!p.categories) return [];
      try {
        const cleaned = p.categories.replace(/'/g, '"');
        return JSON.parse(cleaned);
      } catch {
        return p.categories.split(',').map(cat => cat.trim());
      }
    });
    
    const uniqueCategories = [...new Set(allCategories)].filter(Boolean);
    return uniqueCategories.slice(0, 10);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSelectedCategory("all");
  };

  // Inline styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      color: 'white',
    },
    header: {
      backgroundColor: '#1f2937',
      borderBottom: '1px solid #374151',
    },
    productCard: {
      backgroundColor: '#1f2937',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #374151',
      transition: 'all 0.3s ease',
    },
    searchInput: {
      width: '100%',
      padding: '16px',
      paddingLeft: '48px',
      borderRadius: '12px',
      backgroundColor: '#374151',
      border: '1px solid #4b5563',
      color: 'white',
    },
    button: {
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      borderRadius: '12px',
      fontWeight: '600',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '24px 16px'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', gap: '16px'}}>
            <div style={{textAlign: 'center'}}>
              <h1 style={{fontSize: '36px', fontWeight: 'bold', background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0}}>
                Product Finder
              </h1>
              <p style={{color: '#9ca3af', marginTop: '8px', margin: 0}}>Discover your perfect products</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
              <div style={{fontSize: '14px', backgroundColor: '#374151', padding: '4px 12px', borderRadius: '20px'}}>
                📊 {products.length} products loaded
              </div>
              {loading && (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div style={{width: '16px', height: '16px', border: '2px solid #3b82f6', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
                  <span style={{fontSize: '14px'}}>Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '32px 16px'}}>
        {/* Search Section */}
        <div style={{maxWidth: '800px', margin: '0 auto 48px'}}>
          <div style={styles.productCard}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px'}}>
              <div style={{flex: 1}}>
                <div style={{position: 'relative'}}>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="What are you looking for? (e.g., office chair, shoe rack, bathroom storage...)"
                    style={styles.searchInput}
                  />
                  <div style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)'}}>
                    🔍
                  </div>
                  {query && (
                    <button
                      onClick={clearSearch}
                      style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer'}}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                style={{
                  ...styles.button,
                  opacity: (loading || !query.trim()) ? 0.5 : 1,
                  cursor: (loading || !query.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                Find Products
              </button>
            </div>

            {/* Categories Filter */}
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              <button
                onClick={() => setSelectedCategory("all")}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  backgroundColor: selectedCategory === "all" ? '#3b82f6' : '#374151',
                  color: selectedCategory === "all" ? 'white' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                All Categories
              </button>
              {getCategories().map((category, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    backgroundColor: selectedCategory === category ? '#8b5cf6' : '#374151',
                    color: selectedCategory === category ? 'white' : '#d1d5db',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results.length > 0 && (
          <div style={{marginBottom: '32px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <h2 style={{fontSize: '24px', fontWeight: 'bold', margin: 0}}>
                Found {results.length} product{results.length !== 1 ? 's' : ''}
              </h2>
              <button
                onClick={clearSearch}
                style={{color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px'}}
              >
                Clear results
              </button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px'}}>
              {results.map((product, index) => {
                const images = parseImages(product.images);
                return (
                  <div
                    key={index}
                    style={{
                      ...styles.productCard,
                      borderColor: '#4b5563',
                    }}
                  >
                    {/* Image Gallery */}
                    <div style={{marginBottom: '16px'}}>
                      {images.length > 0 ? (
                        <div style={{display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px'}}>
                          {images.slice(0, 3).map((url, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={url}
                              alt={product.title}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid #4b5563',
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/80x80/374151/FFFFFF?text=No+Image";
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div style={{width: '100%', height: '128px', backgroundColor: '#374151', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <span style={{color: '#9ca3af'}}>No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <h3 style={{fontWeight: '600', fontSize: '18px', marginBottom: '8px', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                      {product.title}
                    </h3>
                    
                    <p style={{color: '#9ca3af', fontSize: '14px', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0}}>
                      {product.description || "No description available."}
                    </p>

                    {/* Price and Brand */}
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #374151'}}>
                      {product.price && (
                        <span style={{color: '#10b981', fontWeight: 'bold', fontSize: '18px'}}>
                          {product.price}
                        </span>
                      )}
                      {product.brand && (
                        <span style={{fontSize: '14px', color: '#d1d5db', backgroundColor: '#374151', padding: '4px 8px', borderRadius: '4px'}}>
                          {product.brand}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty and Loading States */}
        {!loading && products.length > 0 && results.length === 0 && query && (
          <div style={{textAlign: 'center', padding: '48px 0'}}>
            <div style={{fontSize: '64px', marginBottom: '16px'}}>🔍</div>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '8px'}}>No products found</h3>
            <p style={{color: '#9ca3af'}}>Try different keywords or browse all categories</p>
          </div>
        )}

        {!loading && products.length > 0 && !query && (
          <div style={{textAlign: 'center', padding: '48px 0'}}>
            <div style={{fontSize: '64px', marginBottom: '16px'}}>🚀</div>
            <h3 style={{fontSize: '20px', fontWeight: '600', marginBottom: '8px'}}>Ready to explore?</h3>
            <p style={{color: '#9ca3af'}}>Enter what you're looking for in the search bar above</p>
          </div>
        )}

        {loading && (
          <div style={{textAlign: 'center', padding: '48px 0'}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '16px'}}>
              <div style={{width: '32px', height: '32px', border: '4px solid #3b82f6', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
            </div>
            <p style={{color: '#9ca3af'}}>Loading products...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{backgroundColor: '#1f2937', borderTop: '1px solid #374151', marginTop: '48px'}}>
        <div style={{maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', textAlign: 'center', color: '#9ca3af'}}>
          <p>By sanyam sharma</p>
        </div>
      </footer>

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
