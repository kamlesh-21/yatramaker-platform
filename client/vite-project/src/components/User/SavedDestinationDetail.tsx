// src/pages/SavedDestinationDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSavedItineraryById } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function SavedDestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSavedItineraryById(id!);
        setData(res.singleDestinationRecommendation);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!data) return <div>Itinerary not found</div>;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/itineraries')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{data.name || data.destination?.name || 'Your Trip'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p><strong>Budget:</strong> ₹{data.totalCost?.base || 'N/A'}</p>
            <p><strong>Duration:</strong> {data.tripDuration || 'N/A'} days</p>
            {/* Add any other v1 fields you had */}
            <div className="mt-4 p-4 bg-muted rounded">
              <p className="text-sm text-muted-foreground">
                This is a trip saved from the older version of the app.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}