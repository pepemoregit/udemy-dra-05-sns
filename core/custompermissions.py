from rest_framework import permissions


# プロフィールの更新や削除はログインしているユーザーだけに制限する
class ProfilePermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # SAFE_METHODSでない更新や削除はログインユーザーと一致している場合だけTrue
        return obj.userPro.id == request.user.id
