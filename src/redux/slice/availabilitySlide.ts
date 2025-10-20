import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callGetAvailabilities } from '@/config/api';
import { IHomestayAvailability } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IHomestayAvailability[]
}
// First, create the thunk
export const fetchAvailability = createAsyncThunk(
    'availability/fetchAvailability',
    async ({ query }: { query: string }) => {
        const response = await callGetAvailabilities(query);
        return response;
    }
)


const initialState: IState = {
    isFetching: true,
    meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: []
};


export const availabilitySlide = createSlice({
    name: 'availability',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {


    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchAvailability.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchAvailability.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchAvailability.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta = action.payload.data.meta;
                state.result = action.payload.data.result;
            }
            // Add user to the state array

            // state.courseOrder = action.payload;
        })
    },

});

export const {

} = availabilitySlide.actions;

export default availabilitySlide.reducer;
