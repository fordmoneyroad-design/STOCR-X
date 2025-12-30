import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, FileText, Plus, Eye, Edit, Trash2, Send, Share2,
  Sparkles, TrendingUp, Calendar, Search, Globe, Image as ImageIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";
import AIContentGenerator from "../components/blog/AIContentGenerator";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const PLATFORMS = [
  { name: "Google", key: "google", icon: "🔍", color: "bg-red-600", shareUrl: "https://business.google.com" },
  { name: "Bing", key: "bing", icon: "🅱️", color: "bg-blue-600", shareUrl: "https://www.bing.com/webmasters" },
  { name: "Yelp", key: "yelp", icon: "⭐", color: "bg-red-700", shareUrl: "https://biz.yelp.com" },
  { name: "Groupon", key: "groupon", icon: "💰", color: "bg-green-600", shareUrl: "https://www.groupon.com/merchant" },
  { name: "Yahoo", key: "yahoo", icon: "🟣", color: "bg-purple-600", shareUrl: "https://smallbusiness.yahoo.com" },
  { name: "YouTube", key: "youtube", icon: "▶️", color: "bg-red-600", shareUrl: "https://studio.youtube.com" },
  { name: "TikTok", key: "tiktok", icon: "🎵", color: "bg-black", shareUrl: "https://www.tiktok.com" },
  { name: "Instagram", key: "instagram", icon: "📷", color: "bg-pink-600", shareUrl: "https://business.instagram.com" }
];

export default function BlogManager() {
  const [user, setUser] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "company_news",
    tags: [],
    status: "draft",
    featured_image: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: [],
    platform_links: {}
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: allPosts } = useQuery({
    queryKey: ['all-blog-posts'],
    queryFn: () => base44.entities.BlogPost.list("-created_date", 100),
    initialData: []
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.BlogPost.create({
        ...postData,
        author_email: user.email,
        author_name: user.full_name || user.email,
        publish_date: postData.status === 'scheduled' ? new Date().toISOString() : null,
        platforms_shared: {},
        platform_links: postData.platform_links || {}
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-blog-posts']);
      alert("✅ Blog post created!");
      setShowEditor(false);
      resetForm();
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.BlogPost.update(editingPost.id, postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-blog-posts']);
      alert("✅ Blog post updated!");
      setShowEditor(false);
      setEditingPost(null);
      resetForm();
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId) => {
      return await base44.entities.BlogPost.delete(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-blog-posts']);
      alert("✅ Blog post deleted!");
    }
  });

  const publishPostMutation = useMutation({
    mutationFn: async (postId) => {
      return await base44.entities.BlogPost.update(postId, {
        status: 'published',
        publish_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-blog-posts']);
      alert("✅ Blog post published!");
    }
  });

  const markSharedMutation = useMutation({
    mutationFn: async ({ postId, platform, link }) => {
      const post = allPosts.find(p => p.id === postId);
      return await base44.entities.BlogPost.update(postId, {
        platforms_shared: {
          ...post.platforms_shared,
          [platform]: true
        },
        platform_links: {
          ...post.platform_links,
          [platform]: link || PLATFORMS.find(p => p.key === platform).shareUrl
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-blog-posts']);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setPostData({ ...postData, featured_image: result.file_url });
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Image upload failed");
    }
  };

  const handleAIContentApply = (generatedContent) => {
    setPostData({
      ...postData,
      ...generatedContent
    });
  };

  const resetForm = () => {
    setPostData({
      title: "",
      content: "",
      excerpt: "",
      category: "company_news",
      tags: [],
      status: "draft",
      featured_image: "",
      seo_title: "",
      seo_description: "",
      seo_keywords: [],
      platform_links: {}
    });
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setPostData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      category: post.category,
      tags: post.tags || [],
      status: post.status,
      featured_image: post.featured_image || "",
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      seo_keywords: post.seo_keywords || [],
      platform_links: post.platform_links || {}
    });
    setShowEditor(true);
  };

  const handleShareToPlatform = (postId, platform) => {
    const link = prompt(`Enter the ${platform} link for this post:`);
    if (link) {
      markSharedMutation.mutate({ postId, platform, link });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredPosts = searchTerm
    ? allPosts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allPosts;

  const draftPosts = filteredPosts.filter(p => p.status === 'draft');
  const publishedPosts = filteredPosts.filter(p => p.status === 'published');
  const scheduledPosts = filteredPosts.filter(p => p.status === 'scheduled');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-blue-400" />
              Blog Manager
            </h1>
            <p className="text-gray-400">Create, manage, and share blog posts across all platforms</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAIHelper(!showAIHelper)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {showAIHelper ? 'Hide' : 'Show'} AI Helper
            </Button>
            <Button
              onClick={() => {
                setShowEditor(!showEditor);
                setEditingPost(null);
                resetForm();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* AI Content Generator Sidebar */}
        {showAIHelper && (
          <AIContentGenerator onApplyContent={handleAIContentApply} />
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-blue-900 border-blue-700">
            <FileText className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Posts</p>
            <p className="text-4xl font-bold text-blue-400">{allPosts.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Published</p>
            <p className="text-4xl font-bold text-green-400">{publishedPosts.length}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Edit className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Drafts</p>
            <p className="text-4xl font-bold text-yellow-400">{draftPosts.length}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <Calendar className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Scheduled</p>
            <p className="text-4xl font-bold text-purple-400">{scheduledPosts.length}</p>
          </Card>
        </div>

        {/* Editor */}
        {showEditor && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingPost) {
                updatePostMutation.mutate();
              } else {
                createPostMutation.mutate();
              }
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Title *</label>
                  <Input
                    value={postData.title}
                    onChange={(e) => setPostData({...postData, title: e.target.value})}
                    required
                    placeholder="Enter blog post title..."
                    className="bg-gray-700 border-gray-600 text-white text-lg"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Category *</label>
                  <select
                    value={postData.category}
                    onChange={(e) => setPostData({...postData, category: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="company_news">Company News</option>
                    <option value="car_tips">Car Tips</option>
                    <option value="financing">Financing</option>
                    <option value="how_to">How To</option>
                    <option value="customer_stories">Customer Stories</option>
                    <option value="industry_news">Industry News</option>
                    <option value="promotions">Promotions</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Status *</label>
                  <select
                    value={postData.status}
                    onChange={(e) => setPostData({...postData, status: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Featured Image</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    {postData.featured_image && (
                      <img src={postData.featured_image} alt="Preview" className="h-16 w-24 object-cover rounded" />
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Excerpt</label>
                  <Textarea
                    value={postData.excerpt}
                    onChange={(e) => setPostData({...postData, excerpt: e.target.value})}
                    placeholder="Short preview of the post..."
                    className="bg-gray-700 border-gray-600 text-white h-20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Content *</label>
                  <Textarea
                    value={postData.content}
                    onChange={(e) => setPostData({...postData, content: e.target.value})}
                    required
                    placeholder="Write your blog post content here..."
                    className="bg-gray-700 border-gray-600 text-white h-64"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">SEO Title</label>
                  <Input
                    value={postData.seo_title}
                    onChange={(e) => setPostData({...postData, seo_title: e.target.value})}
                    placeholder="SEO optimized title..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">SEO Description</label>
                  <Input
                    value={postData.seo_description}
                    onChange={(e) => setPostData({...postData, seo_description: e.target.value})}
                    placeholder="Meta description..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditor(false);
                    setEditingPost(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPostMutation.isLoading || updatePostMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </Card>

        {/* Posts Tabs */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-700">
              <TabsTrigger value="all">All ({filteredPosts.length})</TabsTrigger>
              <TabsTrigger value="published">Published ({publishedPosts.length})</TabsTrigger>
              <TabsTrigger value="draft">Drafts ({draftPosts.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled ({scheduledPosts.length})</TabsTrigger>
            </TabsList>

            {[
              { value: 'all', posts: filteredPosts },
              { value: 'published', posts: publishedPosts },
              { value: 'draft', posts: draftPosts },
              { value: 'scheduled', posts: scheduledPosts }
            ].map(({ value, posts }) => (
              <TabsContent key={value} value={value}>
                {posts.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No posts found</p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post.id} className="p-6 bg-gray-700 border-gray-600">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-white text-xl">{post.title}</h3>
                              <Badge className={
                                post.status === 'published' ? 'bg-green-600' :
                                post.status === 'scheduled' ? 'bg-purple-600' :
                                post.status === 'draft' ? 'bg-yellow-600' : 'bg-gray-600'
                              }>
                                {post.status}
                              </Badge>
                              {post.ai_generated && (
                                <Badge className="bg-purple-600">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{post.excerpt || post.content.substring(0, 100)}...</p>
                            <div className="flex gap-2 mb-3">
                              <Badge className="bg-blue-600">{post.category?.replace('_', ' ')}</Badge>
                              <span className="text-xs text-gray-500">
                                {post.created_date && new Date(post.created_date).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                Views: {post.views || 0}
                              </span>
                            </div>

                            {/* Platform Share Buttons */}
                            <div className="flex flex-wrap gap-2">
                              {PLATFORMS.map((platform) => (
                                <Button
                                  key={platform.key}
                                  size="sm"
                                  onClick={() => handleShareToPlatform(post.id, platform.key)}
                                  className={`${platform.color} hover:opacity-80 ${
                                    post.platforms_shared?.[platform.key] ? 'ring-2 ring-green-400' : ''
                                  }`}
                                  title={post.platforms_shared?.[platform.key] ? 'Already shared' : `Share to ${platform.name}`}
                                >
                                  {platform.icon} {platform.name}
                                  {post.platforms_shared?.[platform.key] && ' ✓'}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {post.featured_image && (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-32 h-24 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(post)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {post.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => publishPostMutation.mutate(post.id)}
                              disabled={publishPostMutation.isLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Publish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              if (confirm("Delete this post?")) {
                                deletePostMutation.mutate(post.id);
                              }
                            }}
                            disabled={deletePostMutation.isLoading}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}