import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../components/navigation/Header.jsx';

describe('Header Component Unit Test', () => {
  it('renders title and triggers sidebar & dark mode toggles', () => {
    const setSidebarOpenMock = vi.fn();
    const toggleDarkModeMock = vi.fn();

    render(
      <Header
        title="Dashboard"
        setSidebarOpen={setSidebarOpenMock}
        toggleDarkMode={toggleDarkModeMock}
        darkMode={false}
      />
    );

    // Check title renders
    expect(screen.getByRole('heading', { name: /Dashboard/i })).toBeInTheDocument();

    // Check sidebar toggle button
    const openSidebarButton = screen.getByRole('button', { name: /open sidebar/i });
    fireEvent.click(openSidebarButton);
    expect(setSidebarOpenMock).toHaveBeenCalledWith(true);

    // Check dark mode toggle button
    const toggleDarkButton = screen.getByRole('button', { name: /toggle dark mode/i });
    fireEvent.click(toggleDarkButton);
    expect(toggleDarkModeMock).toHaveBeenCalledTimes(1);
  });
});
