import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, waitFor, findByText} from '@testing-library/react';
import {useAuth} from '../../../../context/AuthContext';
import {AppWorkoutHistoryTimeline} from "../index";
import '@testing-library/jest-dom';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));


describe('AppWorkoutHistoryTimeline Component', () => {
    beforeEach(() => {
        console.error = vi.fn();
        vi.clearAllMocks();
    });

    useAuth.mockImplementation(() => ({
        isLoggedIn: true, email: 'dave@gmail.com'
    }));

    const mockList = [{id: 1, time: new Date('2024-05-12T09:00:00'), title: 'Workout 1'}, {
        id: 2, time: new Date('2024-05-11T08:00:00'), title: 'Workout 2'
    },];

    it('AWHT.1: renders loading indicator when loading', () => {
        // Render the AppWorkoutHistoryTimeline component
        const {getByTestId} = render(<AppWorkoutHistoryTimeline list={[]}/>);

        // Check if the loading indicator exists
        expect(getByTestId('loading-indicator')).to.exist;
    });

    it('AWHT.2: renders list of workout history when loaded', async () => {
        // Render the AppWorkoutHistoryTimeline component
        const {findByText} = render(<AppWorkoutHistoryTimeline list={mockList}/>);

        // Check if the input data exists in the component
        await waitFor(() => {
            expect(findByText('Workout 1')).to.exist;
            expect(findByText('Workout 2')).to.exist;
        });
    });
})