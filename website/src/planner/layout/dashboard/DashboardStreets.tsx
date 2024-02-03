import { useDispatch, useSelector } from 'react-redux';
import { getCalculatedTracks } from '../../store/calculatedTracks.reducer.ts';
import { layoutActions } from '../../store/layout.reducer.ts';
import { getEnrichedTrackStreetInfos } from '../../logic/resolving/selectors/getEnrichedTrackStreetInfos.ts';
import { Button, Spinner } from 'react-bootstrap';
import { resolvePositions } from '../../logic/resolving/resolveStreetAndPostcodeInfo.ts';
import { AppDispatch } from '../../store/store.ts';
import { calculateTrackStreetInfos } from '../../logic/resolving/aggregate/calculateTrackStreetInfos.ts';
import {
    addPostCodeToStreetInfos,
    getPostCodeRequestProgress,
} from '../../logic/resolving/postcode/postCodeResolver.ts';
import {
    getIsAggregating,
    getIsLoadingGeoData,
    getNumberOfPostCodeRequestsRunning,
    getNumberOfRequestsRunning,
} from '../../store/geoCodingRequests.reducer.ts';
import { resolveStreetNames } from '../../logic/resolving/streets/mapMatchingStreetResolver.ts';
import { geoCodingActions, getResolvedPositions } from '../../store/geoCoding.reducer.ts';
import { Done } from './Done.tsx';
import { DashboardCard } from './DashboardCard.tsx';
import { Warning } from './Warning.tsx';
import { getRequestProgress } from '../../logic/resolving/selectors/requestEstimator.ts';

function StreetStatus(props: { done: boolean; loading: boolean }) {
    if (props.loading) {
        return <Spinner />;
    }
    if (props.done) {
        return <Done />;
    }
    return <Warning />;
}

export function DashboardStreets() {
    const hasMergedTracks = useSelector(getCalculatedTracks).length > 0;
    const hasEnrichedTracks = useSelector(getEnrichedTrackStreetInfos).length > 0;
    const postCodesDone = useSelector(getPostCodeRequestProgress) === 100;
    const streetRequestDone = useSelector(getRequestProgress) === 100;
    const resolvedPositions = useSelector(getResolvedPositions);
    const hasStreetInfo = Object.values(resolvedPositions).filter((value) => value !== null).length > 0;
    const streetsDone = streetRequestDone && hasStreetInfo;
    const dispatch: AppDispatch = useDispatch();

    const runningRequests = useSelector(getNumberOfRequestsRunning) > 0;
    const runningPostCodeRequests = useSelector(getNumberOfPostCodeRequestsRunning) > 0;
    const isLoading = useSelector(getIsLoadingGeoData);
    const isAggregating = useSelector(getIsAggregating);

    const ongoingRequests = runningRequests || runningPostCodeRequests || isLoading || isAggregating;

    return (
        <DashboardCard
            text={''}
            done={hasEnrichedTracks}
            canBeDone={hasMergedTracks}
            childrenOnly={true}
            onClick={() => {
                dispatch(layoutActions.selectSection('streets'));
                dispatch(layoutActions.setShowDashboard(false));
            }}
        >
            <div>
                <div className={'d-flex justify-content-between m-1'}>
                    <b>External info</b>
                    <Button
                        size={'sm'}
                        onClick={(event) => {
                            event.stopPropagation();
                            dispatch(layoutActions.selectSection('streets'));
                            resolvePositions && dispatch(resolvePositions);
                        }}
                        disabled={ongoingRequests}
                    >
                        Trigger All
                    </Button>
                </div>
                <div className={'d-flex justify-content-between m-1'}>
                    <Button
                        size={'sm'}
                        disabled={ongoingRequests}
                        onClick={(event) => {
                            event.stopPropagation();
                            dispatch(layoutActions.selectSection('streets'));
                            dispatch(resolveStreetNames);
                        }}
                    >
                        Street Info
                    </Button>
                    <StreetStatus done={streetsDone} loading={runningRequests} />
                </div>
                <div className={'d-flex justify-content-between m-1'}>
                    <Button
                        size={'sm'}
                        onClick={(event) => {
                            event.stopPropagation();
                            dispatch(layoutActions.selectSection('streets'));
                            dispatch(calculateTrackStreetInfos);
                        }}
                        disabled={ongoingRequests}
                    >
                        Aggregation
                    </Button>
                    <StreetStatus done={hasEnrichedTracks} loading={isAggregating} />
                </div>
                <div className={'d-flex justify-content-between m-1'}>
                    <Button
                        size={'sm'}
                        onClick={(event) => {
                            event.stopPropagation();
                            dispatch(layoutActions.selectSection('streets'));
                            dispatch(geoCodingActions.clearPostCodesAndDistricts());
                            dispatch(addPostCodeToStreetInfos);
                        }}
                        disabled={ongoingRequests}
                    >
                        PostCodes
                    </Button>
                    <StreetStatus done={postCodesDone} loading={runningPostCodeRequests} />
                </div>
            </div>
        </DashboardCard>
    );
}
