import { create } from 'zustand';
import { MOCK_POSTS } from '../constants/mockData';
import { ApiClient } from '../services/api';
import { PostItem } from '../types';

interface FeedState {
  posts: PostItem[];
  likedPostIds: Record<string, boolean>;
  likedPosts: Record<string, boolean>;
  activeCategory: string;
  loading: boolean;

  // Actions
  setActiveCategory: (category: string) => void;
  fetchPosts: (category?: string) => Promise<void>;
  toggleLike: (postId: string) => void;
  addPost: (newPost: PostItem) => void;
  deletePost: (postId: string) => void;
  addComment: (postId: string) => void;
}

const initialLiked = { p2: true };

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: MOCK_POSTS,
  likedPostIds: initialLiked,
  likedPosts: initialLiked,
  activeCategory: 'Ăn uống',
  loading: false,

  setActiveCategory: (category) => {
    set({ activeCategory: category });
    get().fetchPosts(category);
  },

  fetchPosts: async (category = 'all') => {
    set({ loading: true });
    try {
      const res = await ApiClient.getFeed(category);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        set({ posts: res.data });
      }
    } catch {
      // Fallback
    } finally {
      set({ loading: false });
    }
  },

  toggleLike: (postId) =>
    set((state) => {
      const isLiked = !!(state.likedPostIds?.[postId] ?? state.likedPosts?.[postId]);
      const updatedPosts = state.posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: isLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !isLiked,
          };
        }
        return p;
      });

      const updatedLiked = {
        ...state.likedPostIds,
        ...state.likedPosts,
        [postId]: !isLiked,
      };

      return {
        posts: updatedPosts,
        likedPostIds: updatedLiked,
        likedPosts: updatedLiked,
      };
    }),

  addPost: (newPost) =>
    set((state) => ({
      posts: [newPost, ...state.posts],
    })),

  deletePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
    })),

  addComment: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ),
    })),
}));
