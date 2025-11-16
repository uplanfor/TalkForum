import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    id: number;
    email: string;
    name: string;
    role : string;
    intro: string;
    avatarLink: string;
    backgroundLink: string;
    isLoggedIn: boolean;
}

const initialState: UserState = {
    id: 0,
    email: 'please@login.com',
    name: 'Unknown',
    intro: "Please login and you will see more fun!",
    role: 'USER',
    avatarLink: 'https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp',
    backgroundLink: 'https://img-s.msn.cn/tenant/amp/entityid/BB1msDBR?w=0&h=0&q=50&m=6&f=jpg&u=t',
    isLoggedIn: false,
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
            return {...action.payload, isLoggedIn: true }
        },
        userLogout: (state) => {
            // state = {...initialState };
            // 正确的写法
            return {...initialState }
        }
        ,
    },
});


export const { userLogin, userLogout } = userSlice.actions;

export default userSlice.reducer;