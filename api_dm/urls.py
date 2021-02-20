from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api_dm import views

app_name = 'dm'

# viewsetsを継承している場合はroutersを使用できる
# 同じシリアライザー(serializers.MessageSerializer)を参照しているため、
# 第3引数にbasenameを指定する
router = DefaultRouter()
router.register('message', views.MessageViewSet, basename="message")
router.register('inbox', views.InboxListView, basename='inbox')

urlpatterns = [
    path('', include(router.urls))
]
