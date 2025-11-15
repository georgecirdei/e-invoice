'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import apiClient from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

export default function PagesManagementPage() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', slug: '', metaDescription: '', blocks: '[]' });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/pages');
      setPages(response.data.data.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/pages', {
        ...formData,
        blocks: JSON.parse(formData.blocks || '[]'),
      });
      setShowCreateForm(false);
      setFormData({ title: '', slug: '', metaDescription: '', blocks: '[]' });
      loadPages();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create page');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    try {
      await apiClient.delete(`/pages/${id}`);
      loadPages();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete page');
    }
  };

  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.put(`/pages/${id}`, {
        isPublished: !currentStatus,
      });
      loadPages();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update page');
    }
  };

  return (
    <ProtectedRoute><MainLayout><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold tracking-tight">📝 Pages Management</h1>
            <Button size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : '+ Create Page'}
            </Button>
          </div><div>
          {error && <Alert type="error" className="mb-6">{error}</Alert>}

          {showCreateForm && (
            <Card className="mb-6 shadow-lg border-primary/20">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-primary/5">
                <CardTitle className="text-xl">✨ Create New Page</CardTitle>
                <CardDescription>Build a professional landing page with custom blocks</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">
                        Page Title <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        placeholder="e.g., Home Page, Pricing, About Us"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-foreground">
                        URL Slug <span className="text-destructive">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">/cms/</span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          className="flex-1 px-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                          placeholder="home, pricing, about"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Lowercase, use hyphens for spaces</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Meta Description (SEO)
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="w-full px-4 py-2.5 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                      rows={3}
                      placeholder="Brief description for search engines (150-160 characters)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{formData.metaDescription.length}/160 characters</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-foreground">
                      Page Blocks (JSON) <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      value={formData.blocks}
                      onChange={(e) => setFormData({ ...formData, blocks: e.target.value })}
                      className="w-full px-4 py-3 border border-input rounded-lg bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm transition-all resize-none"
                      rows={12}
                      placeholder={'[\n  {\n    "blockType": "hero",\n    "title": "Welcome",\n    "subtitle": "..."\n  }\n]'}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        📖 See <a href="/docs" className="text-primary underline">documentation</a> for block examples
                      </p>
                      <p className="text-xs text-muted-foreground">{formData.blocks.length} characters</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t">
                    <Button type="submit">
                      ✨ Create Page
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowCreateForm(false);
                      setFormData({ title: '', slug: '', metaDescription: '', blocks: '[]' });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">📄 All Pages ({pages.length})</CardTitle>
                  <CardDescription className="mt-1">Manage your landing pages and content</CardDescription>
                </div>
                {pages.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {pages.filter(p => p.isPublished).length} published • {pages.filter(p => !p.isPublished).length} draft
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading pages...</p>
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/30">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first landing page to get started!</p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    + Create First Page
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {pages.map((page) => (
                    <div key={page.id} className="group flex justify-between items-center p-4 border rounded-lg hover:border-primary/50 hover:shadow-md transition-all bg-card">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{page.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            page.isPublished 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>
                            {page.isPublished ? '✅ Published' : '📝 Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                            /cms/{page.slug}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Updated {new Date(page.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant={page.isPublished ? 'outline' : 'default'} 
                          size="sm" 
                          onClick={() => handlePublish(page.id, page.isPublished)}
                          className={page.isPublished ? '' : 'bg-green-600 text-white hover:bg-green-700'}
                        >
                          {page.isPublished ? '📝 Unpublish' : '✅ Publish'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(`/cms/${page.slug}`, '_blank')}
                          className="hover:bg-primary/10"
                        >
                          👁️ View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDelete(page.id)}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div></MainLayout></ProtectedRoute>
  );
}

