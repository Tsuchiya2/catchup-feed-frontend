import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Article } from '@/types/api';

interface RecentArticlesListProps {
  articles: Article[];
  isLoading?: boolean;
  className?: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

function ArticleItemSkeleton() {
  return (
    <div className="flex flex-col space-y-2 p-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-2 text-4xl text-muted-foreground">📰</div>
      <h3 className="mb-1 text-lg font-semibold">No articles yet</h3>
      <p className="text-sm text-muted-foreground">
        Articles will appear here once they are added.
      </p>
    </div>
  );
}

export function RecentArticlesList({
  articles,
  isLoading = false,
  className,
}: RecentArticlesListProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Recent Articles</CardTitle>
        <CardDescription>Latest articles from your sources</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <ArticleItemSkeleton key={i} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="group block rounded-lg border p-4 transition-colors hover:border-primary hover:bg-accent"
              >
                <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary">
                  {article.title}
                </h3>
                {article.summary && (
                  <p className="mb-2 text-sm text-muted-foreground">
                    {truncateText(article.summary, 150)}
                  </p>
                )}
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <time dateTime={article.published_at}>
                    {formatRelativeTime(article.published_at)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
