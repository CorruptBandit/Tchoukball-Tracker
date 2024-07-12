import { describe, it, expect, vi, beforeEach } from 'vitest';
import {render, fireEvent, waitFor, findByText} from '@testing-library/react';
import { useAuth } from '../../../../context/AuthContext';
import { AppExerciseTracking } from "../index";
import '@testing-library/jest-dom';

global.encodeURI = vi.fn();

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('AppExerciseTracking Component', () => {
    beforeEach(() => {
        console.error = vi.fn();
        vi.clearAllMocks();
    });

    useAuth.mockImplementation(() => ({
        isLoggedIn: true,
        email: 'dave@gmail.com'
    }));

    const chartData = [
        { data: [10, 20, 30] },
        { data: [15, 25, 35] },
        { data: [12, 22, 32] }
    ];
    const chartLabels = ['Label 1', 'Label 2', 'Label 3'];

    it('AET.1: renders loading indicator when loading', () => {
        // Renders AppExerciseTracking component
        const { getByTestId } = render(
            <AppExerciseTracking
                title="Test Title"
                subheader="Test Subheader"
                chartData={chartData}
                chartLabels={chartLabels}
            />
        );

        // Checks if correctly rendered
        expect(getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('AET.2: renders chart without crashing', async () => {
        // Renders AppExerciseTracking component
        const { findByTestId } = render(
            <AppExerciseTracking
                title="Test Title"
                subheader="Test Subheader"
                chartData={chartData}
                chartLabels={chartLabels}
            />
        );

        // Check if chart exists
        expect(findByTestId('bar-chart')).to.exist;
    });

    it('AET.3: switches tabs when clicked', async () => {
        const { findByTestId, getByText, findByText } = render(
            // Renders AppExerciseTracking component
            <AppExerciseTracking
                title="Test Title"
                subheader="Test Subheader"
                chartData={chartData}
                chartLabels={chartLabels}
            />
        );

        const tab2 = getByText('Label 2');
        fireEvent.click(tab2);

        // Check if chart renders with input data
        expect(findByTestId('bar-chart')).to.exist;
        expect(findByText("15, 25, 35")).to.exist;
    });


    it('AET.4: calls export function when export button is clicked', async () => {
        // Renders AppExerciseTracking component
        const { getByText } = render(
            <AppExerciseTracking
                title="Test Title"
                subheader="Test Subheader"
                chartData={chartData}
                chartLabels={chartLabels}
            />
        );

        fireEvent.click(getByText('Export to CSV'));

        // Check data is exported after button is clicked
        await waitFor(() => {
            const expectedCSVContent = 'data:text/csv;charset=utf-8,"Label 1",10\n"Label 1",20\n"Label 1",30\n' +
                '"Label 2",15\n"Label 2",25\n"Label 2",35\n"Label 3",12\n"Label 3",22\n"Label 3",32';
            expect(global.encodeURI).toHaveBeenCalledWith(expectedCSVContent);
        });
    });
});

