import { Point } from 'gpxparser';
import date from 'date-and-time';
import { PARTICIPANTS_DELAY_IN_SECONDS } from '../../../store/trackMerge.reducer.ts';
import { TrackWayPointType } from '../types.ts';
import geoDistance from 'geo-distance-helper';
import { toLatLng } from '../../merge/speedSimulator.ts';
import { getTimeDifferenceInSeconds } from '../../../../utils/dateUtil.ts';
import { NodePosition } from '../selectors/getNodePositions.ts';

export interface EnrichedPoints extends PointS {
    street: string | null;
}

export interface PointS extends Omit<Point, 'time'> {
    time: string;
}

interface AggregatedPoints {
    streetName: string | null;
    frontArrival: string;
    frontPassage: string;
    backArrival: string;
    pointFrom: { lat: number; lon: number };
    pointTo: { lat: number; lon: number };
    type?: TrackWayPointType;
    breakLength?: number;
    nodeTracks?: string[];
}

export function anyStreetNameMatch(streetName: string | null, lastStreetName: string | null): boolean {
    if (!streetName && !lastStreetName) {
        return true;
    }
    if (!streetName || !lastStreetName) {
        return false;
    }
    const streetNameElements = streetName.split(', ');
    return lastStreetName.startsWith(streetNameElements[0]);
}

export function takeMostDetailedStreetName(streetName: string | null, lastStreetName: string | null): string | null {
    if (!streetName && !lastStreetName) {
        return null;
    }
    if (!streetName || !lastStreetName) {
        return lastStreetName ? lastStreetName : streetName;
    }
    if (!anyStreetNameMatch(streetName, lastStreetName)) {
        return streetName;
    }
    const streetNameElements = streetName.split(', ');
    const lastStreetNameElements = lastStreetName.split(', ');
    return [...new Set([...lastStreetNameElements, ...streetNameElements])].join(', ');
}

const extractLatLon = ({ lat, lon }: EnrichedPoints) => ({ lat, lon });

function shiftEndTimeByParticipants(endDateTime: string, participants: number): string {
    return date.addSeconds(new Date(endDateTime), participants * PARTICIPANTS_DELAY_IN_SECONDS).toISOString();
}

function useLastKnownStreet(lastElement: AggregatedPoints, point: EnrichedPoints, participants: number) {
    return {
        ...lastElement,
        backArrival: shiftEndTimeByParticipants(point.time, participants),
        frontPassage: point.time,
        pointTo: extractLatLon(point),
    };
}

function getMatchingNodePosition(
    nodePositions: NodePosition[],
    point: { lat: number; lon: number }
): NodePosition | undefined {
    return nodePositions.find(
        (nodePosition) => (geoDistance(toLatLng(nodePosition.point), toLatLng(point)) as number) < 0.0000001
    );
}

function isABreak(lastElement: AggregatedPoints, point: EnrichedPoints) {
    const distance = geoDistance(toLatLng(lastElement.pointTo), toLatLng(point)) as number;
    const timeDifference = getTimeDifferenceInSeconds(point.time, lastElement.frontPassage);
    return distance < 0.01 && timeDifference > 200;
}

function createAggregatedPoint(point: EnrichedPoints, participants: number, type: TrackWayPointType) {
    return {
        streetName: point.street,
        backArrival: shiftEndTimeByParticipants(point.time, participants),
        frontPassage: point.time,
        frontArrival: point.time,
        pointFrom: extractLatLon(point),
        pointTo: extractLatLon(point),
        type: type,
    };
}

export function aggregateEnrichedPoints(
    enrichedPoints: EnrichedPoints[],
    participants: number,
    nodePositions: NodePosition[]
): AggregatedPoints[] {
    const aggregatedPoints: AggregatedPoints[] = [];
    enrichedPoints.forEach((point, index) => {
        if (point.street === null && index === 0) {
            return;
        }
        if (aggregatedPoints.length === 0) {
            aggregatedPoints.push(createAggregatedPoint(point, participants, TrackWayPointType.Track));
            return;
        }

        const lastIndex = aggregatedPoints.length - 1;
        const lastElement = aggregatedPoints[lastIndex];

        if (point.street === null && index > 0 && enrichedPoints[index - 1].street !== null) {
            aggregatedPoints[lastIndex] = useLastKnownStreet(lastElement, point, participants);
            return;
        }

        if (point.street === null && index > 1 && enrichedPoints[index - 2].street !== null) {
            aggregatedPoints[lastIndex] = useLastKnownStreet(lastElement, point, participants);
            return;
        }

        if (point.street === null && index > 2 && enrichedPoints[index - 3].street !== null) {
            aggregatedPoints[lastIndex] = useLastKnownStreet(lastElement, point, participants);
            return;
        }

        if (point.street === null && index > 3 && enrichedPoints[index - 4].street !== null) {
            aggregatedPoints[lastIndex] = useLastKnownStreet(lastElement, point, participants);
            return;
        }

        const lastStreetName = lastElement.streetName;
        const streetName = point.street;

        if (isABreak(lastElement, point) && lastElement.type !== TrackWayPointType.Break) {
            aggregatedPoints.push({
                streetName: point.street,
                backArrival: shiftEndTimeByParticipants(point.time, participants),
                frontPassage: lastElement.frontArrival,
                frontArrival: lastElement.frontArrival,
                pointFrom: extractLatLon(point),
                pointTo: extractLatLon(point),
                type: TrackWayPointType.Break,
                breakLength: getTimeDifferenceInSeconds(point.time, lastElement.frontPassage) / 60,
            });
            return;
        }

        const matchingNodePosition = getMatchingNodePosition(nodePositions, point);
        if (matchingNodePosition) {
            const nodePoints = aggregatedPoints.filter((aggPoint) => aggPoint.type === TrackWayPointType.Node);

            const lastNodeTracks =
                nodePoints.length > 0 ? nodePoints[nodePoints.length - 1].nodeTracks?.join('') : undefined;

            if (
                !getMatchingNodePosition(nodePositions, lastElement.pointTo) &&
                lastNodeTracks !== matchingNodePosition.tracks?.join('')
            ) {
                aggregatedPoints.push({
                    ...createAggregatedPoint(point, participants, TrackWayPointType.Node),
                    nodeTracks: matchingNodePosition.tracks,
                });
            }
            return;
        }

        if (anyStreetNameMatch(streetName, lastStreetName) && lastElement.type === TrackWayPointType.Track) {
            const detailedStreetName = takeMostDetailedStreetName(streetName, lastStreetName);
            aggregatedPoints[lastIndex] = {
                ...lastElement,
                streetName: detailedStreetName,
                backArrival: shiftEndTimeByParticipants(point.time, participants),
                frontPassage: point.time,
                pointTo: extractLatLon(point),
                type: TrackWayPointType.Track,
            };
        } else {
            aggregatedPoints[lastIndex] = {
                ...lastElement,
                backArrival: shiftEndTimeByParticipants(point.time, participants),
                frontPassage: point.time,
                pointTo: extractLatLon(point),
            };
            aggregatedPoints.push(createAggregatedPoint(point, participants, TrackWayPointType.Track));
        }
    });
    return aggregatedPoints;
}
