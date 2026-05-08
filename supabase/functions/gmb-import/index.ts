import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractPlaceId(id: string): string {
  if (id.startsWith('places/')) {
    return id.replace('places/', '');
  }
  return id;
}

function extractPhotoReference(photoName: string): string {
  if (!photoName) return '';
  if (photoName.includes('/')) {
    return photoName.split('/').pop() || '';
  }
  return photoName;
}

function buildPhotoUrl(photoRef: string, apiKey: string, maxWidth: number = 800): string {
  if (!photoRef) return '';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${apiKey}`;
}

function parseAddress(formattedAddress: string): {
  address: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
} {
  const result = {
    address: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom'
  };
  
  if (!formattedAddress) return result;
  
  const parts = formattedAddress.split(',').map(p => p.trim());
  
  if (parts.length >= 1) result.address = parts[0];
  if (parts.length >= 2) result.city = parts[parts.length - 2];
  if (parts.length >= 3) result.county = parts[parts.length - 1];
  
  // Try to extract postcode (usually last part if it looks like UK postcode)
  const postcodeMatch = formattedAddress.match(/[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}/i);
  if (postcodeMatch) {
    result.postcode = postcodeMatch[0];
  }
  
  return result;
}

function determineConfidence(googleTypes: string[], searchQuery: string): 'high' | 'medium' | 'low' {
  const fosteringKeywords = ['foster', 'fostering', 'care', 'children', 'adoption', 'social'];
  const nonFosteringKeywords = ['dental', 'medical', 'restaurant', 'shop', 'retail'];
  
  const searchLower = searchQuery.toLowerCase();
  const typesLower = (googleTypes || []).map(t => t.toLowerCase());
  
  // Check for clear fostering matches
  const hasFosteringKeyword = fosteringKeywords.some(k => searchLower.includes(k));
  const hasNonFostering = nonFosteringKeywords.some(k => searchLower.includes(k) || typesLower.some(t => t.includes(k)));
  
  if (hasFosteringKeyword && !hasNonFostering) return 'high';
  if (hasFosteringKeyword) return 'medium';
  if (hasNonFostering) return 'low';
  return 'medium';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get Google API key from global_settings
    const { data: settingsData } = await supabase
      .from('global_settings')
      .select('value')
      .eq('key', 'google_places_api_key')
      .single();
    
    let googleApiKey = '';
    if (settingsData?.value) {
      const value = typeof settingsData.value === 'string' 
        ? JSON.parse(settingsData.value) 
        : settingsData.value;
      googleApiKey = value.api_key || value;
    }

    if (!googleApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Google Places API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action, category, city, state, placeIds, cityId, maxPages, importType = 'new', cityAssignments } = body;

    // =============================================================================
    // SEARCH ACTION - Search for places
    // =============================================================================
    if (action === 'search') {
      const textQuery = `${category} in ${city}${state ? `, ${state}` : ''}, UK`;
      console.log('Searching for foster care agencies:', textQuery);
      
      const allResults: any[] = [];
      let pageToken: string | null = null;
      let pageCount = 0;
      const maxPagesToFetch = maxPages || 3;
      
      do {
        const requestBody: any = {
          textQuery,
          pageSize: 20,
          languageCode: 'en',
          regionCode: 'GB',
        };
        
        if (pageToken) {
          requestBody.pageToken = pageToken;
        }
        
        const searchResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': googleApiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.types,places.photos,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.businessStatus,places.priceLevel,nextPageToken',
          },
          body: JSON.stringify(requestBody),
        });

        const searchData = await searchResponse.json();

        if (searchData.error) {
          console.error('Google API Error:', searchData.error);
          return new Response(
            JSON.stringify({ success: false, error: searchData.error.message || 'API error' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (searchData.places && searchData.places.length > 0) {
          allResults.push(...searchData.places);
        }

        pageToken = searchData.nextPageToken || null;
        pageCount++;
        
        console.log(`Page ${pageCount}: ${searchData.places?.length || 0} results`);
        
        if (pageToken && pageCount < maxPagesToFetch) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
      } while (pageToken && pageCount < maxPagesToFetch);

      console.log(`Total results: ${allResults.length} from ${pageCount} pages`);

      // Get existing place IDs to check for duplicates
      const placeIdsList = allResults.map((p: any) => extractPlaceId(p.id));
      const { data: existing } = await supabase
        .from('agencies')
        .select('id, place_id, name, status')
        .in('place_id', placeIdsList);
      
      const existingMap = new Map((existing || []).map((a: any) => [a.place_id, a]));

      // Generate results with all available data
      const results = allResults.map((place: any) => {
        const placeId = extractPlaceId(place.id);
        const existingAgency = existingMap.get(placeId);
        
        let photoUrl = null;
        if (place.photos && place.photos.length > 0) {
          const photoRef = extractPhotoReference(place.photos[0].name);
          if (photoRef) {
            photoUrl = buildPhotoUrl(photoRef, googleApiKey, 400);
          }
        }

        let openingHours = '';
        if (place.regularOpeningHours && place.regularOpeningHours.weekdayDescriptions) {
          openingHours = place.regularOpeningHours.weekdayDescriptions.join('; ');
        }

        const confidence = determineConfidence(place.types || [], textQuery);

        return {
          place_id: placeId,
          name: place.displayName?.text || 'Unknown',
          address: place.formattedAddress || '',
          rating: place.rating,
          reviews_count: place.userRatingCount,
          lat: place.location?.latitude,
          lng: place.location?.longitude,
          phone: place.nationalPhoneNumber || null,
          website: place.websiteUri || null,
          google_maps_url: place.googleMapsUri || null,
          types: place.types,
          business_status: place.businessStatus,
          photo_url: photoUrl,
          opening_hours: openingHours,
          has_photos: place.photos && place.photos.length > 0,
          photo_count: place.photos?.length || 0,
          already_imported: !!existingAgency,
          existing_id: existingAgency?.id || null,
          existing_status: existingAgency?.status || null,
          confidence,
        };
      });

      return new Response(
        JSON.stringify({
          success: true,
          results,
          total_pages_fetched: pageCount,
          total_found: results.length,
          new_count: results.filter(r => !r.already_imported).length,
          existing_count: results.filter(r => r.already_imported).length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================================================
    // IMPORT ACTION - Import selected places
    // =============================================================================
    if (action === 'import') {
      const imported: any[] = [];
      const errors: string[] = [];
      const skipped: string[] = [];

      // Create city mapping from placeIds - allow per-agency city assignment
      const cityMap = new Map<string, string>();
      if (cityAssignments && typeof cityAssignments === 'object') {
        Object.entries(cityAssignments).forEach(([placeId, c]) => {
          cityMap.set(placeId, c as string);
        });
      }

      for (const placeId of placeIds) {
        try {
          // Check if already exists
          const { data: existing } = await supabase
            .from('agencies')
            .select('id, place_id, name')
            .eq('place_id', placeId)
            .maybeSingle();
          
          // Handle different import types
          if (existing) {
            if (importType === 'new') {
              skipped.push(`${placeId}: Already exists as ${existing.name} (skipped - new only)`);
              continue;
            }
            // For 'update', 'sync', 'photos', 'reviews', 'business_hours' - continue with update
            console.log(`Found existing: ${existing.name} (import type: ${importType})`);
          } else {
            if (importType === 'update' || importType === 'photos' || importType === 'reviews' || importType === 'business_hours') {
              skipped.push(`${placeId}: Not found (skipped - update only)`);
              continue;
            }
            // For 'new' or 'sync' - continue with insert
          }

          // Get place details with all available fields
          const resourceName = placeId.startsWith('places/') ? placeId : `places/${placeId}`;
          
          const detailsResponse = await fetch(`https://places.googleapis.com/v1/${resourceName}`, {
            method: 'GET',
            headers: {
              'X-Goog-Api-Key': googleApiKey,
              'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,location,rating,userRatingCount,photos,regularOpeningHours,reviews,shortFormattedAddress,adrFormatAddress,priceLevel,businessStatus,utcOffsetMinutes,primaryType,types',
            },
          });

          const place = await detailsResponse.json();

          if (place.error) {
            errors.push(`${placeId}: ${place.error.message || 'Failed to fetch'}`);
            continue;
          }

          const placeName = place.displayName?.text || 'Unknown';
          const slug = placeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          
          // Parse address components
          const addressParts = parseAddress(place.formattedAddress || '');

          // Get photos
          let mainImageUrl = null;
          let coverImageUrl = null;
          const photoReferences: string[] = [];
          
          if (place.photos && place.photos.length > 0) {
            // First photo as main
            const firstRef = extractPhotoReference(place.photos[0].name);
            if (firstRef) {
              mainImageUrl = buildPhotoUrl(firstRef, googleApiKey, 800);
              photoReferences.push(firstRef);
            }
            
            // Second photo as cover
            if (place.photos.length > 1) {
              const secondRef = extractPhotoReference(place.photos[1].name);
              if (secondRef) {
                coverImageUrl = buildPhotoUrl(secondRef, googleApiKey, 1200);
                photoReferences.push(secondRef);
              }
            }
            
            // Store remaining photo references
            for (let i = 2; i < place.photos.length; i++) {
              const ref = extractPhotoReference(place.photos[i].name);
              if (ref) photoReferences.push(ref);
            }
          }

          // Parse opening hours
          const weekdayText = place.regularOpeningHours?.weekdayDescriptions || [];
          const openNow = place.regularOpeningHours?.currentOpeningHours?.openNow;

          // Prepare agency data - selective based on import type
          const isPartialUpdate = importType === 'photos' || importType === 'reviews' || importType === 'business_hours';
          
          const baseData = {
            name: placeName,
            slug,
            place_id: extractPlaceId(place.id),
            google_place_id: extractPlaceId(place.id),
          };
          
          // Only include full data for new/update/sync
          // Use city from cityMap if available, otherwise fallback to parsed address or default
          const assignedCity = cityMap.get(placeId) || addressParts.city || city || '';
          
          const fullData = {
            ...baseData,
            address: place.formattedAddress,
            city: assignedCity,
            state: addressParts.county || state || '',
            postcode: addressParts.postcode || '',
            phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
            website: place.websiteUri || null,
            google_maps_url: place.googleMapsUri || null,
            google_website_url: place.websiteUri || null,
            international_phone: place.internationalPhoneNumber || null,
            rating: place.rating || 0,
            review_count: place.userRatingCount || 0,
            google_primary_type: place.primaryType || null,
            google_types: place.types || [],
            business_status: place.businessStatus || null,
            price_level: place.priceLevel || null,
            utc_offset_minutes: place.utcOffsetMinutes || null,
            editorial_summary: place.shortFormattedAddress || null,
            
            // Images
            main_image_url: mainImageUrl,
            cover_image_url: coverImageUrl || mainImageUrl,
            
            // Status - default to pending for review
            status: 'pending',
            listing_status: 'unlisted',
            verification_status: 'unverified',
            claim_status: 'unclaimed',
            is_verified: false,
            is_featured: false,
            
            // Import tracking
            import_source: 'gmb',
            imported_at: new Date().toISOString(),
            last_synced_at: new Date().toISOString(),
          };
          
          // Partial updates only include specific fields
          const photoData = {
            main_image_url: mainImageUrl,
            cover_image_url: coverImageUrl || mainImageUrl,
            last_synced_at: new Date().toISOString(),
          };
          
          const reviewData = {
            review_count: place.userRatingCount || 0,
            rating: place.rating || 0,
            last_synced_at: new Date().toISOString(),
          };
          
          const hoursData = {
            editorial_summary: place.shortFormattedAddress || null,
            last_synced_at: new Date().toISOString(),
          };
          
          let agencyData;
          if (isPartialUpdate) {
            // For partial updates, merge the appropriate partial data
            if (importType === 'photos') {
              agencyData = { ...baseData, ...photoData };
            } else if (importType === 'reviews') {
              agencyData = { ...baseData, ...reviewData };
            } else if (importType === 'business_hours') {
              agencyData = { ...baseData, ...hoursData };
            } else {
              agencyData = fullData;
            }
          } else {
            agencyData = fullData;
          }

          let agencyId: string;

          if (existing) {
            // Update existing
            const { data: updated, error: updateError } = await supabase
              .from('agencies')
              .update(agencyData)
              .eq('id', existing.id)
              .select('id')
              .single();
            
            if (updateError) {
              errors.push(`${placeName}: Update failed - ${updateError.message}`);
              continue;
            }
            agencyId = updated.id;
            console.log(`✓ Updated: ${placeName}`);
          } else {
            // Insert new
            const { data: newAgency, error: insertError } = await supabase
              .from('agencies')
              .insert(agencyData)
              .select('id')
              .single();
            
            if (insertError) {
              errors.push(`${placeName}: Insert failed - ${insertError.message}`);
              continue;
            }
            agencyId = newAgency.id;
            console.log(`✓ Imported: ${placeName}`);
          }

          // Store photos in agency_photos table (only for full imports or photo imports)
          const shouldImportPhotos = ['new', 'update', 'sync', 'photos'].includes(importType);
          if (shouldImportPhotos && place.photos && place.photos.length > 0) {
            try {
              console.log(`  └─ Attempting to store ${place.photos.length} photos for agency ${agencyId}`);
              
              const photoInserts = place.photos.map((photo: any, index: number) => ({
                agency_id: agencyId,
                photo_type: index === 0 ? 'main' : index === 1 ? 'cover' : 'gallery',
                google_photo_name: photo.name,
                google_photo_reference: extractPhotoReference(photo.name),
                photo_url: buildPhotoUrl(extractPhotoReference(photo.name), googleApiKey, 1200),
                width: photo.widthPx || null,
                height: photo.heightPx || null,
                is_primary: index === 0,
                source: 'google',
                display_order: index,
                imported_at: new Date().toISOString(),
              }));

              console.log(`  └─ Photo inserts:`, JSON.stringify(photoInserts.slice(0, 2)));
              
              // Use insert instead of upsert to avoid unique constraint issues
              const { data: photoData, error: photoError } = await supabase.from('agency_photos').insert(photoInserts).select();
              
              if (photoError) {
                console.log(`  └─ Photo insert FAILED: ${photoError.message}, code: ${photoError.code}, details: ${photoError.details}`);
              } else {
                console.log(`  └─ Stored ${photoInserts.length} photos, data:`, photoData);
              }
            } catch (photoErr) {
              console.log(`  └─ Photo storage exception: ${photoErr instanceof Error ? photoErr.message : String(photoErr)}`);
            }
          }

          // Store opening hours in agency_opening_hours table (if table exists)
          try {
            if (weekdayText.length > 0) {
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const hoursInserts = weekdayText.map((dayText: string, index: number) => {
                // Parse "Monday: 9:00 AM - 5:00 PM" format
                const parts = dayText.split(': ');
                const dayName = parts[0] || dayNames[index];
                const timeRange = parts[1] || '';
                const isClosed = timeRange.toLowerCase().includes('closed');
                
                let openTime = null;
                let closeTime = null;
                if (!isClosed && timeRange.includes('-')) {
                  const times = timeRange.split(' - ');
                  openTime = times[0]?.trim();
                  closeTime = times[1]?.trim();
                }

                return {
                  agency_id: agencyId,
                  day_of_week: index,
                  open_time: openTime,
                  close_time: closeTime,
                  is_closed: isClosed,
                  weekday_text: dayText,
                  source: 'google',
                };
              });

              await supabase.from('agency_opening_hours').upsert(hoursInserts, { onConflict: 'agency_id,day_of_week' });
              console.log(`  └─ Stored ${hoursInserts.length} opening hours`);
            }
          } catch (hoursErr) {
            console.log(`  └─ Hours storage skipped: ${hoursErr instanceof Error ? hoursErr.message : 'Table may not exist'}`);
          }

          // Store reviews in agency_reviews table (if table exists)
          try {
            if (place.reviews && place.reviews.length > 0) {
              console.log(`  └─ Attempting to store ${place.reviews.length} reviews for agency ${agencyId}`);
              
              const reviewInserts = place.reviews.map((review: any) => ({
                agency_id: agencyId,
                source: 'google',
                source_review_id: review.name || null,
                reviewer_name: review.authorName || null,
                reviewer_profile_url: review.authorUrl || null,
                reviewer_photo_url: review.profilePhotoUrl || null,
                rating: review.rating || 0,
                review_text: review.text || null,
                review_language: review.languageCode || null,
                review_time: review.publishTime || null,
                relative_time_description: review.relativeTimeDescription || null,
                is_verified: true,
                is_displayed: true,
                imported_at: new Date().toISOString(),
              }));

              console.log(`  └─ Review inserts:`, JSON.stringify(reviewInserts.slice(0, 1)));
              
              // Use insert instead of upsert to avoid unique constraint issues
              const { data: reviewData, error: reviewError } = await supabase.from('agency_reviews').insert(reviewInserts).select();
              
              if (reviewError) {
                console.log(`  └─ Review insert FAILED: ${reviewError.message}, code: ${reviewError.code}, details: ${reviewError.details}`);
              } else {
                console.log(`  └─ Stored ${reviewInserts.length} reviews, data:`, reviewData);
              }
            }
          } catch (reviewErr) {
            console.log(`  └─ Review storage exception: ${reviewErr instanceof Error ? reviewErr.message : String(reviewErr)}`);
          }

          imported.push({
            place_id: placeId,
            agency_id: agencyId,
            name: placeName,
            city: addressParts.city,
            rating: place.rating,
            photos_stored: place.photos?.length || 0,
            hours_stored: weekdayText.length,
            reviews_stored: place.reviews?.length || 0,
          });

        } catch (err) {
          console.error('Import error:', err);
          errors.push(`${placeId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          imported: imported.length,
          skipped: skipped.length,
          errors: errors.length,
          imported_agencies: imported,
          skipped_agencies: skipped,
          error_messages: errors,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================================================
    // REFRESH ACTION - Refresh existing agency data
    // =============================================================================
    if (action === 'refresh') {
      const refreshed: any[] = [];
      
      // If specific placeIds provided, refresh those
      // Otherwise, refresh all agencies with place_id
      let agenciesToRefresh;
      
      if (placeIds && placeIds.length > 0) {
        const { data } = await supabase
          .from('agencies')
          .select('id, place_id, name')
          .in('place_id', placeIds);
        agenciesToRefresh = data || [];
      } else {
        const { data } = await supabase
          .from('agencies')
          .select('id, place_id, name')
          .not('place_id', 'is', null)
          .eq('import_source', 'gmb')
          .limit(50);
        agenciesToRefresh = data || [];
      }

      for (const agency of agenciesToRefresh) {
        try {
          const resourceName = `places/${agency.place_id}`;
          
          const detailsResponse = await fetch(`https://places.googleapis.com/v1/${resourceName}`, {
            method: 'GET',
            headers: {
              'X-Goog-Api-Key': googleApiKey,
              'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,photos,regularOpeningHours,reviews,businessStatus',
            },
          });

          const place = await detailsResponse.json();
          
          if (place.error) {
            console.log(`Refresh failed for ${agency.name}: ${place.error.message}`);
            continue;
          }

          // Update agency with refreshed data
          const { error: updateError } = await supabase
            .from('agencies')
            .update({
              rating: place.rating || 0,
              review_count: place.userRatingCount || 0,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', agency.id);

          if (!updateError) {
            refreshed.push({ id: agency.id, name: agency.name });
          }
        } catch (err) {
          console.error(`Refresh error for ${agency.name}:`, err);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          refreshed: refreshed.length,
          agencies: refreshed,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});