from accounts.repositories import UserRepository

class UserService:
    @staticmethod
    def approve_vendor(user_id: int):
        user = UserRepository.get_by_id(user_id)
        if not user or user.role != 'vendor':
            raise ValueError("Invalid vendor account")
        if user.vendor_status == 'approved':
            return user
            
        UserRepository.update_profile(user, vendor_status='approved')
        # Future: Trigger NotificationService event here
        return user

    @staticmethod
    def reject_vendor(user_id: int):
        user = UserRepository.get_by_id(user_id)
        if not user or user.role != 'vendor':
            raise ValueError("Invalid vendor account")
            
        UserRepository.update_profile(user, vendor_status='rejected')
        # Future: Trigger NotificationService event here
        return user
