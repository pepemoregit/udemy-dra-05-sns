from django.shortcuts import render
from rest_framework import generics, authentication, permissions
from api_user import serializers
from core.models import Profile, FriendRequest
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework import status
from rest_framework.response import Response
from core import custompermissions


# ユーザー新規作成ビュー
class CreateUserView(generics.CreateAPIView):
    serializer_class = serializers.UserSerializer


# 友達申請ビューセット
class FriendRequestViewSet(viewsets.ModelViewSet):
    queryset = FriendRequest.objects.all()
    serializer_class = serializers.FriendRequestSerializer
    # 認証クラス(tokenを指定)
    authentication_classes = (authentication.TokenAuthentication,)
    # パーミッションクラス(認証されているユーザーのみビューを表示)
    permission_classes = (permissions.IsAuthenticated,)

    # getでアクセスがあった場合
    # 自分宛または自分からの友達申請と一致しているオブジェクトだけを取得
    def get_queryset(self):
        return self.queryset.filter(Q(askTo=self.request.user) | Q(askFrom=self.request.user))

    # 友達申請の新規作成をオーバーライド
    # ログインしているユーザーを自動でaskFromに割り当てる
    # askFromとaskToはユニークの制限をかけたため、エラーの場合はメッセージ表示
    def perform_create(self, serializer):
        try:
            serializer.save(askFrom=self.request.user)
        except:
            raise ValidationError("User can have only unique request")

    # Deleteは不要なので、destroyをオーバーライド
    def destroy(self, request, *args, **kwargs):
        response = {'message': 'Delete is not allowed !'}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)

    # 部分的更新も許可しないので、partial_updateをオーバーライド
    def partial_update(self, request, *args, **kwargs):
        response = {'message': 'Patch is not allowed !'}
        return Response(response, status=status.HTTP_400_BAD_REQUEST)


# プロフィールビューセット
class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = serializers.ProfileSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    # パーミッションクラス
    # 認証されているユーザーのみビューを表示、ログインユーザー自身のプロフィールのみ更新と削除が可能
    permission_classes = (permissions.IsAuthenticated, custompermissions.ProfilePermission)

    # 新規作成をオーバーライド
    # ログインユーザーをuserProに割り当てる
    def perform_create(self, serializer):
        serializer.save(userPro=self.request.user)


# プロフィールリストビュー
class MyProfileListView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = serializers.ProfileSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return self.queryset.filter(userPro=self.request.user)
