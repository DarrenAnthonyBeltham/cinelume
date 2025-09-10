import Link from 'next/link';
import Image from 'next/image';

export default function SearchDropdown({ results, isLoading, clearSearch }: { results: any[], isLoading: boolean, clearSearch: () => void }) {
  const getMediaType = (item: any) => item.title ? 'movie' : 'tv';

  return (
    <div className="absolute top-full mt-2 w-full bg-gray-800 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-gray-400">Searching...</div>
      ) : (
        <ul>
          {results.length > 0 ? (
            results.map(item => (
              <li key={item.id} className="border-b border-gray-700 last:border-b-0">
                <Link href={`/${getMediaType(item)}/${item.id}`} onClick={clearSearch} className="flex items-center p-3 hover:bg-gray-700 transition-colors">
                  <div className="relative w-12 h-16 bg-gray-700 rounded-md flex-shrink-0">
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-white">{item.title || item.name}</p>
                    <p className="text-sm text-gray-400">{item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4)}</p>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <div className="p-4 text-gray-400">No results found.</div>
          )}
        </ul>
      )}
    </div>
  );
}