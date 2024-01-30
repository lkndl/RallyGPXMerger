import { createSlice, PayloadAction, Reducer } from '@reduxjs/toolkit';
import { VersionsState, MapState } from './types';

const initialState: MapState = {
    currentTime: 0,
};

const mapSlice = createSlice({
    name: 'map',
    initialState: initialState,
    reducers: {
        setCurrentTime: (state: MapState, action: PayloadAction<number>) => {
            state.currentTime = action.payload;
        },
        setStartAndEndTime: (state: MapState, action: PayloadAction<{ start: string; end: string }>) => {
            state.start = action.payload.start;
            state.end = action.payload.end;
        },
        setShowMapMarker: (state: MapState, action: PayloadAction<boolean>) => {
            state.showMapMarker = action.payload;
        },
    },
});

export const mapActions = mapSlice.actions;
export const mapReducer: Reducer<MapState> = mapSlice.reducer;
const getBase = (state: VersionsState) => state.map;
export const getCurrenMapTime = (state: VersionsState) => getBase(state).currentTime;
export const getShowMapMarker = (state: VersionsState) => getBase(state).showMapMarker ?? false;
