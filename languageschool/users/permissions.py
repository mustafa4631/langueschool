from rest_framework import permissions

class IsAdminUserType(permissions.BasePermission):
    """
    Sadece user_type değeri 'admin' olan kullanıcılara izin verir.
    """
    message = "Bu işlemi gerçekleştirmek için yönetici yetkisine sahip olmalısınız."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.user_type == 'admin'
        )