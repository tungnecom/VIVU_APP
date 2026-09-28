import { create } from 'zustand';
import { MOCK_POSTS } from '../constants/mockData';
import { PostItem } from '../types';

interface FeedState {
  posts: PostItem[];
  likedPostIds: Record<string, boolean>;
  activeCategory: string;

  // Actions
  setActiveCategory: (category: string) => void;
  toggleLike: (postId: string) => void;
  addPost: (newPost: PostItem) => void;
  addComment: (postId: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: MOCK_POSTS,
  likedPostIds: { p2: true },
  activeCategory: 'Ăn uống',

  setActiveCategory: (category) => set({ activeCategory: category }),

  toggleLike: (postId) =>
    set((state) => {
      const isLiked = !!state.likedPostIds[postId];
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

      return {
        posts: updatedPosts,
        likedPostIds: {
          ...state.likedPostIds,
          [postId]: !isLiked,
        },
      };
    }),

  addPost: (newPost) =>
    set((state) => ({
      posts: [newPost, ...state.posts],
    })),

  addComment: (postId) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      ),
    })),
}));
