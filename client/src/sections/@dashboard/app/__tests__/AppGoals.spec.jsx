// noinspection JSCheckFunctionSignatures

import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, fireEvent, waitFor, findByText} from '@testing-library/react';
import {useAuth} from '../../../../context/AuthContext';
import {AppGoals} from "../index";
import '@testing-library/jest-dom';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));


describe('AppGoals Component', () => {
    beforeEach(() => {
        console.error = vi.fn();
        vi.clearAllMocks();
    });

    useAuth.mockImplementation(() => ({
        isLoggedIn: true, email: 'dave@gmail.com'
    }));

    const mockList = [{id: '1', goalName: 'Goal 1', achieveByDate: '2024-06-01'}, {
        id: '2', goalName: 'Goal 2', achieveByDate: '2024-06-15'
    }];

    it('AG.1: renders loading indicator when loading', () => {
        // Render the loading indicator
        const {getByTestId} = render(<AppGoals list={[]}/>);

        // Check if component exists
        expect(getByTestId('loading-indicator')).to.exist;
    });

    it('AG.2: renders without crashing', () => {
        // Render the AppGoals component
        const {container} = render(<AppGoals list={mockList}/>);

        // Check if component exists
        expect(container).toBeInTheDocument();
    });

    it('AG.3: renders list of goals when loaded', async () => {
        // Render the AppGoals component
        const {findByText} = render(<AppGoals list={mockList}/>);

        // Check if input data exists in the component
        await waitFor(() => {
            expect(findByText('Goal 1')).to.exist;
            expect(findByText('Goal 2')).to.exist;
        });
    });

    it('AG.4: opens dialog when "Add Goal" button is clicked', async () => {
        // Render the AppGoals component
        const {findByTestId, getByLabelText} = render(<AppGoals list={mockList}/>);
        const addButton = await findByTestId('add-goal-button');

        fireEvent.click(addButton);

        // Check if the input dialog boxes dog
        expect(getByLabelText('Goal Name')).toBeInTheDocument();
        expect(getByLabelText('Date to be achieved by')).toBeInTheDocument();
    });

    it('AG.5: adds a goal when the "Add Goal" button is clicked', async () => {
        const mockList = [{id: '1', label: 'Goal 1', achieveByDate: '2024-06-01'}];

        // Render the AppGoals component
        const {findByTestId, findByText, queryByText, queryByLabelText} = render(<AppGoals list={mockList}/>);

        const addButton = await findByTestId('add-goal-button');
        fireEvent.click(addButton);

        const goalNameInput = queryByLabelText('Goal Name');
        const achieveByDateInput = queryByLabelText('Date to be achieved by');

        // Input data into dialog boxes
        fireEvent.change(goalNameInput, {target: {value: 'New Goal'}});
        fireEvent.change(achieveByDateInput, {target: {value: '2024-06-30'}});

        const addButtonInDialog = queryByText('Add');
        fireEvent.click(addButtonInDialog);

        // Check if new data inputted data exists in component
        await waitFor(() => {
            expect(findByText('New Goal')).to.exist;
            expect(findByText('2024-06-30')).to.exist;
        });
    });
})
