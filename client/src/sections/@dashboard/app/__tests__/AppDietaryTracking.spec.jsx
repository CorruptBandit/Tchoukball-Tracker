// noinspection JSCheckFunctionSignatures

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, fireEvent, waitFor} from '@testing-library/react';
import {useAuth} from '../../../../context/AuthContext';
import {AppDietaryTracking} from "../index";
import '@testing-library/jest-dom';

global.encodeURI = vi.fn();

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));


describe('AppDietaryTracking Component', () => {
    beforeEach(() => {
        console.error = vi.fn();
        vi.clearAllMocks();
    });

    useAuth.mockImplementation(() => ({
        isLoggedIn: true, email: 'dave@gmail.com'
    }));

    const mockChartData = [{label: '2024-05-10', value: 60}, {label: '2024-05-11', value: 63},];

    it('ADT.1: renders without crashing', () => {
        // Renders AppDietaryTracking component
        const {container} = render(<AppDietaryTracking
            title="Dietary Tracking"
            subheader="Daily Intake"
            chartData={mockChartData}
        />);

        // Checks if correctly rendered
        expect(container).toBeInTheDocument();
    });

    it('ADT.2: renders loading indicator when loading', () => {
        // Renders AppDietaryTracking component
        const {getByTestId} = render(<AppDietaryTracking
            title="Dietary Tracking"
            subheader="Daily Intake"
            chartData={mockChartData}
        />);

        // Checks if loading indicator appeared
        expect(getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('ADT.3: calls export function when export button is clicked', async () => {
        // Renders AppDietaryTracking component
        const {getByText} = render(<AppDietaryTracking
            title="Dietary Tracking"
            subheader="Daily Intake"
            chartData={mockChartData}
        />);

        fireEvent.click(getByText('Export to CSV'));

        // Check data is exported after button is clicked
        await waitFor(() => {
            const expectedCSVContent = 'data:text/csv;charset=utf-8,2024-05-10,60\n2024-05-11,63';
            expect(global.encodeURI).toHaveBeenCalledWith(expectedCSVContent);
        });
    });
})