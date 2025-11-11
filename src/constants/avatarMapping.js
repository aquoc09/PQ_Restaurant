import { myAssets } from "../assets/assets";

const DEFAULT_AVATAR_MAP = {
    // Nếu token có 'ROLE_ADMIN'
    'ROLE_ADMIN': myAssets.admin, 
    // Nếu token có 'ROLE_USER' hoặc 'ROLE_MANAGER' (sử dụng avatar chung)
    'ROLE_USER': myAssets.user, 
    'ROLE_MANAGER': myAssets.user, 
    // Mặc định
    'DEFAULT': myAssets.user 
};

export default DEFAULT_AVATAR_MAP;