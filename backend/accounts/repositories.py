from django.contrib.auth import get_user_model

User = get_user_model()

class UserRepository:
    @staticmethod
    def get_by_id(user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def get_by_username(username):
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @staticmethod
    def create_user(username, password, email=None, role='client', **extra_fields):
        user = User(username=username, email=email, role=role, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    @staticmethod
    def update_profile(user, **fields):
        for field, value in fields.items():
            if hasattr(user, field):
                setattr(user, field, value)
        user.save()
        return user
