import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import SignIn from '../LoginPage';
import MD5 from 'crypto-js/md5';

// Mock the useAuth and react-router-dom and react-helmet-async hooks
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn((email, passwordHash) => 
      email === "test@test.test" && passwordHash === MD5("Password1!").toString() ? Promise.resolve() : Promise.reject()
    ),
    register: vi.fn((name, email) => { // Use plain password for regex validation
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
      if (!name) {
        return Promise.reject();
      }
      if (!passwordRegex.test("SecurePassword1!")) {
        return Promise.reject();
      }
      if (email !== "newuser@test.test") {
        return Promise.reject();
      }
      return Promise.resolve(); // All validations pass
    })
    
  })
}));


vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  const useNavigate = vi.fn();
  return {
    ...actual,
    useNavigate: () => useNavigate // Return a function that returns the spy
  };
});

vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <>{children}</>, // Render children directly
  HelmetProvider: ({ children }) => <>{children}</> // Render children directly
}));

describe('SignIn Component', () => {
  let emailField, passwordField, signinButton, registerButton, alertMock;
  beforeEach(() => {
    console.error = vi.fn();
    vi.clearAllMocks();
    render(
      <BrowserRouter>
          <SignIn />
      </BrowserRouter>
    ),
    emailField = screen.getByLabelText('Email Address', { exact: false }),
    passwordField = screen.getByLabelText('Password', { exact: false });
    signinButton = screen.getByRole('button', { name: 'Sign In' });
    registerButton = screen.getByText("Don't have an account? Register", { exact: false });
    });
  // Mock window.alert
  alertMock = vi.fn();
  window.alert = alertMock;
  const mockNavigate = useNavigate()

  describe('User Login', () => {
    it('should login with valid credentials and navigate to dashboard', async () => {
      // Fill out the form fields
      fireEvent.change(emailField, { target: { value: 'test@test.test' }});
      fireEvent.change(passwordField, { target: { value: 'Password1!' } });

      // Submit the form by clicking the sign in button
      fireEvent.click(signinButton);

      // Check if navigate was called with the correct path
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it('should not login with invalid credentials and not navigate to dashboard', async () => {

      // Fill out the form fields
      fireEvent.change(emailField), { target: { value: 'test@test.test' }};
      fireEvent.change(passwordField), { target: { value: 'WrongPassword' } };

      fireEvent.click(signinButton);
      
      // Check if navigate has still only been called once (from previous test)
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("An error occurred. Please try again.")
        expect(mockNavigate).not.toHaveBeenCalledWith("/");
      });
    });
  })
  
  describe('User Registration', () => {
    it('should register with valid credentials and navigates to dashboard', async () => {  
      // Simulate toggling to the registration view
      fireEvent.click(registerButton);

      // Fill out the registration form fields
      fireEvent.change(screen.getByLabelText('Full Name', { exact: false }), { target: { value: 'New User' }});

      fireEvent.change(emailField, { target: { value: 'newuser@test.test' }});
      fireEvent.change(passwordField, { target: { value: 'SecurePassword1!' } });

      // Submit the form by clicking the sign in button
      fireEvent.click(signinButton);

      // Check that navigate was not called due to the registration error
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it('should not register with already used email and not navigate to dashboard', async () => {  
      // Simulate toggling to the registration view
      fireEvent.click(screen.getByText("Don't have an account? Register", { exact: false }));

      // Fill out the registration form fields
      fireEvent.change(screen.getByLabelText('Full Name', { exact: false }), { target: { value: 'New User' }});
      fireEvent.change(emailField, { target: { value: 'test@test.test' }});
      fireEvent.change(passwordField, { target: { value: 'Password1!' }});

      // Submit the form by clicking the register button
      fireEvent.submit(screen.getByText('Register'));

      // Check that navigate was not called due to the registration error
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("An error occurred. Please try again.")
        expect(mockNavigate).not.toHaveBeenCalledWith("/");
      });
    });
  })

  describe('Field Validation Feedback', () => {
    it('should not register with no name', async () => {
      fireEvent.click(registerButton); // Toggle to registration view

      fireEvent.change(screen.getByLabelText('Full Name', { exact: false }), { target: { value: '' }});
      fireEvent.change(emailField, { target: { value: 'newuser@test.test' }});
      fireEvent.change(passwordField, { target: { value: 'Password1!' }});

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("Please enter your full name.")
        expect(mockNavigate).not.toHaveBeenCalledWith("/");
      });
    });

    it('should not register with a non-secure password', async () => {
      fireEvent.click(registerButton); // Toggle to registration view

      fireEvent.change(screen.getByLabelText('Full Name', { exact: false }), { target: { value: 'John Doe' }});
      fireEvent.change(emailField, { target: { value: 'newuser@test.test' }});
      fireEvent.change(passwordField, { target: { value: 'pass' }}); // Deliberately weak password

      fireEvent.click(screen.getByRole('button', { name: 'Register' }));

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.");
        expect(mockNavigate).not.toHaveBeenCalledWith("/");
      });
    })
  });
});