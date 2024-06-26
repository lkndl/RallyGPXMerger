import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { ErrorBoundary } from './common/ErrorBoundary.tsx';
import { RallyVersionControl } from './versions/RallyVersionControl.tsx';
import { RallyPlannerWrapper } from './planner/RallyPlanner.tsx';

export function App() {
    const urlParams = window.location.search;
    const hasExternalUrl = urlParams.includes('?version=');

    return <ErrorBoundary>{hasExternalUrl ? <RallyVersionControl /> : <RallyPlannerWrapper />}</ErrorBoundary>;
}
