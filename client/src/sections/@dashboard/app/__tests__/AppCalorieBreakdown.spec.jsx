import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, fireEvent, waitFor} from '@testing-library/react';
import {useAuth} from '../../../../context/AuthContext';
import {AppCalorieBreakdown} from "../index";
import '@testing-library/jest-dom';

global.encodeURI = vi.fn();

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('AppCalorieBreakdown Component', () => {
    beforeEach(() => {
        console.error = vi.fn();
        vi.clearAllMocks();
    });

    useAuth.mockImplementation(() => ({
        isLoggedIn: true, email: 'dave@gmail.com'
    }));

    const chartData = [{label: 'Breakfast', value: 400}, {label: 'Lunch', value: 300}, {label: 'Dinner', value: 700}];

    it('ACB.1: renders loading indicator when loading', () => {
        // Render the loading indicator
        const {getByTestId} = render(<AppCalorieBreakdown chartData={chartData}/>);

        // Check if component exists
        expect(getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('ACB.2: renders without crashing', () => {
        // Render the AppCalorieBreakdown component
        const {container} = render(<AppCalorieBreakdown chartData={chartData}/>);

        // Check if component exists
        expect(container).toBeInTheDocument();
    });

    it('ACB.3: calls export function when export button is clicked', async () => {
        // Render the AppCalorieBreakdown component
        const {getByText} = render(<AppCalorieBreakdown chartData={chartData}/>);

        fireEvent.click(getByText('Export to CSV'));


        // Check data is exported after button is clicked
        await waitFor(() => {
            const expectedCSVContent = 'data:text/csv;charset=utf-8,"Breakfast",400\n"Lunch",300\n"Dinner",700';
            expect(global.encodeURI).toHaveBeenCalledWith(expectedCSVContent);
        });
    });
});

