import React from 'react';
import { Product } from '../types';
import { Star, ShoppingCart, Check, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdding?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isAdding }) => {
  return (
    <div className="group bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-800">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-indigo-400 border border-indigo-500/20">
            {product.brand}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 border border-amber-500/20 text-xs font-medium">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{product.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-slate-400 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-mono">{product.sku}</div>
            <div className="text-lg font-bold text-white">
              ${product.price.toFixed(2)}
            </div>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isAdding}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
            title="Add to Cart"
          >
            {isAdding ? <Check className="w-4 h-4 animate-bounce" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
