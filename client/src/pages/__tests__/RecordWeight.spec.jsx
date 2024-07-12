import React from 'react';
import { describe, it, beforeEach, vi, expect } from 'vitest';  // Ensure `expect` is imported from `vitest`
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@testing-library/jest-dom';  // For extended matchers
import { useAuth } from '../../context/AuthContext';
import RecordWeightPage from '../RecordWeightPage';

// Mock the useAuth hook
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    const useNavigate = vi.fn();
    return {
      ...actual,
      useNavigate: () => useNavigate // Return a function that returns the spy
    };
  });

describe('Record Weight Component', () => {
  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();
  });

  useAuth.mockImplementation(() => ({
    isLoggedIn: true,
    email: 'dave@gmail.com',
  }));

  it('Displays a success message when weight is added', async () => {
    render(
        <HelmetProvider>
          <RecordWeightPage />
        </HelmetProvider>
      );  
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/addWeight') {
        return Promise.resolve({ ok: true });
      }
      if (url === '/api/weightHistory') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ weightHistory: [] }),
        });
      }
    });
    const weightInput = screen.getByLabelText(/weight \(in kg\)/i);
    const addButton = screen.getByText(/add weight/i);
    
    fireEvent.change(weightInput, { target: { value: '70' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Weight added successfully')).toBeInTheDocument();
    });
  });
});
