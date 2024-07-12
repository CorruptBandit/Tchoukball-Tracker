import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminPage from '../AdminPage';
import { useAuth } from '../../context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import { Admin } from 'mongodb';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('apexcharts', () => {
    // Create a mock class to simulate ApexCharts behavior
    class MockApexCharts {
        constructor() {
            this.render = vi.fn();
            this.destroy = vi.fn();
            this.updateOptions = vi.fn();
        }
    }
    
    // Return the mock class when ApexCharts is imported
    return MockApexCharts;
});

describe('AdminPage Component', () => {
  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();
  });

  describe('Admin Portal Access', () => {

    it('should render AdminPage when the user is an admin', async () => {
        useAuth.mockImplementation(() => ({
        isLoggedIn: true,
        isAdmin: true,
        email: 'admin@admin.admin'
        }));

        render(
            <BrowserRouter>
                <AdminPage />
            </BrowserRouter>
        );

        await waitFor(() => {
        expect(screen.queryByText('Admin Dashboard')).toBeTruthy();
        });
    });

    it('should not render AdminPage when the user is not an admin', async () => {
        useAuth.mockImplementation(() => ({
            isLoggedIn: true,
            isAdmin: false,
            email: 'test@test.test'
        }));
        render(
            <BrowserRouter>
                <AdminPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText('Admin Dashboard')).toBeFalsy();
        })
    })
  })
})
