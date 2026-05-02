import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api from '../utils/api';

export default function Browse() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

    const categories = ['All', 'Tools', 'Camping', 'Party', 'Kitchen', 'Electronics', 'Sports'];

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
        setSearchParams({ search, category: selectedCategory !== 'All' ? selectedCategory : '' });
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setSearchParams({ search, category: category !== 'All' ? category : '' });
    };

    return (
        <div className="min-h-screen bg-base-200 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold mb-8">Browse Items</h1>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="join w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search items..."
                            className="input input-bordered join-item w-full"
                        />
                        <button type="submit" className="btn btn-primary join-item">
                            Search
                        </button>
                    </div>
                </form>

                {/* Category Filters */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error mb-6">
                        <span>{error}</span>
                    </div>
                )}

                {/* Items Grid */}
                {loading ? (
                    <LoadingSkeleton count={6} />
                ) : items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-2xl text-base-content/60 mb-4">No items found</p>
                        <p className="text-base-content/50">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
