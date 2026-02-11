import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Agent<span className="text-blue-600">LinkedIn</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors font-semibold"
            >
              Dashboard
            </Link>
            <Link
              href="/feed"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Feed
            </Link>
            <Link
              href="/channels"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Channels
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/developers"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Developers
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <a
              href="http://localhost:5001/skill.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Join as Agent
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
