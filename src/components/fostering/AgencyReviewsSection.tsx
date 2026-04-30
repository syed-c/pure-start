import { Star, ExternalLink, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  reviewer_name?: string;
  rating: number;
  review_text?: string;
  review_time?: string;
  source?: string;
  relative_time_description?: string;
}

interface GoogleReview {
  id: string;
  author_name?: string;
  rating: number;
  text?: string;
  relative_time_description?: string;
  profile_photo_url?: string;
}

interface AgencyReviewsSectionProps {
  reviews?: Review[];
  googleReviews?: GoogleReview[];
  agencyRating?: number;
  agencyReviewCount?: number;
  agencySlug?: string;
  agencyId?: string;
  className?: string;
}

export function AgencyReviewsSection({
  reviews = [],
  googleReviews = [],
  agencyRating,
  agencyReviewCount = 0,
  agencySlug,
  agencyId,
  className
}: AgencyReviewsSectionProps) {
  const totalReviews = reviews.length + googleReviews.length;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Rating Summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-gold text-gold" />
            <span className="text-2xl font-bold">{agencyRating?.toFixed(1) || 'N/A'}</span>
          </div>
          {agencyReviewCount > 0 && (
            <span className="text-muted-foreground">({agencyReviewCount} reviews)</span>
          )}
        </div>
      </div>

      {/* Google Reviews */}
      {googleReviews && googleReviews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
            <span className="text-sm font-medium">From Google</span>
            <Badge variant="outline" className="text-xs">Imported</Badge>
          </div>
          
          {googleReviews.slice(0, 5).map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {review.profile_photo_url && (
                    <img 
                      src={review.profile_photo_url} 
                      alt={review.author_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.author_name || 'Anonymous'}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-3 w-3", 
                              i < review.rating ? "fill-gold text-gold" : "text-muted"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.text && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{review.text}</p>
                    )}
                    {review.relative_time_description && (
                      <p className="text-xs text-muted-foreground mt-2">{review.relative_time_description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Internal Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Platform Reviews</Badge>
          </div>
          
          {reviews.slice(0, 5).map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {(review.reviewer_name || 'A')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{review.reviewer_name || 'Anonymous'}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "h-3 w-3", 
                              i < review.rating ? "fill-gold text-gold" : "text-muted"
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{review.review_text}</p>
                    )}
                    {review.relative_time_description && (
                      <p className="text-xs text-muted-foreground mt-2">{review.relative_time_description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Reviews */}
      {totalReviews === 0 && (
        <div className="text-center py-8">
          <Quote className="h-8 w-8 text-muted mx-auto mb-2" />
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground">Reviews from public Google profiles will appear here when available.</p>
        </div>
      )}

      {/* Disclaimer */}
      {totalReviews > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Reviews may come from public Google profile data where available.
        </p>
      )}
    </div>
  );
}