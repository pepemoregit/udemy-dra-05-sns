from rest_framework import authentication, permissions
from api_dm import serializers
from core.models import Message
from rest_framework import viewsets
from rest_framework import status
from rest_framework.response import Response


# メッセージビューセット
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = serializers.MessageSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    # 自分が送信したデーターを返すようにフィルター設定
    def get_queryset(self):
        return self.queryset.filter(sender=self.request.user)

    # 新規作成時にログインユーザーをsenderにセット
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    # 削除は不要のため、オーバーライド
    def destroy(self, request, *args, **kwargs):
        response = {'message': 'Delete DM is not allowed'}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # 更新は不要のため、オーバーライド
    def update(self, request, *args, **kwargs):
        response = {'message': 'Update DM is not allowed'}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # 一部更新は不要のため、オーバーライド
    def partial_update(self, request, *args, **kwargs):
        response = {'message': 'Patch DM is not allowed'}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)


# メッセージ受信箱リストビューセット
class InboxListView(viewsets.ReadOnlyModelViewSet):
    queryset = Message.objects.all()
    serializer_class = serializers.MessageSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    # 自分が送信したデーターを返すようにフィルター設定
    def get_queryset(self):
        return self.queryset.filter(receiver=self.request.user)
