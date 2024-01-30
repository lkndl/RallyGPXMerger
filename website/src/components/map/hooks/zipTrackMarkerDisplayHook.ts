import { useSelector } from 'react-redux';
import { MutableRefObject, useEffect } from 'react';
import L, { LayerGroup } from 'leaflet';
import { getCurrenMapTime, getShowCalculatedTracks } from '../../../planner/store/map.reducer.ts';
import { getZipCurrentMarkerPositionsForTracks } from './trackSimulationReader.ts';
import { bikeIcon } from '../MapIcons.ts';
import { getSelectedTracks, getSelectedVersions, getZipTracks } from '../../../versions/store/zipTracks.reducer.ts';

export function zipTrackMarkerDisplayHook(calculatedTracksLayer: MutableRefObject<LayerGroup | null>) {
    const zipTracks = useSelector(getZipTracks);
    const showTracks = useSelector(getShowCalculatedTracks);
    const currentMapTime = useSelector(getCurrenMapTime);
    const selectedTracks = useSelector(getSelectedTracks);
    const selectedVersions = useSelector(getSelectedVersions);
    const pointsToDisplay = useSelector(getZipCurrentMarkerPositionsForTracks);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        addTracksToLayer(calculatedTracksLayer, pointsToDisplay, showTracks);
    }, [zipTracks, showTracks, currentMapTime, selectedTracks, selectedVersions]);
}

export function addTrackToMap(
    points: { lat: number; lng: number }[],
    trackName: string,
    trackColor: string,
    routeLayer: LayerGroup
) {
    if (points.length === 0) {
        return;
    }
    const trackMarker = L.marker(points.reverse()[0], {
        icon: bikeIcon,
        title: trackName,
    });
    const trackSnake = L.polyline(points, { weight: 20, color: trackColor, opacity: 1 });
    trackMarker.addTo(routeLayer);
    trackSnake.addTo(routeLayer);
}

export function addTracksToLayer(
    calculatedTracksLayer: React.MutableRefObject<LayerGroup | null>,
    calculatedTracks: { trackPositions: { lat: number; lng: number }[]; name: string; color: string }[],
    show: boolean
) {
    const current = calculatedTracksLayer.current;

    if (!calculatedTracksLayer || !current) {
        return;
    }
    current.clearLayers();
    if (show) {
        calculatedTracks.forEach((track) => {
            addTrackToMap(track.trackPositions, track.name, track.color, current);
        });
    }
}
