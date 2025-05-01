import React from 'react';
import { render, screen } from '@testing-library/react';
import Container from '@/components/shared/Container';

describe('Container', () => {
  it('renders children inside container', () => {
    render(
      <Container>
        <p>Container Content</p>
      </Container>,
    );
    expect(screen.getByText('Container Content')).toBeInTheDocument();
  });

  it('applies the container class', () => {
    render(
      <Container>
        <span>Class Check</span>
      </Container>,
    );
    const container = screen.getByText('Class Check').parentElement;
    expect(container).toHaveClass('container');
  });

  it('renders multiple children correctly', () => {
    render(
      <Container>
        <p>Child 1</p>
        <p>Child 2</p>
      </Container>,
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('renders an empty container when no children are provided', () => {
    const { container } = render(
      <Container>
        <></>
      </Container>,
    );
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
