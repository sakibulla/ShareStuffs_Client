import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ItemCard from '../components/ItemCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../utils/api';
import { pageTransition, staggerContainer, fadeUp, tapPress } from '../utils/animations';

const categories = ['All', 'Tools', 'Camping', 'Party', 'Kitchen', 'Electronics', 'Sports'];

const categoryEmoji = {
  All: '🗂️', Tools: '🔧', Camping: '⛺', Party: '🎉',
  Kitchen: '🍳', Electronics: '📱', Sports: '⚽',
};

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ search, selectedCategory, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="text-7xl mb-5"
      >
        📭
      </motion.div>
      <h3 className="text-2xl font-bold mb-2">Nothing here yet</h3>
      <p className="text-base-content/60 mb-6 max-w-xs">
        {search || selectedCategory !== 'All'
          ? 'Try adjusting your search or filter to find what you need.'
          : 'Be the first to list an item in your community.'}
      </p>
      <motion.button
        whileTap={tapPress}
        onClick={onClear}
        className="btn btn-primary rounded-full px-8"
      >
        Clear Filters
      </motion.button>
    </motion.div>
  );
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, search]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search) params.search = search;
      const response = await api.get('/items', { params });
      setItems(response.data || []);
    } catch {
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputValue);
    setSearchParams({
      ...(inputValue && { search: inputValue }),
      ...(selectedCategory !== 'All' && { category: selectedCategory }),
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams({
      ...(search && { search }),
      ...(category !== 'All' && { category }),
    });
  };

  const handleClear = () => {
    setSearch('');
    setInputValue('');
    setSelectedCategory('All');
    setSearchParams({});
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-base-200"
    >
      {/* ── Hero bar ──────────────────────────────────────────────────────── */}
      <div className="browse-hero text-primary-content py-14 text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-4xl font-bold mb-2"
        >
          Find What You Need
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-primary-content/80 text-base sm:text-lg"
        >
          Browse hundreds of items available to borrow nearby
        </motion.p>
      </div>

      {/* ── Search bar — overlaps hero ─────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto -mt-6 relative z-10 px-4">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onSubmit={handleSearch}
        >
          <motion.div
            animate={{
              boxShadow: searchFocused
                ? '0 8px 32px -4px color-mix(in oklch, var(--color-primary) 25%, transparent)'
                : '0 4px 16px -4px rgba(0,0,0,0.1)',
            }}
            transition={{ duration: 0.2 }}
            className="bg-base-100 rounded-2xl border border-base-300/60 overflow-hidden"
          >
            <div className="flex items-center gap-2 p-2">
              <div className="flex items-center flex-1 gap-2 px-3">
                <motion.span
                  animate={{ scale: searchFocused ? 1.1 : 1 }}
                  transition={{ duration: 0.15 }}
                  className="text-base-content/40 text-lg"
                >
                  🔍
                </motion.span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search for items..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-base-content/40 py-2"
                  aria-label="Search items"
                />
                {/* Clear button */}
                <AnimatePresence>
                  {inputValue && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setInputValue('')}
                      className="text-base-content/40 hover:text-base-content transition-colors w-5 h-5 flex items-center justify-center rounded-full hover:bg-base-200"
                    >
                      ✕
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                whileTap={tapPress}
                type="submit"
                className="btn btn-primary rounded-xl px-6"
              >
                Search
              </motion.button>
            </div>
          </motion.div>
        </motion.form>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Category filter pills ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={tapPress}
              onClick={() => handleCategoryChange(cat)}
              className={`btn btn-sm rounded-full gap-1.5 transition-all duration-200 ${
                selectedCategory === cat
                  ? 'btn-primary shadow-md shadow-primary/20'
                  : 'bg-base-100 border border-base-300/60 hover:border-primary/40 hover:bg-primary/5 text-base-content/70'
              }`}
            >
              <span>{categoryEmoji[cat]}</span>
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Results count ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!loading && !error && (
            <motion.p
              key={`${items.length}-${selectedCategory}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-base-content/50 mb-5"
            >
              <span className="font-semibold text-base-content">{items.length}</span>{' '}
              item{items.length !== 1 ? 's' : ''} found
              {selectedCategory !== 'All' && (
                <span> in <span className="text-primary font-medium">{selectedCategory}</span></span>
              )}
              {search && (
                <span> for "<span className="text-primary font-medium">{search}</span>"</span>
              )}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="alert alert-error mb-6 rounded-2xl"
            >
              <span>{error}</span>
              <button onClick={fetchItems} className="btn btn-sm btn-ghost">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grid ──────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingSkeleton count={8} />
            </motion.div>
          ) : items.length === 0 ? (
            <EmptyState
              key="empty"
              search={search}
              selectedCategory={selectedCategory}
              onClear={handleClear}
            />
          ) : (
            <motion.div
              key={`grid-${selectedCategory}-${search}`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {items.map((item) => (
                <ItemCard key={item._id || item.id} item={item} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
