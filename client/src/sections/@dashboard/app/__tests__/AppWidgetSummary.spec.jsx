// noinspection JSCheckFunctionSignatures

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { AppWidgetSummary } from '../index';
import '@testing-library/jest-dom';

vi.mock('../../../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('AppWidgetSummary Component', () => {
    beforeEach(() => {
        console.error = vi.fn();
        vi.clearAllMocks();
    });

    it('AWS.1: renders the component with provided props', () => {
        const title = 'Widget Title';
        const data = 'Widget Data';
        const icon = 'test-icon';
        const color = 'secondary';

        // Render the AppWidgetSummary component
        const { getByText } = render(
            <AppWidgetSummary title={title} data={data} icon={icon} color={color} />
        );

        // Check if title and data exists
        expect(getByText(title)).toBeInTheDocument();
        expect(getByText(data)).toBeInTheDocument();
    });
});
