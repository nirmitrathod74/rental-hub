import React, { useState } from 'react';
import { Search, CheckSquare, X, Plus, Trash2 } from 'lucide-react';

export const QuotationTemplateView = () => {
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Home Rental Furniture', validity: 30, payment_terms: 50, lines: [{ id: 1, product: 'Computers', qty: 20, unit: 'Units' }] },
    { id: 2, name: 'Office Rental Furniture', validity: 15, payment_terms: 100, lines: [] }
  ]);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [activeTab, setActiveTab] = useState('lines');
  
  // Local state for editing form
  const [editForm, setEditForm] = useState(null);

  const handleSelectTemplate = (id) => {
    setSelectedTemplateId(id);
    const template = templates.find(t => t.id === id);
    if (template) {
      setEditForm(JSON.parse(JSON.stringify(template)));
    }
  };

  const handleNewTemplate = () => {
    const newTemplate = { id: Date.now(), name: 'New Template', validity: 0, payment_terms: 0, lines: [] };
    setSelectedTemplateId(newTemplate.id);
    setEditForm(newTemplate);
  };

  const handleSave = () => {
    setTemplates(prev => {
      const exists = prev.find(t => t.id === editForm.id);
      if (exists) {
        return prev.map(t => t.id === editForm.id ? editForm : t);
      }
      return [...prev, editForm];
    });
    setSelectedTemplateId(null);
  };

  const handleCancel = () => {
    setSelectedTemplateId(null);
  };

  if (selectedTemplateId && editForm) {
    return (
      <div className="fade-in glass-panel" style={{ padding: '32px', overflowX: 'auto', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Detail Header */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
          <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>New</button>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Quotation Template
          </h3>
          <div className="erp-search-container" style={{ margin: 0, marginLeft: 'auto', width: '250px' }}>
             <input type="text" placeholder="" className="erp-search-input" style={{ background: 'var(--extra-light)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        {/* Action / Title Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--blackish)' }}>
              {editForm.name}
            </span>
            <CheckSquare size={24} color="var(--success)" style={{ cursor: 'pointer' }} onClick={handleSave} />
            <X size={24} color="var(--danger)" style={{ cursor: 'pointer' }} onClick={handleCancel} />
          </div>
        </div>

        {/* Form Area */}
        <div style={{ display: 'flex', gap: '64px', marginBottom: '32px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '4px' }}>
              <input 
                type="text" 
                value={editForm.name} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', width: '100%' }}
              />
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blackish)' }}>Confirmation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ width: '140px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Quotation Validity</span>
              <input 
                type="number" 
                value={editForm.validity}
                onChange={(e) => setEditForm({...editForm, validity: e.target.value})}
                style={{ width: '60px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', textAlign: 'center', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Days</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ width: '140px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Payment Terms</span>
              <input 
                type="number" 
                value={editForm.payment_terms}
                onChange={(e) => setEditForm({...editForm, payment_terms: e.target.value})}
                style={{ width: '60px', border: 'none', borderBottom: '1px solid var(--border)', background: 'transparent', outline: 'none', textAlign: 'center', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}
              />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>%</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          <div 
            onClick={() => setActiveTab('lines')}
            style={{ padding: '8px 0', cursor: 'pointer', fontWeight: 600, borderBottom: activeTab === 'lines' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'lines' ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            Lines
          </div>
          <div 
            onClick={() => setActiveTab('quote_builder')}
            style={{ padding: '8px 0', cursor: 'pointer', fontWeight: 600, borderBottom: activeTab === 'quote_builder' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'quote_builder' ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            Quote Builder
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'lines' && (
          <div style={{ flex: 1 }}>
            <table className="list-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)' }}>Product</th>
                  <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)' }}>Quantity</th>
                  <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)' }}>Unit</th>
                  <th style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {editForm.lines.map(line => (
                  <tr key={line.id}>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)' }}><strong>{line.product}</strong></td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)' }}>{line.qty}</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)' }}>{line.unit}</td>
                    <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)' }}>
                      <Trash2 size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setEditForm({...editForm, lines: editForm.lines.filter(l => l.id !== line.id)})} />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="4" style={{ padding: '12px 8px' }}>
                    <div style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       Add a product
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'quote_builder' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Quote Builder elements will appear here.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fade-in glass-panel" style={{ padding: '32px', overflowX: 'auto', minHeight: '600px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn btn-primary" onClick={handleNewTemplate} style={{ padding: '4px 12px', fontSize: '12px' }}>New</button>
        <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Quotation Template
        </h3>
        <div className="erp-search-container" style={{ margin: 0, marginLeft: 'auto', width: '250px' }}>
           <input type="text" placeholder="" className="erp-search-input" style={{ background: 'var(--extra-light)', color: 'var(--text-primary)' }} />
        </div>
      </div>

      <table className="list-table" style={{ width: '100%', textAlign: 'left', marginTop: '16px' }}>
        <thead>
          <tr>
            <th style={{ padding: '12px', borderBottom: '2px solid var(--border)' }}>Template</th>
          </tr>
        </thead>
        <tbody>
          {templates.map(template => (
            <tr key={template.id} onClick={() => handleSelectTemplate(template.id)} style={{ cursor: 'pointer' }}>
              <td style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {template.name}
              </td>
            </tr>
          ))}
          {templates.length === 0 && (
            <tr><td style={{ padding: '16px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>No templates found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
