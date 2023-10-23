import { mergeAndAdjustTimes } from '../primitiveSolver.ts';
import { CalculatedTrack, GpxSegment, TrackComposition } from '../../../store/types.ts';
import { Mock } from 'vitest';
import { shiftEndDate } from '../../shiftEndDate.ts';
import { BREAK_IDENTIFIER } from '../../types.ts';
import { mergeAndDelayAndAdjustTimes } from '../../withPeoples/withPeoplesSolver.ts';

import { mergeGpxs } from '../../gpxMerger.ts';
import { letTimeInGpxEndAt } from '../../gpxTimeShifter.ts';
import { getStartTimeOfGpxTrack } from '../../startTimeExtractor.ts';

vi.mock('../../gpxMerger.ts');
vi.mock('../../gpxTimeShifter.ts');
vi.mock('../../startTimeExtractor.ts');
vi.mock('../../shiftEndDate.ts');

const solvers = [mergeAndAdjustTimes, mergeAndDelayAndAdjustTimes];

describe('primitiveSolver', () => {
    solvers.forEach((solver) =>
        describe(solver.name, () => {
            const arrivalDateTime = '2023-10-17T22:00:00.000Z';

            beforeEach(() => {
                (shiftEndDate as Mock).mockImplementation((date: string, breakInMinutes: number) => {
                    if (breakInMinutes === 0) {
                        return arrivalDateTime;
                    }
                    expect({ date, breakInMinutes }).toBeUndefined();
                });
            });

            it('merge A1 and AB to A and B1 and AB to B - Ignoring People and Time shift', () => {
                // given
                const gpxSegments: GpxSegment[] = [
                    { id: '1', filename: 'A1', content: 'cA1' },
                    { id: '2', filename: 'B1', content: 'cB1' },
                    { id: '3', filename: 'AB', content: 'cAB' },
                ];
                const trackCompositions: TrackComposition[] = [
                    { id: '1', name: 'A', segmentIds: ['1', '3'] },
                    { id: '2', name: 'B', segmentIds: ['2', '3'] },
                ];

                const expectedCalculatedTracks: CalculatedTrack[] = [
                    { id: '1', filename: 'A', content: 'cA' },
                    { id: '2', filename: 'B', content: 'cB' },
                ];
                (mergeGpxs as Mock).mockImplementation((a: string, b: string) => {
                    if (a === 'cA1' && b === 'cAB') {
                        return 'cA';
                    }
                    if (a === 'cB1' && b === 'cAB') {
                        return 'cB';
                    }
                    expect({ a, b }).toBeUndefined();
                });
                // Ignore time shifting within this test
                (letTimeInGpxEndAt as Mock).mockImplementation((content: string, _: string) => content);
                (getStartTimeOfGpxTrack as Mock).mockImplementation((_: string) => arrivalDateTime);

                // when
                const calculatedTracks = solver(gpxSegments, trackCompositions, arrivalDateTime);

                // then
                expect(calculatedTracks).toEqual(expectedCalculatedTracks);
            });

            it('should set arrival date for one segment - one track', () => {
                // given
                const gpxSegments: GpxSegment[] = [{ id: '1', filename: 'A1', content: 'cA' }];
                const trackCompositions: TrackComposition[] = [{ id: '1', name: 'A', segmentIds: ['1'] }];

                const expectedCalculatedTracks: CalculatedTrack[] = [{ id: '1', filename: 'A', content: 'cA-shifted' }];

                (letTimeInGpxEndAt as Mock).mockImplementation((content: string, date: string) => {
                    if (content === 'cA' && date === arrivalDateTime) {
                        return 'cA-shifted';
                    }
                    expect({ content, date }).toBeUndefined();
                });

                // when
                const calculatedTracks = solver(gpxSegments, trackCompositions, arrivalDateTime);

                // then
                expect(calculatedTracks).toEqual(expectedCalculatedTracks);
            });

            it('should set arrival date for two segments - one track', () => {
                // given
                const gpxSegments: GpxSegment[] = [
                    { id: '1', filename: 'A1', content: 'cA1' },
                    { id: '2', filename: 'A2', content: 'cA2' },
                ];
                const trackCompositions: TrackComposition[] = [{ id: '1', name: 'A', segmentIds: ['1', '2'] }];

                const expectedCalculatedTracks: CalculatedTrack[] = [
                    { id: '1', filename: 'A', content: 'cA-shifted-and-merged' },
                ];

                (letTimeInGpxEndAt as Mock).mockImplementation((content: string, date: string) => {
                    if (content === 'cA1' && date === 'start-cA2-shifted') {
                        return 'cA1-shifted';
                    }
                    if (content === 'cA2' && date === arrivalDateTime) {
                        return 'cA2-shifted';
                    }
                    expect({ content, date }).toBeUndefined();
                });
                (getStartTimeOfGpxTrack as Mock).mockImplementation((content: string) => {
                    switch (content) {
                        case 'cA2-shifted':
                            return 'start-cA2-shifted';
                        case 'cA1-shifted':
                            return 'irrelevant';
                        default:
                            expect({ content }).toBeUndefined();
                    }
                });
                (mergeGpxs as Mock).mockImplementation((a: string, b: string) => {
                    if (a === 'cA1-shifted' && b === 'cA2-shifted') {
                        return 'cA-shifted-and-merged';
                    }
                    expect({ a, b }).toBeUndefined();
                });

                // when
                const calculatedTracks = solver(gpxSegments, trackCompositions, arrivalDateTime);

                // then
                expect(calculatedTracks).toEqual(expectedCalculatedTracks);
            });

            it('should set arrival date for one segment and one break - one track', () => {
                // given
                const gpxSegments: GpxSegment[] = [{ id: '1', filename: 'A1', content: 'cA' }];
                const trackCompositions: TrackComposition[] = [
                    { id: '1', name: 'A', segmentIds: ['1', `30${BREAK_IDENTIFIER}1`] },
                ];
                const arrivalDateTime30min = 'arrivalDateTime - 30min';

                const expectedCalculatedTracks: CalculatedTrack[] = [{ id: '1', filename: 'A', content: 'cA-shifted' }];

                (letTimeInGpxEndAt as Mock).mockImplementation((content: string, date: string) => {
                    if (content === 'cA' && date === arrivalDateTime30min) {
                        return 'cA-shifted';
                    }
                    expect({ content, date }).toBeUndefined();
                });
                (shiftEndDate as Mock).mockImplementation((date: string, breakInMinutes: number) => {
                    if (date === arrivalDateTime && breakInMinutes === 30) {
                        return arrivalDateTime30min;
                    }
                    if (breakInMinutes === 0) {
                        return arrivalDateTime;
                    }
                    expect({ date, breakInMinutes }).toBeUndefined();
                });
                (getStartTimeOfGpxTrack as Mock).mockImplementation((_: string) => 'irrelevant');

                // when
                const calculatedTracks = solver(gpxSegments, trackCompositions, arrivalDateTime);

                // then
                expect(calculatedTracks).toEqual(expectedCalculatedTracks);
            });
        })
    );
});
