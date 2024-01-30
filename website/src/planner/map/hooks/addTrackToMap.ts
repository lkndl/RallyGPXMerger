import { Point, Track } from 'gpxparser';
import { CalculatedTrack, GpxSegment } from '../../store/types.ts';
import L, { LayerGroup } from 'leaflet';
import { SimpleGPX } from '../../../utils/SimpleGPX.ts';
import { getColorFromUuid } from '../../../utils/colorUtil.ts';
import { endIcon, startIcon } from '../../../common/MapIcons.ts';
import { getTimeDifferenceInSeconds } from '../../../utils/dateUtil.ts';
import { isZipTrack, ZipTrack } from '../../../versions/store/types.ts';

function toLatLng(point: Point): { lat: number; lng: number } {
    return { lat: point.lat, lng: point.lon };
}

export interface MapOptions {
    showMarker: boolean;
    onlyShowBreaks?: boolean;
    color?: string;
    opacity?: number;
    weight?: number;
}

function addStartAndBreakMarker(
    options: MapOptions,
    lastTrack: Track | null,
    trackPoints: {
        lat: number;
        lng: number;
    }[],
    gpxSegment: CalculatedTrack | GpxSegment,
    routeLayer: LayerGroup<any>,
    track: Track
) {
    if (options.showMarker) {
        if (lastTrack === null) {
            const startMarker = L.marker(trackPoints[0], {
                icon: startIcon,
                title: `Start von ${gpxSegment.filename}`,
            });
            startMarker.addTo(routeLayer);
        }

        if (lastTrack !== null) {
            const lastTrackTime = lastTrack.points[lastTrack.points.length - 1].time.toISOString();
            const nextTrackTime = track.points[0].time.toISOString();
            const timeDifferenceInSeconds = getTimeDifferenceInSeconds(nextTrackTime, lastTrackTime);
            if (timeDifferenceInSeconds > 4 * 60) {
                const endMarker = L.marker(trackPoints[0], {
                    icon: endIcon,
                    title: `${gpxSegment.filename} - ${(timeDifferenceInSeconds / 60).toFixed(0)} min Pause`,
                });
                endMarker.addTo(routeLayer);
            }
        }
    }
}

export function addTrackToMap(gpxSegment: CalculatedTrack | GpxSegment, routeLayer: LayerGroup, options: MapOptions) {
    const gpx = SimpleGPX.fromString(gpxSegment.content);
    let lastTrack: Track | null = null;
    gpx.tracks.forEach((track) => {
        const trackPoints = track.points.map(toLatLng);
        const connection = L.polyline(trackPoints, {
            weight: options.weight ?? 8,
            color: options.color ?? getColorFromUuid(gpxSegment.id),
            opacity: options.opacity ?? 0.6,
        }).bindTooltip(gpxSegment.filename, {
            sticky: true,
        });
        connection.addTo(routeLayer);
        if (options.onlyShowBreaks) {
            addStartAndBreakMarker(options, lastTrack, trackPoints, gpxSegment, routeLayer, track);
        } else {
            if (options.showMarker) {
                const startMarker = L.marker(trackPoints[0], {
                    icon: startIcon,
                    title: gpxSegment.filename,
                });
                startMarker.addTo(routeLayer);
                const endMarker = L.marker(trackPoints.reverse()[0], {
                    icon: endIcon,
                    title: gpxSegment.filename,
                });
                endMarker.addTo(routeLayer);
            }
        }
        lastTrack = track;
    });
}

export function addTracksToLayer(
    calculatedTracksLayer: React.MutableRefObject<LayerGroup | null>,
    calculatedTracks: CalculatedTrack[] | GpxSegment[] | ZipTrack[],
    show: boolean,
    options: MapOptions
) {
    const current = calculatedTracksLayer.current;
    if (!calculatedTracksLayer || !current) {
        return;
    }
    current.clearLayers();
    if (show) {
        calculatedTracks.forEach((track) => {
            const enhancedOptions = isZipTrack(track) ? { ...options, color: track.color } : options;
            addTrackToMap(track, current, enhancedOptions);
        });
    }
}