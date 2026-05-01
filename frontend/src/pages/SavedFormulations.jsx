import { useEffect, useState } from 'react'
import { API } from '../api'
import { useToast } from '../components/Toast'
import { Icon } from '../components/Icon'

export default function SavedFormulations() {
  const { toast, ToastContainer } = useToast()
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    API.formulation.mine()
      .then(r => setList(r.data || []))
      .catch(() => toast('Failed to load formulations', 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const del = async id => {
    if (!confirm('Delete this formulation?')) return
    setDeleting(id)
    try {
      await API.formulation.remove(id)
      toast('Formulation removed', 'success'); load()
    } catch { toast('Delete failed', 'error') }
    finally { setDeleting(null) }
  }

  const fmt = date => date ? new Date(date).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }) : '—'

  return (
    <div>
      <ToastContainer/>
      <div className="container" style={{ marginBottom: 16 }}>
        <div className="page-hero-inner">
          <h1><Icon name="bookmark" size={24} style={{ marginRight:10, verticalAlign:'middle' }}/>Saved Formulations</h1>
          <p style={{ opacity:.8 }}>{list.length} saved formula{list.length!==1?'s':''}</p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height:72, borderRadius:16 }}/>)}
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <Icon name="bookmark" size={48} className="empty-state-icon"/>
            <h3>No saved formulations</h3>
            <p>Calculate a formulation and hit "'save'" to keep it here.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {list.map(f => {
              const open    = expanded[f.id]
              const payload = typeof f.payload === 'string' ? JSON.parse(f.payload || '{}') : (f.payload || {})
              const summary = payload.summary || {}
              const ingList = payload.ingredient_composition || []
              const nutrients = payload.nutrient_achievement || {}

              return (
                <div key={f.id} className="card">
                  <div className="card-body" style={{ padding:'18px 22px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                      <div>
                        <h3 style={{ fontWeight:700, fontSize:'1.0625rem', color:'var(--gray-900)', marginBottom:4 }}>
                          {f.formulation_name || 'Untitled'}
                        </h3>
                        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                          <span style={{ fontSize:'.8125rem', color:'var(--gray-500)', display:'flex', alignItems:'center', gap:4 }}>
                            <Icon name="calendar_today" size={13}/> {fmt(f.created_at)}
                          </span>
                          {summary.cost_per_kg !== undefined && (
                            <span className="badge badge-green">₱{parseFloat(summary.cost_per_kg).toFixed(2)}/kg</span>
                          )}
                          {summary.active_ingredients_count !== undefined && (
                            <span className="badge badge-blue">{summary.active_ingredients_count} ingredients</span>
                          )}
                          {summary.locked_ingredients_count > 0 && (
                            <span className="badge badge-amber"><Icon name="lock" size={12} style={{ marginRight:4 }}/> {summary.locked_ingredients_count} locked</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(e=>({...e,[f.id]:!open}))}>
                          {open ? <Icon name="expand_less" size={16}/> : <Icon name="expand_more" size={16}/>}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm" style={{ color:'var(--red)' }}
                          onClick={() => del(f.id)} disabled={deleting===f.id}
                        >
                          {deleting===f.id ? <Icon name="progress_activity" size={15} className="animate-pulse"/> : <Icon name="delete" size={15}/>}
                        </button>
                      </div>
                    </div>

                    {open && (
                      <div style={{ marginTop:18, paddingTop:18, borderTop:'1px solid var(--gray-100)' }}>
                        {f.formulation_description && (
                          <p style={{ fontSize:'.875rem', color:'var(--gray-500)', marginBottom:16 }}>{f.formulation_description}</p>
                        )}

                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                          {/* Ingredients */}
                          <div>
                            <p style={{ fontSize:'.8125rem', fontWeight:600, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:10 }}>
                              Ingredient Mix
                            </p>
                            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                              {ingList.filter(i=>i.included).map(i => (
                                <div key={i.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', background:'var(--gray-50)', borderRadius:8 }}>
                                  <span style={{ fontSize:'.875rem', fontWeight:500 }}>
                                    {i.name}{i.is_locked && <Icon name="lock" size={12} style={{ marginLeft: 4 }} />}
                                  </span>
                                  <span style={{ fontWeight:600, color:'var(--text-main)', fontSize:'.875rem' }}>
                                    {parseFloat(i.percentage).toFixed(2)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Nutrients */}
                          <div>
                            <p style={{ fontSize:'.8125rem', fontWeight:600, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:10 }}>
                              Nutrient Targets
                            </p>
                            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                              {Object.entries(nutrients).map(([k, v]) => (
                                <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', background:'var(--gray-50)', borderRadius:8 }}>
                                  <span style={{ fontSize:'.8125rem', color:'var(--gray-600)' }}>
                                    {k.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}
                                  </span>
                                  <span style={{ fontWeight:700, color:'var(--emerald)', fontSize:'.875rem' }}>
                                    {parseFloat(v.achieved).toFixed(4)} <Icon name="check_circle" size={14} color="var(--emerald-border)" style={{ marginLeft:4 }}/>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
