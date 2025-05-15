import React from 'react';
import { render } from '@testing-library/react';
import LoadingIndicatorButton from '@/components/shared/LoadingIndicatorButton';

describe('LoadingIndicatorButton', () => {
  it('renders the loading indicator container', () => {
    const { container } = render(<LoadingIndicatorButton />);
    const loadingContainer = container.querySelector('.loading-indicator');
    expect(loadingContainer).toBeInTheDocument();
  });

  it('renders three dot elements', () => {
    const { container } = render(<LoadingIndicatorButton />);
    const dots = container.querySelectorAll('.dot');
    expect(dots).toHaveLength(3);
  });

  it('applies the dark class when dark prop is true', () => {
    const { container } = render(<LoadingIndicatorButton dark={true} />);
    const loadingContainer = container.querySelector('.loading-indicator');
    expect(loadingContainer).toHaveClass('loading-indicator', 'dark');
  });

  it('does not apply dark class when dark prop is false', () => {
    const { container } = render(<LoadingIndicatorButton dark={false} />);
    const loadingContainer = container.querySelector('.loading-indicator');
    expect(loadingContainer).toHaveClass('loading-indicator');
    expect(loadingContainer).not.toHaveClass('dark');
  });

  it('does not apply dark class when dark prop is omitted', () => {
    const { container } = render(<LoadingIndicatorButton />);
    const loadingContainer = container.querySelector('.loading-indicator');
    expect(loadingContainer).toHaveClass('loading-indicator');
    expect(loadingContainer).not.toHaveClass('dark');
  });

  it('renders dots as empty span elements', () => {
    const { container } = render(<LoadingIndicatorButton />);
    const dots = container.querySelectorAll('.dot');
    dots.forEach((dot) => {
      expect(dot.tagName.toLowerCase()).toBe('span');
      expect(dot).toBeEmptyDOMElement();
    });
  });

  it('container has no aria attributes (not accessible)', () => {
    const { container } = render(<LoadingIndicatorButton />);
    const loadingContainer = container.querySelector('.loading-indicator');
    expect(loadingContainer).not.toHaveAttribute('aria-hidden');
    expect(loadingContainer).not.toHaveAttribute('role');
  });
});
