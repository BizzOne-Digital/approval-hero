import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';
import type { BlogPost } from '@/lib/types';

interface BlogPostCardProps {
  post: BlogPost;
  priority?: boolean;
}

export function BlogPostCard({ post, priority = false }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card-premium group block h-full touch-manipulation cursor-pointer relative z-10"
    >
      {post.coverImage?.url && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={getImageUrl(post.coverImage.url)}
            alt={post.coverImage.alt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      )}
      <div className="p-6">
        {post.categoryId && (
          <span className="text-electric text-xs font-display uppercase tracking-wider">
            {post.categoryId.name}
          </span>
        )}
        <h3 className="font-display text-xl font-bold text-midnight mt-1 mb-2 group-hover:text-electric transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
        <span className="inline-block mt-4 text-electric font-display text-xs uppercase tracking-wider">
          Read Article →
        </span>
      </div>
    </Link>
  );
}
