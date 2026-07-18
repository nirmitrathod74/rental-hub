import React, { useState, useEffect } from 'react';
import { api } from '../api/index.js';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Edit, CornerDownLeft } from 'lucide-react';

const RentalScheduler = ({ setActiveTab }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduleData();
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      // Fetching all active schedules
      const response = await api.get('/rentals/orders/schedule_data/');
      setScheduleData(response.data);
    } catch (error) {
      console.error("Error fetching schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getDaysArray = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    return days;
  };

  // Determine what dots to show on a given date
  const getDotsForDate = (date) => {
    if (!date) return [];
    
    const dots = [];
    // Important: pad month and day to match ISO format strings returned by backend
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    const today = new Date();
    const t_yyyy = today.getFullYear();
    const t_mm = String(today.getMonth() + 1).padStart(2, '0');
    const t_dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${t_yyyy}-${t_mm}-${t_dd}`;

    let hasBooked = false;
    let hasPickup = false;
    let hasLatePickup = false;
    let hasLateDelivery = false;

    scheduleData.forEach(item => {
      const startStr = item.start_date ? item.start_date.split('T')[0] : null;
      const endStr = item.end_date ? item.end_date.split('T')[0] : null;

      if (!startStr || !endStr) return;

      if (dateStr >= startStr && dateStr <= endStr && (item.status === 'confirmed' || item.status === 'picked_up')) {
        hasBooked = true;
      }
      
      if (dateStr === startStr && item.status === 'confirmed') {
        hasPickup = true;
      }

      if (dateStr === todayStr && startStr < todayStr && item.status === 'confirmed') {
        hasLatePickup = true;
      }

      if (dateStr === todayStr && endStr < todayStr && item.status === 'picked_up') {
        hasLateDelivery = true;
      }
    });

    if (hasBooked) dots.push({ type: 'booked', color: 'transparent', border: '2px solid #22c55e' });
    if (hasPickup) dots.push({ type: 'pickup', color: '#ef4444', border: 'none' });
    if (hasLatePickup) dots.push({ type: 'latePickup', color: 'transparent', border: '2px solid #f97316' });
    if (hasLateDelivery) dots.push({ type: 'lateDelivery', color: '#ef4444', border: 'none' });

    return dots;
  };

  const handleDateClick = (date) => {
    if (date) setSelectedDate(date);
  };

  const getItemsForSelectedDate = () => {
    if (!selectedDate) return [];
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    return scheduleData.filter(item => {
      const startStr = item.start_date ? item.start_date.split('T')[0] : null;
      const endStr = item.end_date ? item.end_date.split('T')[0] : null;
      return dateStr >= startStr && dateStr <= endStr;
    });
  };

  const selectedItems = getItemsForSelectedDate();

  return (
    <div style={{ display: 'flex', gap: '24px', color: 'var(--blackish)', height: '100%', overflow: 'hidden' }}>
      {/* Legend & Month Dropdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '220px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #22c55e' }}></div>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Booked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Pick up</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #f97316' }}></div>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Late Pick up</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Late Delivery</span>
          </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="glass-panel" style={{ flex: 1, padding: 0, display: 'flex', overflow: 'hidden', borderRadius: '12px', marginBottom: 0 }}>
        
        {/* Left Side: Calendar Grid */}
        <div style={{ flex: 1, borderRight: '1px solid var(--border)', padding: '32px', display: 'flex', flexDirection: 'column' }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <button className="btn" onClick={() => setActiveTab && setActiveTab('quotations')} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px' }}>
              New
            </button>
            <span style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '0.5px', color: 'var(--primary)' }}>Rental Scheduler</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <button className="glass-input" onClick={handlePrevMonth} style={{ width: '40px', padding: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ fontSize: '18px', fontWeight: '600', minWidth: '140px', textAlign: 'center', color: 'var(--blackish)' }}>
              {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
            </div>
            <button className="glass-input" onClick={handleNextMonth} style={{ width: '40px', padding: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: 'var(--border)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} style={{ backgroundColor: 'var(--extra-light)', padding: '16px 0', textAlign: 'center', fontWeight: '600', fontSize: '15px', color: 'var(--text-muted)' }}>
                {day}
              </div>
            ))}
            
            {getDaysArray().map((date, index) => {
              const isSelected = selectedDate && date && date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
              const isToday = date && date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
              const dots = getDotsForDate(date);

              return (
                <div 
                  key={index} 
                  onClick={() => handleDateClick(date)}
                  style={{ 
                    backgroundColor: 'var(--whitish)', 
                    minHeight: '80px',
                    padding: '12px',
                    cursor: date ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? 'inset 0 0 0 2px var(--primary)' : 'none'
                  }}
                >
                  {date && (
                    <>
                      <span style={{ 
                        fontSize: '15px', 
                        marginBottom: '12px', 
                        color: isToday ? 'var(--primary)' : 'var(--blackish)',
                        fontWeight: isToday ? 'bold' : '500'
                      }}>
                        {date.getDate()}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'auto', marginBottom: '6px' }}>
                        {dots.map((dot, i) => (
                          <div key={i} style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: dot.color,
                            border: dot.border
                          }}></div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Event List */}
        <div style={{ width: '450px', padding: '32px', backgroundColor: 'transparent', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '32px', color: 'var(--text-muted)', fontWeight: '600', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedItems.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '15px', fontStyle: 'italic' }}>No schedules for this date.</div>
            ) : (
              selectedItems.map((item, index) => {
                const color = item.status === 'confirmed' ? '#10b981' : 
                              item.status === 'picked_up' ? '#8b5cf6' : '#f59e0b';
                return (
                  <div key={index} className="glass-panel" style={{ padding: '16px', margin: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ color: color, fontSize: '14px', lineHeight: '1.6', fontWeight: '500' }}>
                      {index + 1}. SO{String(item.order_id).padStart(3, '0')}: {item.product_name}, {item.client_name}, {item.quantity} Unit ({item.product_availability})
                    </div>
                    <button style={{ 
                      backgroundColor: 'transparent', 
                      border: 'none', 
                      padding: '4px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: 'var(--text-muted)'
                    }}>
                      <Edit size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          
          <div style={{ marginTop: '48px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: '1.6' }}>
            (all the status mentioned in the brackets are showing the product availability)
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalScheduler;
