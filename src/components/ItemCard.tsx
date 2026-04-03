import { Link } from 'react-router-dom';

interface ItemCardProps {
  id: string;
  title: string;
  price: number;
  condition: string;
  image: string;
  sellerName: string;
  sellerAvatar: string;
  sellerVerified: boolean;
}

export function ItemCard({
  id,
  title,
  price,
  condition,
  image,
  sellerName,
  sellerAvatar,
  sellerVerified
}: ItemCardProps) {
  return (
    <Link
      to={`/item/${id}`}
      className="bg-white rounded-lg border hover:shadow-lg transition-all group"
    >
      {/* Item Image */}
      <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      {/* Item Details */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-green-600">
          {title}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xl font-bold text-gray-900">₹{price}</p>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {condition}
          </span>
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <img
            src={sellerAvatar}
            alt={sellerName}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-gray-600 flex-1 truncate">
            {sellerName}
          </span>
          {sellerVerified && (
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </Link>
  );
}
