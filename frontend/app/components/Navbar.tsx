import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-gray-900/50 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-cyan-400">
              CineLume
            </Link>
            <div className="hidden md:flex items-baseline space-x-4">
              <Link href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link href="/movies" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Movies</Link>
              <Link href="/tv" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">TV Shows</Link>
            </div>
          </div>
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-800 text-white w-full px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}