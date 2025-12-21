import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DefaultBackgroundUrl, DefaultAvatarUrl } from '../../constants/default';
import type { AuthInfo } from '../../api/ApiAuth';

interface UserState extends AuthInfo {
    isLoggedIn: boolean;
}

const initialState: UserState = {
    id: 0,
    email: 'please@login.com',
    name: 'You have not logged in yet!',
    intro: 'Please login and you will see more fun!',
    role: 'USER',
    avatarLink: DefaultAvatarUrl,
    backgroundLink: DefaultBackgroundUrl,
    // lastLoginAt: null,
    isLoggedIn: false,
    fansCount: 0,
    followingCount: 0,
    following: [],
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userLogin: (state, action: PayloadAction<UserState>) => {
            // state.id = action.payload.id;
            // state.email = action.payload.email;
            // state.name = action.payload.name;
            // state.intro = action.payload.intro;
            // state.role = action.payload.role;
            // state.avatarLink = action.payload.avatarLink;
            // state.backgroundLink = action.payload.backgroundLink;
            // state.isLoggedIn = true;

            // 错误的写法，没有赋值给state
            // state = {
            //     ...action.payload,
            //     isLoggedIn: true,
            // }

            // 正确的写法，同上方，或者用下面这个
            // 返回新状态，Immer 会直接使用这个新对象
            return { ...action.payload, isLoggedIn: true };
        },
        userLogout: state => {
            // state = {...initialState };
            // 正确的写法
            return { ...initialState };
        },
        changeUserFollowing: (state, action: PayloadAction<number>) => {
            const targetId = action.payload;
            const index = state.following.indexOf(targetId);
            if (index === -1) {
                state.following.push(targetId);
                state.followingCount += 1;
                if (targetId == state.id) {
                    state.fansCount += 1;
                }
            } else {
                state.following.splice(index, 1);
                state.followingCount -= 1;
                if (targetId == state.id) {
                    state.fansCount -= 1;
                }
            }
        },
    },
});

export const { userLogin, userLogout, changeUserFollowing } = userSlice.actions;

export default userSlice.reducer;
