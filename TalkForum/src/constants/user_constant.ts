export const UsersStatusEnum = {
    NORMAL: 'NORMAL',
    UNABLE: 'UNABLE',
};

export const UserRoleEnum = {
    USER: 'USER',
    MODERATOR: 'MODERATOR',
    ADMIN: 'ADMIN',
};

export type UserStatus = (typeof UsersStatusEnum)[keyof typeof UsersStatusEnum];
export type UserRole = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];
