import { createSlice, PayloadAction, Reducer } from '@reduxjs/toolkit';
import { MapState, State } from './types';
import { storage } from './storage.ts';

const initialState: MapState = {
    currentTime: 0,
};

const mapSlice = createSlice({
    name: 'map',
    initialState: storage.load()?.map ?? initialState,
    reducers: {
        setCurrentTime: (state: MapState, action: PayloadAction<number>) => {
            state.currentTime = action.payload;
        },
        setStartAndEndTime: (state: MapState, action: PayloadAction<{ start: string; end: string }>) => {
            state.start = action.payload.start;
            state.end = action.payload.end;
        },
        setCenterPoint: (state: MapState, action: PayloadAction<{ lat: number; lng: number; zoom: number }>) => {
            state.centerPoint = action.payload;
        },
        setShowMapMarker: (state: MapState, action: PayloadAction<boolean>) => {
            state.showMapMarker = action.payload;
        },
        setShowBlockStreets: (state: MapState, action: PayloadAction<boolean>) => {
            state.showBlockStreets = action.payload;
        },
        setShowCalculatedTracks: (state: MapState, action: PayloadAction<boolean>) => {
            state.showCalculatedTracks = action.payload;
        },
        setShowGpxSegments: (state: MapState, action: PayloadAction<boolean>) => {
            state.showGpxSegments = action.payload;
        },
    },
});

export const mapActions = mapSlice.actions;
export const mapReducer: Reducer<MapState> = mapSlice.reducer;
const getBase = (state: State) => state.map;
export const getCurrenMapTime = (state: State) => getBase(state).currentTime;
export const getStartMapTime = (state: State) => getBase(state).start;
export const getEndMapTime = (state: State) => getBase(state).end;
export const getCenterPoint = (state: State) => getBase(state).centerPoint;
export const getShowMapMarker = (state: State) => getBase(state).showMapMarker ?? false;
export const getShowBlockStreets = (state: State) => getBase(state).showBlockStreets ?? false;
export const getShowCalculatedTracks = (state: State) => getBase(state).showCalculatedTracks ?? false;
export const getShowGpxSegments = (state: State) => getBase(state).showGpxSegments ?? false;
