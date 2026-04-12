import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { api } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddTransaction.css';

function AddTransaction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useFeedback();
  const location = useLocation();
  const editData = location.state?.transaction;

  const [formData, setFormData] = useState({
    title: editData?.title || '',
    amount: editData?.amount || '',
    type: editData?.type || 'expense',
    category: editData?.category || '',
    date: editData?.date || new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isIncome = formData.type === 'income';

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.category) newErrors.category = isIncome ? 'Source is required' : 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset category when type changes
    if (name === 'type') {
      setFormData({ ...formData, type: value, category: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);
    let result;
    const payload = { ...formData, amount: parseFloat(formData.amount) };

    if (editData) {
      result = await api.updateTransaction(editData.id, payload);
    } else {
      result = await api.addTransaction(payload);
    }

    setLoading(false);
    if (result.success) {
      showToast(editData ? 'Transaction updated successfully!' : 'Transaction saved successfully!', 'success');
      navigate('/');
    } else {
      showToast('Failed to save transaction', 'error');
    }
  };

  return (
    <div className="page-container" id="add-transaction-page">
      <div className="form-card">
        <div className="form-header">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            <span className="back-arrow">←</span> Back
          </button>
          <div className="form-header-icon">
            {isIncome ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-income)" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-expense)" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
            )}
          </div>
          <h2 className="form-title">{editData ? 'Edit Transaction' : 'New Transaction'}</h2>
          <p className="form-subtitle">{editData ? 'Modify your existing transaction.' : 'Record your recent income or expense.'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="type-selector">
              <div className="type-option">
                <input
                  type="radio"
                  id="type-expense"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={handleChange}
                />
                <label htmlFor="type-expense" className="type-label expense">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline></svg>
                  Expense
                </label>
              </div>
              <div className="type-option">
                <input
                  type="radio"
                  id="type-income"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={handleChange}
                />
                <label htmlFor="type-income" className="type-label income">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline></svg>
                  Income
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label className="form-label" htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder={isIncome ? "e.g., Monthly Salary, Freelance Work" : "e.g., Groceries, Rent, Netflix"}
                value={formData.title}
                onChange={handleChange}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group flex-1">
              <label className="form-label" htmlFor="amount">Amount (₹)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                className={`form-input ${errors.amount ? 'input-error' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="category">
                {isIncome ? 'Source' : 'Category'}
              </label>
              <select
                id="category"
                name="category"
                className={`form-input ${errors.category ? 'input-error' : ''}`}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="" disabled>
                  {isIncome ? 'Select a source' : 'Select a category'}
                </option>
                {isIncome ? (
                  <>
                    <option value="Salary">💰 Salary</option>
                    <option value="Freelance">💻 Freelance</option>
                    <option value="Investments">📈 Investments</option>
                    <option value="Business">🏪 Business</option>
                    <option value="Rental Income">🏠 Rental Income</option>
                    <option value="Interest">🏦 Interest</option>
                    <option value="Gift">🎁 Gift</option>
                    <option value="Other">📋 Other</option>
                  </>
                ) : (
                  <>
                    <option value="Food & Dining">🍔 Food & Dining</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Housing">🏠 Housing</option>
                    <option value="Transportation">🚗 Transportation</option>
                    <option value="Entertainment">🎮 Entertainment</option>
                    <option value="Healthcare">💊 Healthcare</option>
                    <option value="Education">📚 Education</option>
                    <option value="Bills & Utilities">⚡ Bills & Utilities</option>
                    <option value="Other">📋 Other</option>
                  </>
                )}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group flex-1">
              <label className="form-label" htmlFor="date">Date</label>
              <div className="date-input-wrapper custom-datepicker-wrapper">
                <DatePicker
                  selected={formData.date ? new Date(formData.date) : null}
                  onChange={(date) => {
                    const formattedDate = date ? date.toISOString().split('T')[0] : '';
                    setFormData({ ...formData, date: formattedDate });
                  }}
                  className={`form-input custom-datepicker ${errors.date ? 'input-error' : ''}`}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select Date"
                  id="date"
                  autoComplete="off"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  maxDate={new Date()}
                />
              </div>
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>
          </div>

          <button type="submit" className="primary-button submit-btn" disabled={loading} id="submit-btn">
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                {editData ? 'Update Transaction' : 'Save Transaction'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTransaction;
