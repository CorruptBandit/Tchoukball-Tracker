import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { useAuth } from "../../context/AuthContext";
import WorkoutEditor from '../WorkoutEditorPage';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';

vi.mock("../../context/AuthContext", () => ({
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

describe("AppGoals Component", () => {
    // let workoutName, alertMock
  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();
  });
  useAuth.mockImplementation(() => ({
    isLoggedIn: true,
    email: "dave@gmail.com",
  }));

  const alertMock = vi.fn();
  window.alert = alertMock;
  const mockNavigate = useNavigate()

  

  describe('Workout Editor Tests', () => {

    it('Test if a felid is missing will an error pop up?', async () => {
        render(
            <BrowserRouter>
                <WorkoutEditor />
            </BrowserRouter>
        );
        const workoutName = await screen.findByTestId('workout-name-input');
        fireEvent.change(workoutName, { target: { value: 'Test Workout' } });
        expect(workoutName.value).toBe('Test Workout');

        const sets = await screen.findByTestId('sets-input-0');
        fireEvent.change(sets, { target: { value: 3 } });

        const reps = await screen.findByTestId('reps-input-0');
        fireEvent.change(reps, { target: { value: 4 } });

        const target_weight = await screen.findByTestId('weight-input-0');
        fireEvent.change(target_weight, { target: { value: 4 } });


        // Triggering the creation action
        fireEvent.click(screen.getByRole('button', { name: "Create Workout" }));
        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith("Please fill in all fields.")
        });
    });
})

});
