"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReviewsSection({ reviews: initialReviews, mediaId, mediaType, mediaTitle, mediaPosterPath }: { reviews: any[], mediaId: number, mediaType: string, mediaTitle: string, mediaPosterPath: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews || []);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editedRating, setEditedRating] = useState(0);
  const [editedComment, setEditedComment] = useState('');

  const hasUserReviewed = reviews.some(review => review.username === user?.username);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review.');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }
    try {
      const payload = { mediaId, mediaType, rating, comment, mediaTitle, mediaPosterPath };
      await api.post('/reviews', payload);
      const newReview = { username: user.username, profilePictureUrl: user.pfp || '', rating, comment, createdAt: new Date().toISOString() };
      setReviews([newReview, ...reviews]);
      setRating(0);
      setComment('');
      toast.success('Review submitted!');
    } catch (error) {
      toast.error('Failed to submit review.');
    }
  };

  const handleUpdateReview = async (reviewId: number) => {
    try {
        await api.put(`/reviews/${reviewId}`, { rating: editedRating, comment: editedComment });
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, rating: editedRating, comment: editedComment } : r));
        setEditingReviewId(null);
        toast.success('Review updated!');
    } catch (error) {
        toast.error('Failed to update review.');
    }
  };

  const startEditing = (review: any) => {
    setEditingReviewId(review.id);
    setEditedRating(review.rating);
    setEditedComment(review.comment);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      
      {user && !hasUserReviewed && (
        <form onSubmit={handleSubmitReview} className="bg-gray-800 p-6 rounded-lg mb-8">
          <h3 className="font-bold mb-4">Write Your Review</h3>
          <div className="flex items-center mb-4">
            <span className="mr-4">Your Rating:</span>
            <div>
              {[...Array(10)].map((_, i) => (
                <button type="button" key={i} onClick={() => setRating(i + 1)} className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-500'}`}>★</button>
              ))}
            </div>
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you think?" className="w-full bg-gray-700 p-3 rounded-md h-24"/>
          <button type="submit" className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg">Submit</button>
        </form>
      )}

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="flex space-x-4">
            <div className="relative w-12 h-12 rounded-full bg-gray-700 flex-shrink-0">
              <Image src={review.profilePictureUrl || '/default-avatar.png'} alt={review.username} fill className="rounded-full object-cover" />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg flex-grow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold">{review.username}</span>
                  <span className="text-xs text-gray-400 ml-2">{formatDate(review.createdAt)}</span>
                </div>
                {user?.username === review.username && editingReviewId !== review.id && <button onClick={() => startEditing(review)} className="text-xs text-cyan-400 hover:underline">Edit</button>}
              </div>
              
              {editingReviewId === review.id ? (
                <div>
                  <div className="flex items-center my-2">
                    {[...Array(10)].map((_, i) => (
                      <button type="button" key={i} onClick={() => setEditedRating(i + 1)} className={`text-2xl ${i < editedRating ? 'text-yellow-400' : 'text-gray-500'}`}>★</button>
                    ))}
                  </div>
                  <textarea value={editedComment} onChange={(e) => setEditedComment(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md"/>
                  <div className="flex space-x-2 mt-2">
                    <button onClick={() => handleUpdateReview(review.id)} className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Save</button>
                    <button onClick={() => setEditingReviewId(null)} className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center text-yellow-400 mb-2">
                    <span className="font-bold mr-1">{review.rating}</span><span>★</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                </>
              )}
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-400">No reviews yet. Be the first to write one!</p>}
      </div>
    </div>
  );
}