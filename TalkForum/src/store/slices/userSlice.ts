import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    id: number;
    email: string;
    name: string;
    role : string;
    avatarLink: string;
    backgroudLink: string;
    isLoggedIn: boolean;
}

const initialState: UserState = {
    id: 0,
    email: '',
    name: 'asdfaf',
    role: '',
    avatarLink: 'https://pic1.imgdb.cn/item/6905cbfa3203f7be00bf6e98.webp',
    backgroudLink: '',
    isLoggedIn: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userLogin: (state, action: PayloadAction<UserState>) => {
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.name = action.payload.name;
            state.role = action.payload.role;
            state.avatarLink = action.payload.avatarLink;
            state.backgroudLink = action.payload.backgroudLink;
            state.isLoggedIn = true;
        },
        userLogout: (state) => {
            state = {...initialState };
        }
        ,
    },
});


export const { userLogin, userLogout } = userSlice.actions;

export default userSlice.reducer;