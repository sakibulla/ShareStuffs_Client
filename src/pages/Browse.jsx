import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../utils/api';

const categories = ['All', 'Tools', 'Camping', 'Party', 'Kitchen', 'Electronics', 'Sports'];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

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
    } catch (err) {
      setError('Failed to load items. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputValue);
    setSearchParams({ search: inputValue, category: selectedCategory !== 'All' ? selectedCategory : '' });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchParams({ search, category: category !== 'All' ? category : '' });
  };

  return (
    <div className="min-h-screen bg-base-200 fade-in">
      {/* Hero bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 text-white py-12 text-center px-4">
        <h1 className="text-4xl font-bold mb-2">Find What You Need</h1>
        <p className="text-white/80 text-lg">Browse hundreds of items available to borrow nearby</p>
      </div>

      {/* Search bar overlapping hero */}
      <div className="max-w-2xl mx-auto -mt-6 relative z-10 px-4">
        <form onSubmit={handleSearch}>
          <div className="card bg-base-100 shadow-xl rounded-2xl">
            <div className="card-body p-3 flex-row gap-2">
              <div className="flex items-center flex-1 gap-2 px-2">
                <span className="text-base-content/40">🔍</span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search for items..."
                  className="input input-ghost w-full focus:outline-none p-0 h-auto text-base"
                />
              </div>
              <button type="submit" className="btn btn-primary rounded-xl transition-all duration-200 active:scale-95">
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`btn btn-sm rounded-full transition-all duration-200 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-content border-primary'
                  : 'bg-base-200 hover:bg-base-300 border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-base-content/60 mb-4">
            {items.length} item{items.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
            {search ? ` for "${search}"` : ''}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <LoadingSkeleton count={8} />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-4">📭</div>
            <h3 className="text-2xl font-bold mb-2">Nothing here yet</h3>
            <p className="text-base-content/60 mb-6">
              {search || selectedCategory !== 'All'
                ? 'Try adjusting your search or filter'
                : 'Be the first to list an item in your community'}
            </p>
            <button
              onClick={() => { setSearch(''); setInputValue(''); setSelectedCategory('All'); setSearchParams({}); }}
              className="btn btn-primary rounded-full transition-all duration-200 active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id || item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
