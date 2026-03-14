from django.urls import path
from blog.cloudinary_upload import CloudinaryUploadAPIView
from blog.views import BlogEditAPIView, BlogPostCreateAPIView, BlogPostDetailAPIView, BlogPostListAPIView, CategoryCreateAPIView, CategoryListAPIView, CategoryUpdateAPIView

urlpatterns = [
    path('cloudinary-upload/', CloudinaryUploadAPIView.as_view(), name='cloudinary_upload'),
    
    path('category-create/', CategoryCreateAPIView.as_view(), name='category_create'),
    
    path('category-list/', CategoryListAPIView.as_view(), name='category_list'),
    
    path('category-update/<int:id>/', CategoryUpdateAPIView.as_view(), name='category_update'),
    
    path('blog-post-create/', BlogPostCreateAPIView.as_view(), name='blog_post_create'),
    
    path('blog-post-list/', BlogPostListAPIView.as_view(), name='blog_post_list'),
    
    path('blog-post-detail/<int:id>/', BlogPostDetailAPIView.as_view(), name='blog_post_detail'),
    
    path('blog-edit/<int:id>/', BlogEditAPIView.as_view(), name='blog_edit'),
]