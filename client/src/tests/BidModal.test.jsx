import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BidModal from '../components/BidModal';

describe('BidModal', () => {
  it('renders correctly with shipping address fields', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();
    
    render(<BidModal onClose={mockOnClose} onSubmit={mockOnSubmit} productPrice={100} />);
    
    expect(screen.getByText(/Place Your Bid/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Bid Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Shipping Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PIN Code/i)).toBeInTheDocument();
  });

  it('calls onSubmit with bid amount and shipping details when form is submitted', () => {
    const mockOnClose = jest.fn();
    const mockOnSubmit = jest.fn();
    
    render(<BidModal onClose={mockOnClose} onSubmit={mockOnSubmit} productPrice={100} />);
    
    fireEvent.change(screen.getByLabelText(/Your Bid Amount/i), { target: { value: '150' } });
    fireEvent.change(screen.getByLabelText(/Shipping Address/i), { target: { value: '123 Test St' } });
    fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByLabelText(/PIN Code/i), { target: { value: '123456' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Submit Bid/i }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith('150', {
      address: '123 Test St',
      city: 'Testville',
      pinCode: '123456'
    });
  });

  it('shows alert if shipping details are missing', () => {
    const mockOnSubmit = jest.fn();
    window.alert = jest.fn(); // Mock alert

    render(<BidModal onClose={jest.fn()} onSubmit={mockOnSubmit} productPrice={100} />);
    
    fireEvent.change(screen.getByLabelText(/Your Bid Amount/i), { target: { value: '150' } });
    // Intentionally leaving shipping details blank
    
    const form = screen.getByRole('button', { name: /Submit Bid/i }).closest('form');
    fireEvent.submit(form);
    
    expect(window.alert).toHaveBeenCalledWith('Please fill out all shipping details.');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
