import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Car, CreditCard, Shield, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/SimpleAuthContext';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [parkingSpace, setParkingSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    vehicle: '',
    contactNumber: '',
    duration: 'hourly',
    paymentMethod: 'ecocash',
    specialRequests: '',
    // Payment details
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    ecocashNumber: '',
    onemoneyNumber: ''
  });

  const [pricing, setPricing] = useState({
    basePrice: 0,
    serviceFee: 0,
    tax: 0,
    total: 0,
    hours: 0
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchParkingSpace();
  }, [id]);

  useEffect(() => {
    if (formData.checkIn && formData.checkOut && parkingSpace) {
      calculatePricing();
    }
  }, [formData.checkIn, formData.checkOut, formData.duration, parkingSpace]);

  const fetchParkingSpace = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parking_lots')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Failed to load parking space details');
        console.error('Error fetching parking space:', error);
        return;
      }

      if (!data) {
        setError('Parking space not found');
        return;
      }

      setParkingSpace(data);
    } catch (err) {
      setError('Failed to load parking space details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!formData.checkIn || !formData.checkOut || !parkingSpace) return;

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    let basePrice = 0;
    const hourlyRate = parseFloat(parkingSpace.price_per_hour);

    switch (formData.duration) {
      case 'hourly':
        basePrice = diffHours * hourlyRate;
        break;
      case 'full-day':
        const days = Math.ceil(diffHours / 24);
        basePrice = days * hourlyRate * 24 * 0.8; // 20% discount for full day
        break;
      case 'overnight':
        basePrice = hourlyRate * 12; // Fixed 12-hour rate
        break;
      default:
        basePrice = diffHours * hourlyRate;
    }

    const serviceFee = basePrice * 0.1; // 10% service fee
    const tax = (basePrice + serviceFee) * 0.15; // 15% tax
    const total = basePrice + serviceFee + tax;

    setPricing({
      basePrice: basePrice.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      hours: diffHours
    });
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.checkIn) errors.checkIn = 'Check-in date is required';
      if (!formData.checkOut) errors.checkOut = 'Check-out date is required';
      if (!formData.vehicle) errors.vehicle = 'Vehicle information is required';
      if (!formData.contactNumber) errors.contactNumber = 'Contact number is required';
      
      if (formData.checkIn && formData.checkOut) {
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);
        const now = new Date();

        if (checkInDate < now) {
          errors.checkIn = 'Check-in date must be in the future';
        }
        if (checkOutDate <= checkInDate) {
          errors.checkOut = 'Check-out date must be after check-in date';
        }
      }
    }

    if (step === 2) {
      if (formData.paymentMethod === 'card') {
        if (!formData.cardNumber) errors.cardNumber = 'Card number is required';
        if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
        if (!formData.cvv) errors.cvv = 'CVV is required';
        if (!formData.cardName) errors.cardName = 'Cardholder name is required';
      } else if (formData.paymentMethod === 'ecocash') {
        if (!formData.ecocashNumber) errors.ecocashNumber = 'EcoCash number is required';
      } else if (formData.paymentMethod === 'onemoney') {
        if (!formData.onemoneyNumber) errors.onemoneyNumber = 'OneMoney number is required';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const processPayment = async () => {
    setPaymentProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would integrate with actual payment providers
      const paymentData = {
        method: formData.paymentMethod,
        amount: pricing.total,
        currency: 'USD',
        // Add payment-specific data based on method
        ...(formData.paymentMethod === 'card' && {
          cardLast4: formData.cardNumber.slice(-4),
          cardType: 'visa' // You'd detect this from the card number
        }),
        ...(formData.paymentMethod === 'ecocash' && {
          phoneNumber: formData.ecocashNumber
        }),
        ...(formData.paymentMethod === 'onemoney' && {
          phoneNumber: formData.onemoneyNumber
        })
      };

      return { success: true, transactionId: `TXN_${Date.now()}`, paymentData };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to make a booking');
      navigate('/login');
      return;
    }

    if (bookingStep === 1) {
      if (!validateStep(1)) {
        return;
      }

      // Check availability
      if (parkingSpace.available_spaces <= 0) {
        setError('No spaces available for the selected dates');
        return;
      }

      setError('');
      setBookingStep(2);
      return;
    }

    if (bookingStep === 2) {
      if (!validateStep(2)) {
        return;
      }
      setBookingStep(3);
      return;
    }

    // Step 3 - Process payment and create booking
    try {
      setBookingStatus('pending');
      setError('');

      // Process payment first
      const paymentResult = await processPayment();
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Create booking in database
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          user_id: user.id,
          parking_lot_id: id,
          start_time: new Date(formData.checkIn).toISOString(),
          end_time: new Date(formData.checkOut).toISOString(),
          vehicle_info: formData.vehicle,
          contact_number: formData.contactNumber,
          duration_type: formData.duration,
          payment_method: formData.paymentMethod,
          special_requests: formData.specialRequests,
          total_cost: parseFloat(pricing.total),
          status: 'confirmed',
          payment_status: 'paid',
          transaction_id: paymentResult.transactionId
        }])
        .select()
        .single();

      if (bookingError) {
        throw new Error(bookingError.message || 'Failed to create booking');
      }

      // Update parking lot availability
      const { error: updateError } = await supabase
        .from('parking_lots')
        .update({ 
          available_spaces: parkingSpace.available_spaces - 1 
        })
        .eq('id', id);

      if (updateError) {
        console.error('Failed to update parking lot availability:', updateError);
      }

      // Booking successful
      setBookingStatus('success');
      
      // Redirect to user dashboard
      setTimeout(() => {
        navigate('/dashboard/user', { 
          state: { 
            message: 'Booking created successfully!', 
            bookingId: bookingData.id 
          }
        });
      }, 3000);

    } catch (err) {
      setError(err.message || 'Failed to create booking');
      setBookingStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !parkingSpace) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <Link to="/search" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (bookingStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-4">Your parking space has been reserved successfully.</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Parking Lot:</span>
                  <span className="font-medium">{parkingSpace?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className="font-medium text-green-600">${pricing.total}</span>
                </div>
              </div>
            </div>
            <div className="animate-pulse text-sm text-blue-600">
              Redirecting to your dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <Link to="/search" className="text-blue-600 hover:underline flex items-center mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Search
        </Link>

        {/* Parking Space Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{parkingSpace?.name}</h1>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{parkingSpace?.location}</span>
              </div>
              {parkingSpace?.description && (
                <p className="text-gray-600 mb-3">{parkingSpace.description}</p>
              )}
              <div className="flex items-center gap-6">
                <div className="flex items-center text-green-600">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span className="text-lg font-semibold">${parkingSpace?.price_per_hour}/hour</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Car className="h-4 w-4 mr-1" />
                  <span>{parkingSpace?.available_spaces} spaces available</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {parkingSpace?.is_24_hours ? '24/7' : 
                     `${parkingSpace?.opening_time?.slice(0, 5)} - ${parkingSpace?.closing_time?.slice(0, 5)}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                parkingSpace?.available_spaces > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {parkingSpace?.available_spaces > 0 ? 'Available' : 'Full'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                bookingStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Booking Details</p>
                <p className="text-xs text-gray-500">Enter your booking information</p>
              </div>
            </div>
            
            <div className={`flex-1 h-1 mx-4 ${bookingStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                bookingStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Payment</p>
                <p className="text-xs text-gray-500">Choose payment method</p>
              </div>
            </div>
            
            <div className={`flex-1 h-1 mx-4 ${bookingStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                bookingStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Confirmation</p>
                <p className="text-xs text-gray-500">Review and confirm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              {/* Step 1: Booking Details */}
              {bookingStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-In Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationErrors.checkIn ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {validationErrors.checkIn && (
                        <p className="text-red-600 text-xs mt-1">{validationErrors.checkIn}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-Out Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          validationErrors.checkOut ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {validationErrors.checkOut && (
                        <p className="text-red-600 text-xs mt-1">{validationErrors.checkOut}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Information *
                    </label>
                    <input
                      type="text"
                      name="vehicle"
                      value={formData.vehicle}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.vehicle ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Toyota Corolla - ABZ 1234"
                      required
                    />
                    {validationErrors.vehicle && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.vehicle}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors.contactNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+263 77 123 4567"
                      required
                    />
                    {validationErrors.contactNumber && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.contactNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration Type
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="full-day">Full Day (20% discount)</option>
                      <option value="overnight">Overnight (12 hours)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {bookingStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">Booking Summary</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Location:</strong> {parkingSpace?.name}</p>
                      <p><strong>Check-in:</strong> {new Date(formData.checkIn).toLocaleString()}</p>
                      <p><strong>Check-out:</strong> {new Date(formData.checkOut).toLocaleString()}</p>
                      <p><strong>Duration:</strong> {pricing.hours} hours ({formData.duration})</p>
                      <p><strong>Vehicle:</strong> {formData.vehicle}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['ecocash', 'card', 'onemoney'].map((method) => (
                        <label key={method} className="relative">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={formData.paymentMethod === method}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.paymentMethod === method 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center justify-center">
                              <CreditCard className="h-6 w-6 mr-2" />
                              <span className="font-medium capitalize">
                                {method === 'card' ? 'Credit Card' : method}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details Based on Method */}
                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900">Card Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number *
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              validationErrors.cardNumber ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                          />
                          {validationErrors.cardNumber && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.cardNumber}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              validationErrors.expiryDate ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {validationErrors.expiryDate && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.expiryDate}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV *
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              validationErrors.cvv ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="123"
                            maxLength="4"
                          />
                          {validationErrors.cvv && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.cvv}</p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name *
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              validationErrors.cardName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="John Doe"
                          />
                          {validationErrors.cardName && (
                            <p className="text-red-600 text-xs mt-1">{validationErrors.cardName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'ecocash' && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">EcoCash Details</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          EcoCash Number *
                        </label>
                        <input
                          type="tel"
                          name="ecocashNumber"
                          value={formData.ecocashNumber}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors.ecocashNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="+263 77 123 4567"
                        />
                        {validationErrors.ecocashNumber && (
                          <p className="text-red-600 text-xs mt-1">{validationErrors.ecocashNumber}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'onemoney' && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">OneMoney Details</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          OneMoney Number *
                        </label>
                        <input
                          type="tel"
                          name="onemoneyNumber"
                          value={formData.onemoneyNumber}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors.onemoneyNumber ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="+263 71 123 4567"
                        />
                        {validationErrors.onemoneyNumber && (
                          <p className="text-red-600 text-xs mt-1">{validationErrors.onemoneyNumber}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {bookingStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Your Booking</h3>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Final Review</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parking Location:</span>
                        <span className="font-medium">{parkingSpace?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{new Date(formData.checkIn).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{new Date(formData.checkOut).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{pricing.hours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium">{formData.vehicle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-medium capitalize">{formData.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">Secure Payment</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure. You will be charged ${pricing.total} upon confirmation.
                    </p>
                  </div>

                  {paymentProcessing && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-2"></div>
                        <span className="text-yellow-800">Processing payment...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                {bookingStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setBookingStep(bookingStep - 1)}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    disabled={paymentProcessing}
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={bookingStatus === 'pending' || paymentProcessing}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                >
                  {bookingStep === 1 
                    ? "Continue to Payment" 
                    : bookingStep === 2
                    ? "Review Booking"
                    : paymentProcessing
                    ? "Processing Payment..."
                    : bookingStatus === "pending" 
                    ? "Creating Booking..." 
                    : "Confirm & Pay"
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            {pricing.total > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price ({pricing.hours} hours):</span>
                    <span className="font-medium">${pricing.basePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee (10%):</span>
                    <span className="font-medium">${pricing.serviceFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (15%):</span>
                    <span className="font-medium">${pricing.tax}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-green-600">${pricing.total}</span>
                  </div>
                </div>

                {formData.duration === 'full-day' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      🎉 You're saving 20% with the full-day rate!
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-2 text-xs text-gray-500">
                  <p>• Free cancellation up to 1 hour before check-in</p>
                  <p>• 24/7 customer support</p>
                  <p>• Secure payment processing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
