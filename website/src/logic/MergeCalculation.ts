import { State } from '../planner/store/types.ts';
import { AppDispatch } from '../planner/store/store.ts';
import { getGpxSegments, getSegmentSpeeds } from '../planner/store/gpxSegments.reducer.ts';
import {
    getArrivalDateTime,
    getAverageSpeedInKmH,
    getParticipantsDelay,
    getTrackCompositions,
    PARTICIPANTS_DELAY_IN_SECONDS,
    setParticipantsDelay,
} from '../planner/store/trackMerge.reducer.ts';
import { calculatedTracksActions } from '../planner/store/calculatedTracks.reducer.ts';
import { mergeAndDelayAndAdjustTimes } from './solver.ts';
import { mapActions } from '../planner/store/map.reducer.ts';
import { enrichGpxSegmentsWithTimeStamps } from './helper/enrichGpxSegmentsWithTimeStamps.ts';
import { SimpleGPX } from '../utils/SimpleGPX.ts';
import { initializeResolvedPositions } from '../mapMatching/initializeResolvedPositions.ts';
import date from 'date-and-time';
import { ReadableTrack } from '../common/types.ts';

let readableTracks: ReadableTrack[] | undefined = undefined;

export const clearReadableTracks = () => {
    readableTracks = undefined;
};

export const getReadableTracks = () => readableTracks;
export const setReadableTracks = (newReadableTracks: ReadableTrack[]) => {
    readableTracks = newReadableTracks;
};

export const extendReadableTracks = (newReadableTracks: ReadableTrack[]) => {
    if (readableTracks === undefined) {
        readableTracks = newReadableTracks;
    } else {
        readableTracks = [...readableTracks, ...newReadableTracks];
    }
};

export function calculateAndStoreStartAndEndOfSimulation(dispatch: AppDispatch, state: State) {
    const trackParticipants = getTrackCompositions(state).map((track) => track.peopleCount ?? 0);
    const maxDelay = Math.min(...trackParticipants);

    let endDate = '1990-10-14T10:09:57.000Z';
    let startDate = '9999-10-14T10:09:57.000Z';

    readableTracks?.forEach((track) => {
        if (track.gpx.getStart() < startDate) {
            startDate = track.gpx.getStart();
        }

        if (track.gpx.getEnd() > endDate) {
            endDate = track.gpx.getEnd();
        }
    });

    const payload = {
        start: startDate,
        end: date.addSeconds(new Date(endDate), maxDelay * PARTICIPANTS_DELAY_IN_SECONDS).toISOString(),
    };
    dispatch(mapActions.setStartAndEndTime(payload));
}

export function setStartAndEndTime(dispatch: AppDispatch) {
    const maxDelay = 0;

    let endDate = '1990-10-14T10:09:57.000Z';
    let startDate = '9999-10-14T10:09:57.000Z';

    readableTracks?.forEach((track) => {
        if (track.gpx.getStart() < startDate) {
            startDate = track.gpx.getStart();
        }

        if (track.gpx.getEnd() > endDate) {
            endDate = track.gpx.getEnd();
        }
    });

    const payload = {
        start: startDate,
        end: date.addSeconds(new Date(endDate), maxDelay * PARTICIPANTS_DELAY_IN_SECONDS).toISOString(),
    };
    dispatch(mapActions.setStartAndEndTime(payload));
}

export async function calculateMerge(dispatch: AppDispatch, getState: () => State) {
    const gpxSegments = getGpxSegments(getState());
    const trackCompositions = getTrackCompositions(getState());
    const arrivalDateTime = getArrivalDateTime(getState());
    const averageSpeed = getAverageSpeedInKmH(getState());
    const segmentSpeeds = getSegmentSpeeds(getState());

    if (!arrivalDateTime) {
        return;
    }

    // Clear caching of parsed gpx tracks for the calculated tracks
    clearReadableTracks();

    setParticipantsDelay(getParticipantsDelay(getState()));

    const gpxSegmentsWithTimeStamp = enrichGpxSegmentsWithTimeStamps(gpxSegments, averageSpeed, segmentSpeeds);

    const calculatedTracks = mergeAndDelayAndAdjustTimes(gpxSegmentsWithTimeStamp, trackCompositions, arrivalDateTime);

    dispatch(calculatedTracksActions.setCalculatedTracks(calculatedTracks));
    dispatch(mapActions.setShowCalculatedTracks(true));

    if (!readableTracks) {
        readableTracks = calculatedTracks.map((track) => ({ id: track.id, gpx: SimpleGPX.fromString(track.content) }));
        initializeResolvedPositions(dispatch);
    }
    calculateAndStoreStartAndEndOfSimulation(dispatch, getState());
    return Promise.resolve();
}
