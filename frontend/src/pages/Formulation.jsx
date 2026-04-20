import { useEffect, useState, useRef } from 'react'
import { API } from '../api'
import { useToast } from '../components/Toast'
import { Icon } from '../components/Icon'

// --- Subcomponents ---

function ChatAssistant({ context, onAction }) {
  const [messages, setMessages] = useState([{ role: 'ai', text: "Hi! I'm your AI formulation assistant. How can I help you optimize your feed today?" }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const res = await API.ingredients.aiChat({ message: userMsg, context })
      const data = res.data
      setMessages(m => [...m, { role: 'ai', text: data.response }])
      
      if (data.action === 'add_ingredient' && data.ingredient_name) {
        onAction({ type: 'add', name: data.ingredient_name, reason: data.reasoning })
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 600 }}>
      <div className="card-header" style={{ background: 'var(--gray-50)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="smart_toy" size={18} color="var(--text-main)" />
          <h3 style={{ fontSize: '.9375rem', fontWeight: 700, margin: 0 }}>AI Assistant</h3>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            <div className={`chat-bubble ${m.role}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg ai">
            <div className="chat-bubble ai"><Icon name="progress_activity" size={14} className="animate-pulse" /></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={send} style={{ borderTop: '1px solid var(--gray-200)', padding: 12, display: 'flex', gap: 8 }}>
        <input 
          className="form-input" 
          placeholder="Ask for suggestions..." 
          value={input} 
          onChange={e => setInput(e.target.value)}
          style={{ padding: '8px 12px' }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={loading || !input.trim()}>
          <Icon name="send" size={16} />
        </button>
      </form>
    </div>
  )
}

// --- Main Component ---

export default function Formulation() {
  const { toast, ToastContainer } = useToast()
  
  const [dbIngredients, setDbIngredients] = useState([])
  const [profiles, setProfiles] = useState([])
  
  const [reqs, setReqs] = useState({ protein_percent: 18, energy_me: 3000, calcium_percent: 1.0, phosphorus_percent: 0.5 })
  const [selectedProfileId, setSelectedProfileId] = useState('')
  
  const [selectedIngs, setSelectedIngs] = useState([])
  const [ingDropdown, setIngDropdown] = useState('')
  
  const [calculating, setCalculating] = useState(false)
  const [results, setResults] = useState(null)

  const [saveModal, setSaveModal] = useState(false)
  const [saveForm, setSaveForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  // Initialization
  useEffect(() => {
    Promise.all([API.ingredients.all(), API.nutrients.all()])
      .then(([iRes, pRes]) => {
        setDbIngredients(iRes.data || [])
        setProfiles(pRes.data || [])
      })
      .catch(() => toast('Failed to load initial data', 'error'))
  }, [])

  // Handlers
  const handleProfileChange = (e) => {
    const id = e.target.value
    setSelectedProfileId(id)
    if (!id) return
    const p = profiles.find(x => x.id === parseInt(id))
    if (p && p.composition) {
      setReqs({
        protein_percent: p.composition.protein_percent || 0,
        energy_me: p.composition.energy_me || 0,
        calcium_percent: p.composition.calcium_percent || 0,
        phosphorus_percent: p.composition.phosphorus_percent || 0,
      })
      toast(`Applied profile: ${p.nutrient_requirement_name}`, 'info')
    }
  }

  const handleReqChange = k => e => {
    setReqs(r => ({ ...r, [k]: parseFloat(e.target.value) || 0 }))
    setSelectedProfileId('') // un-link profile if edited manually
  }

  const addIngredient = (name) => {
    if (!name) return
    const exists = selectedIngs.find(i => i.name === name)
    if (exists) {
      toast(`${name} is already selected`, 'warning')
      return
    }
    const dbItem = dbIngredients.find(i => i.name === name)
    if (dbItem) {
      setSelectedIngs(s => [...s, {
        ...dbItem,
        cost_per_kg: dbItem.price,
        min_percentage: 0,
        max_percentage: 1, // 100%
        included: true
      }])
      toast(`Added ${name}`, 'success')
    }
    setIngDropdown('')
  }

  const updateIng = (idx, k, val) => {
    setSelectedIngs(s => {
      const n = [...s]
      n[idx][k] = val
      return n
    })
  }

  const removeIng = idx => {
    setSelectedIngs(s => s.filter((_, i) => i !== idx))
  }

  const calculate = async () => {
    if (selectedIngs.filter(i => i.included).length < 2) {
      toast('Select at least 2 ingredients to formulate', 'warning')
      return
    }

    setCalculating(true)
    setResults(null)
    try {
      const payload = {
        requirements: reqs,
        ingredients: selectedIngs.filter(i => i.included).map(i => ({
          name: i.name,
          cost_per_kg: parseFloat(i.cost_per_kg) || 0,
          protein_percent: parseFloat(i.crude_protein) || 0,
          energy_me: parseFloat(i.metabolized_energy) || 0,
          calcium_percent: parseFloat(i.calcium) || 0,
          phosphorus_percent: parseFloat(i.avail_phosphorus || i.total_phosphorus) || 0,
          min_percentage: parseFloat(i.min_percentage) || 0,
          max_percentage: parseFloat(i.max_percentage) || 1
        }))
      }
      
      const res = await API.formulation.calculate(payload)
      setResults(res.data)
      
      // Auto scroll to results
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (err) {
      toast('Calculation error. Check constraints.', 'error')
    } finally {
      setCalculating(false)
    }
  }

  const saveFormulation = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await API.formulation.save({
        formulation_name: saveForm.name || 'Untitled Formulation',
        formulation_description: saveForm.description,
        payload: JSON.stringify(results)
      })
      toast('Formulation saved successfully!', 'success')
      setSaveModal(false)
      setSaveForm({ name: '', description: '' })
    } catch (err) {
      toast('Failed to save formulation', 'error')
    } finally {
      setSaving(false)
    }
  }

  const printResults = () => {
    window.print()
  }

  const handleAiAction = (action) => {
    if (action.type === 'add') {
      addIngredient(action.name)
      if (action.reason) toast(`AI: Added ${action.name} - ${action.reason}`, 'info')
    }
  }

  // AI Context building
  const aiContext = {
    protein_percent: reqs.protein_percent,
    energy_me: reqs.energy_me,
    calcium_percent: reqs.calcium_percent,
    phosphorus_percent: reqs.phosphorus_percent,
    selected_ingredients: selectedIngs.filter(i => i.included).map(i => ({ name: i.name, percentage: 0 })),
    available_ingredients: dbIngredients
  }

  return (
    <div>
      <ToastContainer />
      
      {/* Header */}
      <div className="page-hero" style={{ marginBottom: 32 }}>
        <div className="container page-hero-inner">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="science" size={28} /> Formulation Calculator
          </h1>
          <p style={{ opacity: .8, marginTop: 8 }}>Optimize feed cost while meeting nutritional targets</p>
        </div>
      </div>

      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, paddingBottom: 64 }}>
          {/* Main Layout: Left (Form), Right (Chat/Tools) - on large screens */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            
            {/* Left Column: Requirements & Ingredients */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, gridColumn: '1 / span 2' }}>
              
              {/* Nutrient Requirements */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">1. Nutrient Targets</h3>
                  <select 
                    className="form-input" 
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '.875rem' }}
                    value={selectedProfileId}
                    onChange={handleProfileChange}
                  >
                    <option value="">-- Custom Profile --</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.nutrient_requirement_name}</option>
                    ))}
                  </select>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Protein (%)</label>
                      <input type="number" step="any" className="form-input" value={reqs.protein_percent} onChange={handleReqChange('protein_percent')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Energy (ME)</label>
                      <input type="number" step="any" className="form-input" value={reqs.energy_me} onChange={handleReqChange('energy_me')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Calcium (%)</label>
                      <input type="number" step="any" className="form-input" value={reqs.calcium_percent} onChange={handleReqChange('calcium_percent')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phosphorus (%)</label>
                      <input type="number" step="any" className="form-input" value={reqs.phosphorus_percent} onChange={handleReqChange('phosphorus_percent')} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients Selection */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">2. Ingredients</h3>
                </div>
                <div className="card-body">
                  {/* Add Ingredient Bar */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    <select 
                      className="form-input" 
                      value={ingDropdown} 
                      onChange={e => addIngredient(e.target.value)}
                    >
                      <option value="">+ Add Ingredient from Library...</option>
                      {dbIngredients.map(ing => (
                        <option key={ing.id} value={ing.name} disabled={selectedIngs.some(i => i.name === ing.name)}>
                          {ing.name} (₱{ing.price}/kg)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Ingredients List */}
                  {selectedIngs.length === 0 ? (
                    <div className="empty-state" style={{ padding: '30px 20px' }}>
                      <Icon name="inventory_2" size={32} style={{ color: 'var(--gray-300)', marginBottom: 12 }} />
                      <p style={{ margin: 0, color: 'var(--gray-500)', fontSize: '.9375rem' }}>Select ingredients to include in the formulation.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mb-2" style={{ background: 'var(--blue-bg)', borderLeft: '4px solid var(--blue)', padding: '12px', borderRadius: '4px', marginBottom: '8px' }}>
                        <p className="text-sm" style={{ color: 'var(--blue)', fontSize: '.875rem' }}>
                          <strong>{selectedIngs.filter(i => i.included).length} included</strong> / {selectedIngs.length} total
                          {selectedIngs.filter(i => i.min_percentage === i.max_percentage).length > 0 && ` · 🔒 ${selectedIngs.filter(i => i.min_percentage === i.max_percentage).length} locked`}
                        </p>
                      </div>

                      {selectedIngs.map((ing, idx) => {
                        const isLocked = parseFloat(ing.min_percentage) === parseFloat(ing.max_percentage)
                        return (
                          <div key={ing.name} className={`ing-card ${isLocked ? 'locked' : ''} ${!ing.included ? 'excluded' : ''}`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                                  <div className="toggle-wrapper">
                                    <input type="checkbox" id={`inc-${idx}`} checked={ing.included} onChange={e => updateIng(idx, 'included', e.target.checked)} style={{ display: 'none' }}/>
                                    <div className={`toggle ${ing.included ? 'on' : ''}`} onClick={() => updateIng(idx, 'included', !ing.included)} />
                                  </div>
                                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{ing.name}</h4>
                                  {isLocked && <span className="badge badge-amber">🔒 Locked {(ing.min_percentage * 100).toFixed(2)}%</span>}
                                  <span style={{ fontSize: '.8125rem', color: 'var(--text-muted)' }}>₱{parseFloat(ing.cost_per_kg).toFixed(2)}/kg</span>
                                </div>
                                
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <label style={{ fontSize: '.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Min %</label>
                                    <input 
                                      type="number" step="any" min="0" max="100"
                                      className="form-input" 
                                      style={{ width: 80, padding: '4px 8px' }}
                                      value={ing.min_percentage * 100} 
                                      onChange={e => updateIng(idx, 'min_percentage', (parseFloat(e.target.value) || 0) / 100)} 
                                    />
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <label style={{ fontSize: '.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Max %</label>
                                    <input 
                                      type="number" step="any" min="0" max="100"
                                      className="form-input" 
                                      style={{ width: 80, padding: '4px 8px' }}
                                      value={ing.max_percentage * 100} 
                                      onChange={e => updateIng(idx, 'max_percentage', (parseFloat(e.target.value) || 0) / 100)} 
                                    />
                                  </div>
                                  <div style={{ fontSize: '.75rem', color: 'var(--gray-400)' }}>
                                    (Enter same value to lock)
                                  </div>
                                </div>
                              </div>
                              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', padding: 6 }} onClick={() => removeIng(idx)}>
                                <Icon name="cancel" size={18} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Calculate Action */}
                  <div style={{ marginTop: 24 }}>
                    <button 
                      className="btn btn-primary btn-lg btn-full" 
                      onClick={calculate} 
                      disabled={calculating || selectedIngs.filter(i => i.included).length < 2}
                      style={{ fontSize: '1.125rem', padding: '16px' }}
                    >
                      {calculating ? <><Icon name="progress_activity" size={20} className="animate-pulse" /> Optimizing...</> : 'Calculate Optimal Formulation'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Assistant */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ position: 'sticky', top: 88 }}>
                <ChatAssistant context={aiContext} onAction={handleAiAction} />
              </div>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div id="results-section" className="card" style={{ marginTop: 16 }}>
              <div className="card-header" style={{ background: results.status === 'success' ? 'var(--bg-app)' : 'var(--rose-bg)', borderBottom: `1px solid ${results.status === 'success' ? 'var(--border-light)' : 'var(--rose-border)'}` }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: results.status === 'success' ? 'var(--emerald)' : 'var(--rose)', display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                  {results.status === 'success' ? <><Icon name="check_circle" size={24} /> Optimal Solution Found</> : <><Icon name="cancel" size={24} /> No Feasible Solution</>}
                </h2>
              </div>
              
              <div className="card-body">
                {results.status === 'failure' ? (
                  // FAILURE UI
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '.9375rem' }}>{results.detail}</p>
                    
                    {/* Locked Summary */}
                    {results.locked_summary && results.locked_summary.count > 0 && (
                      <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: 8, padding: 16 }}>
                        <p style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--amber)', margin: '0 0 8px 0' }}>
                          🔒 Locked Ingredients ({results.locked_summary.total_locked_percent}% fixed)
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {results.locked_summary.items.map(l => (
                            <span key={l.name} className="badge badge-amber">{l.name} {l.locked_at_percent}%</span>
                          ))}
                        </div>
                        <p style={{ fontSize: '.8125rem', color: 'var(--amber)', opacity: 0.8, margin: '8px 0 0 0' }}>
                          Remaining for free ingredients: <strong>{results.locked_summary.remaining_percent_for_free}%</strong>
                        </p>
                      </div>
                    )}

                    {/* Sum Check Issue */}
                    {results.infeasibility_diagnosis?.sum_check && !results.infeasibility_diagnosis.sum_check.feasible && (
                      <div style={{ background: 'var(--rose-bg)', border: '1px solid var(--rose-border)', borderRadius: 8, padding: 16 }}>
                        <p style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--rose)', margin: '0 0 4px 0' }}>⚠️ Sum Constraint Issue</p>
                        <p style={{ fontSize: '.875rem', color: 'var(--rose)', margin: 0 }}>{results.infeasibility_diagnosis.sum_check.issue}</p>
                      </div>
                    )}

                    {/* Nutrient Gaps */}
                    {results.infeasibility_diagnosis?.nutrient_gaps?.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '.9375rem', fontWeight: 700, marginBottom: 12 }}>Nutrient Gap Analysis</h4>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Nutrient</th>
                                <th>Target</th>
                                <th>Max Achievable</th>
                                <th>Status</th>
                                <th>Gap</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.infeasibility_diagnosis.nutrient_gaps.map(g => (
                                <tr key={g.nutrient}>
                                  <td>{g.nutrient.replace(/_/g,' ').replace(/\b\w/g, l=>l.toUpperCase())}</td>
                                  <td>{parseFloat(g.residual_required).toFixed(4)}</td>
                                  <td>{parseFloat(g.max_achievable).toFixed(4)}</td>
                                  <td>{g.feasible ? '✅' : '❌'}</td>
                                  <td>{!g.feasible ? <span style={{ color: 'var(--red)', fontWeight: 700 }}>{g.gap > 0 ? '+' : ''}{parseFloat(g.gap).toFixed(4)}</span> : 'OK'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {results.adjustment_suggestions?.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '.9375rem', fontWeight: 700, marginBottom: 12 }}>Suggested Adjustments</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {results.adjustment_suggestions.map((s, i) => (
                            <div key={i} style={{ background: 'var(--blue-bg)', border: '1px solid var(--border-light)', borderRadius: 8, padding: 12, display: 'flex', gap: 12 }}>
                              <span style={{ fontSize: '1.2rem' }}>💡</span>
                              <div>
                                <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
                                  {s.action === 'increase_max' ? '↑ Raise max of' : '↓ Lower min of'} <span style={{ fontFamily: 'monospace', background: '#bfdbfe', padding: '2px 4px', borderRadius: 4 }}>{s.ingredient}</span>
                                  {' '}— {s.field}: {(s.current_value*100).toFixed(2)}% → {(s.suggested_value*100).toFixed(2)}%
                                </p>
                                <p style={{ fontSize: '.8125rem', color: 'var(--text-muted)', margin: 0 }}>{s.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // SUCCESS UI
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* Cost Hero */}
                    <div style={{ background: 'var(--text-main)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}>
                      <p style={{ fontSize: '.9375rem', opacity: .7, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 500 }}>Total Cost per kg</p>
                      <h2 style={{ fontSize: '3.5rem', fontWeight: 700, margin: 0, lineHeight: 1, color: 'var(--bg-surface)', letterSpacing: '-0.04em' }}>₱{parseFloat(results.summary.cost_per_kg).toFixed(2)}</h2>
                      <p style={{ fontSize: '.875rem', opacity: .8, margin: '12px 0 0 0' }}>
                        {results.summary.active_ingredients_count} active ingredients · {results.summary.locked_ingredients_count || 0} locked
                      </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                      {/* Ingredient Mix */}
                      <div>
                        <h4 style={{ fontSize: '.9375rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-muted)', marginBottom: 12 }}>Ingredient Mix</h4>
                        <div style={{ background: 'var(--bg-app)', borderRadius: 8, padding: 16, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {results.ingredient_composition.filter(i => i.included).map(i => (
                            <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--gray-200)' }}>
                              <div>
                                <span style={{ fontWeight: 600, fontSize: '.9375rem' }}>{i.name}</span>
                                {i.is_locked && <span className="badge badge-amber" style={{ marginLeft: 8 }}>🔒</span>}
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{(i.percentage * 100).toFixed(2)}%</div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>₱{parseFloat(i.cost_contribution).toFixed(2)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Nutrient Achievement */}
                      <div>
                        <h4 style={{ fontSize: '.9375rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--text-muted)', marginBottom: 12 }}>✅ All Targets Met</h4>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Nutrient</th>
                                <th>Target</th>
                                <th>Achieved</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(results.nutrient_achievement).map(([k, v]) => (
                                <tr key={k}>
                                  <td style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</td>
                                  <td style={{ fontFamily: 'monospace' }}>{parseFloat(v.required * 100).toFixed(2)}%</td>
                                  <td style={{ fontFamily: 'monospace', color: 'var(--emerald)', fontWeight: 700 }}>{parseFloat(v.achieved * 100).toFixed(2)}%</td>
                                  <td>✅</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                      <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setSaveModal(true)}>
                        <Icon name="save" size={18} /> 'save' Formulation
                      </button>
                      <button className="btn btn-secondary btn-lg" onClick={printResults}>
                        <Icon name="print" size={18} /> Print
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 'save' Modal */}
      {saveModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSaveModal(false) }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">'save' Formulation</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSaveModal(false)}><Icon name="cancel" size={18}/></button>
            </div>
            <form onSubmit={saveFormulation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Formulation Name *</label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Starter Feed Mix A" 
                    value={saveForm.name} 
                    onChange={e => setSaveForm(f => ({ ...f, name: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    placeholder="Notes about this mix..." 
                    value={saveForm.description} 
                    onChange={e => setSaveForm(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSaveModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Icon name="progress_activity" size={16} className="animate-pulse"/>Saving...</> : <><Icon name="save" size={16}/>'save' Record</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
