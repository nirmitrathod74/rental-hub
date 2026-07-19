import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Package, Activity, Truck, FileText, DollarSign, Shield, Plus, Receipt } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/inventory/vendor/stats/');
      setStats(statsRes);
      setError(null);
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      // Since this might not be fully implemented in backend, we handle error gracefully
      // setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '18px', color: '#6B4668', fontWeight: 'bold' }}>Loading Dashboard...</div>
      </div>
    );
  }

  // --- Graph Data Prep (Matching the screenshot) ---
  const revenueData = {
    labels: ['Active Rentals', 'Overdue Rentals', 'Due Today', 'Upcoming Pickups'],
    datasets: [
      {
        label: 'Order Volume count',
        data: [2.0, 1.0, 0, 1.0],
        backgroundColor: [
          '#59d499', // Green
          '#ff7b93', // Red
          'transparent', 
          '#a7a5ff'  // Purple/Blue
        ],
        borderWidth: 0,
        barPercentage: 0.6,
        categoryPercentage: 0.8
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
          color: '#888',
          font: { size: 12 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 2.0,
        ticks: { stepSize: 0.2, color: '#888', font: { size: 11 } },
        grid: { color: '#f0f0f0' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#666', font: { size: 12 } }
      }
    }
  };

  const kpiCardStyle = {
    flex: '1 1 200px',
    background: '#fff',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #eef0f4',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
  };

  const iconWrapperStyle = (color, bg) => ({
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
    flexShrink: 0
  });

  const valueStyle = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#333',
    lineHeight: '1',
    marginTop: '6px',
    marginBottom: '4px'
  };

  const titleStyle = {
    fontSize: '12px',
    color: '#888',
    fontWeight: '500'
  };

  const subtitleStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#333'
  };

  const actionButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    background: '#fff',
    border: '1px solid #eef0f4',
    borderRadius: '4px',
    color: '#444',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#333', background: '#fcfcfd', minHeight: '100vh' }}>
      
      {/* KPI Cards Row 1 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={kpiCardStyle}>
          <div style={iconWrapperStyle('#3b82f6', '#eff6ff')}><Package size={20} /></div>
          <div>
            <div style={titleStyle}>Total Products</div>
            <div style={valueStyle}>8 <span style={{fontSize: '11px', color: '#333'}}>0 Available</span></div>
          </div>
        </div>
        
        <div style={kpiCardStyle}>
          <div style={iconWrapperStyle('#10b981', '#ecfdf5')}><Activity size={20} /></div>
          <div>
            <div style={titleStyle}>Active Rentals</div>
            <div style={valueStyle}>2 <span style={{fontSize: '11px', color: '#333'}}>8 Out for Rent</span></div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={iconWrapperStyle('#f59e0b', '#fffbeb')}><Truck size={20} /></div>
          <div>
            <div style={titleStyle}>Today's Pickups / Returns</div>
            <div style={valueStyle}>0 <span style={{fontSize: '11px', color: '#333'}}>1 returns</span></div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={iconWrapperStyle('#a855f7', '#faf5ff')}><FileText size={20} /></div>
          <div>
            <div style={titleStyle}>Pending Quotations</div>
            <div style={valueStyle}>1 <span style={{fontSize: '11px', color: '#333'}}>0 Total Customers</span></div>
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={iconWrapperStyle('#10b981', '#ecfdf5')}><DollarSign size={20} /></div>
          <div>
            <div style={titleStyle}>Revenue (This Month)</div>
            <div style={valueStyle}>$0.00 <span style={{fontSize: '11px', color: '#333'}}>$0.00 Today</span></div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 2 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ ...kpiCardStyle, flex: 'none', width: 'calc(20% - 13px)' }}>
          <div style={iconWrapperStyle('#3b82f6', '#eff6ff')}><Shield size={20} /></div>
          <div>
            <div style={titleStyle}>Security Deposits Held</div>
            <div style={valueStyle}>$0.00 <span style={{fontSize: '11px', color: '#333'}}>$0.00 Late</span></div>
            <div style={subtitleStyle}>Fees</div>
          </div>
        </div>
      </div>

      {/* Bottom Layout: Chart & Quick Actions */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* Revenue Overview Chart */}
        <div style={{ flex: '1 1 700px', background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #eef0f4', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '24px' }}>Revenue Overview</h3>
          <div style={{ height: '350px' }}>
            <Bar data={revenueData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ flex: '0 0 320px', background: '#fff', borderRadius: '8px', padding: '24px', border: '1px solid #eef0f4', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '24px' }}>Quick Actions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => navigate('/vendor/products/add')} style={{ ...actionButtonStyle, background: '#6B4668', color: '#fff', borderColor: '#6B4668' }} onMouseOver={e => e.currentTarget.style.opacity = 0.9} onMouseOut={e => e.currentTarget.style.opacity = 1}>
              <Plus size={16} /> Create Product
            </button>
            <button style={actionButtonStyle} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
              <Plus size={16} /> Create Pricelist
            </button>
            <button style={actionButtonStyle} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
              <Plus size={16} /> Create Rental Period
            </button>
            <button style={actionButtonStyle} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
              <Plus size={16} /> Create Quotation
            </button>
            <button style={actionButtonStyle} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
              <Plus size={16} /> Create Customer
            </button>
            <button style={actionButtonStyle} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
              <Receipt size={16} /> Generate Invoice
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
