import Image from 'next/image';

export default function CastList({ cast }: { cast: any[] }) {
  if (!cast || cast.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Top Billed Cast</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-gray-900 scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600">
        {cast.slice(0, 15).map((member) => (
          <div key={member.credit_id} className="flex-shrink-0 w-32 text-center">
            <div className="relative w-32 h-48 rounded-lg overflow-hidden bg-gray-700">
              {member.profile_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${member.profile_path}`}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <p className="font-bold mt-2 truncate">{member.name}</p>
            <p className="text-sm text-gray-400 truncate">{member.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
}