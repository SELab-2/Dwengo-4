import React from 'react';
import { render, screen } from '@testing-library/react';
import SuccessMessage from '@/components/shared/SuccessMessage';

describe('SuccessMessage', () => {
  const mockProps = {
    title: 'Success!',
    description: 'Your operation was completed successfully.',
  };

  it('renders the container with correct classes', () => {
    const { container } = render(<SuccessMessage {...mockProps} />);
    const box = container.querySelector('.succesBox');
    expect(box).toBeInTheDocument();
    expect(box).toHaveClass('border-medium', 'py-10', 'px-10', 'succesBox');
  });

  it('renders the title text', () => {
    render(<SuccessMessage {...mockProps} />);
    const titleElement = screen.getByText(mockProps.title);
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName.toLowerCase()).toBe('h3');
  });

  it('renders the description text', () => {
    render(<SuccessMessage {...mockProps} />);
    const descriptionElement = screen.getByText(mockProps.description);
    expect(descriptionElement).toBeInTheDocument();
    expect(descriptionElement.tagName.toLowerCase()).toBe('p');
  });

  it('renders different props correctly', () => {
    const altProps = {
      title: 'Well done!',
      description: 'Everything is awesome.',
    };
    render(<SuccessMessage {...altProps} />);
    expect(screen.getByText(altProps.title)).toBeInTheDocument();
    expect(screen.getByText(altProps.description)).toBeInTheDocument();
  });

  it('renders without crashing even with empty strings', () => {
    const { container } = render(<SuccessMessage title="" description="" />);
    const box = container.querySelector('.succesBox');
    expect(box).toBeInTheDocument();
    expect(box).toHaveTextContent('');
  });
});
