import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, THEME_STORAGE_KEY } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

describe('ThemeToggle and ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  const renderWithTheme = () => {
    return render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
  };

  it('renders theme toggle switch button', () => {
    renderWithTheme();
    const toggleBtn = screen.getByRole('switch');
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('id', 'theme-toggle-btn');
  });

  it('initializes to light theme by default and sets data-theme attribute on root', () => {
    renderWithTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    const toggleBtn = screen.getByRole('switch');
    expect(toggleBtn).toHaveAttribute('aria-checked', 'false');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Switch to dark theme');
  });

  it('toggles theme to dark when clicked, updating attribute and storage', () => {
    renderWithTheme();
    const toggleBtn = screen.getByRole('switch');

    // Click to switch to dark
    fireEvent.click(toggleBtn);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(toggleBtn).toHaveAttribute('aria-checked', 'true');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Switch to light theme');

    // Click again to switch back to light
    fireEvent.click(toggleBtn);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(toggleBtn).toHaveAttribute('aria-checked', 'false');
  });

  it('loads saved dark theme from localStorage on initial render', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    renderWithTheme();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    const toggleBtn = screen.getByRole('switch');
    expect(toggleBtn).toHaveAttribute('aria-checked', 'true');
  });
});
