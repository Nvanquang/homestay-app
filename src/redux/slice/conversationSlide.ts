import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callGetConversationsByUser } from '@/config/api';
import type { Conversation } from '@/components/chat/types';
import { isSuccessResponse } from '@/config/utils';

interface IState {
    isFetching: boolean;
    result: Conversation[];
}

const initialState: IState = {
    isFetching: true,
    result: []
};

export const fetchConversation = createAsyncThunk<Conversation[], string, { rejectValue: string }>(
    'conversation/fetchConversation',
    async (userId, { rejectWithValue }) => {
        try {
            const res = await callGetConversationsByUser(userId);
            if (isSuccessResponse(res)) {
                return res.data ?? [];
            } else {
                return rejectWithValue(res.message ?? 'Failed to fetch conversations');
            }
        } catch (e: any) {
            return rejectWithValue(e?.message ?? 'Failed to fetch conversations');
        }
    }
);

const conversationSlice = createSlice({
    name: 'conversation',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchConversation.pending, (state) => {
            state.isFetching = true;
        });
        builder.addCase(fetchConversation.fulfilled, (state, action) => {
            state.isFetching = false;
            state.result = action.payload; // <-- this is the list of conversations
        });
        builder.addCase(fetchConversation.rejected, (state) => {
            state.isFetching = false;
            // optionally reset or keep previous result
            // state.result = [];
        });
    }
});

export default conversationSlice.reducer;