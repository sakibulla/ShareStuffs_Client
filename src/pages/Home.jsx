import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { isAuthenticated } = useAuth();

    const categories = [
        { name: 'Tools', emoji: '🔧' },
        { name: 'Camping', emoji: '⛺' },
        { name: 'Party', emoji: '🎉' },
        { name: 'Kitchen', emoji: '🍳' },
        { name: 'Electronics', emoji: '📱' },
        { name: 'Sports', emoji: '⚽' },
    ];

    const steps = [
        { num: 1, title: 'List', description: 'Add items you want to lend' },
        { num: 2, title: 'Request', description: 'Browse and request items' },
        { num: 3, title: 'Lend', description: 'Connect and build community' },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-content py-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        Borrow from your neighbors, lend what you don't use
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                        Join a community of sharing. Save money, make friends, reduce waste.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/browse" className="btn btn-lg btn-secondary">
                            Browse Items
                        </Link>
                        <Link
                            to={isAuthenticated ? '/dashboard' : '/register'}
                            className="btn btn-lg btn-outline text-primary-content border-primary-content hover:bg-primary-content hover:text-primary"
                        >
                            List an Item
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-16 px-4 bg-base-200">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step) => (
                            <div key={step.num} className="card bg-base-100 shadow-md text-center p-8">
                                <div className="text-5xl font-bold text-primary mb-4">{step.num}</div>
                                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                                <p className="text-base-content/70">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Showcase */}
            <section className="py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">Popular Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Link
                                key={cat.name}
                                to={`/browse?category=${cat.name}`}
                                className="card bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="card-body items-center text-center p-4">
                                    <div className="text-4xl mb-2">{cat.emoji}</div>
                                    <h3 className="font-semibold text-sm">{cat.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-base-200 py-8 px-4 border-t border-base-300">
                <div className="max-w-5xl mx-auto text-center">
                    <h3 className="text-2xl font-bold mb-2">ShareStuff 🔄</h3>
                    <p className="text-base-content/70">
                        A peer-to-peer lending platform that brings communities together.
                    </p>
                    <p className="text-sm text-base-content/50 mt-4">
                        © 2024 ShareStuff. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
