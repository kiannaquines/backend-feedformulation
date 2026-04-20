import { useEffect, useState } from 'react'
import { API } from '../api'
import { useToast } from '../components/Toast'
import { Icon } from '../components/Icon'

const EMPTY_COMP = { protein_percent: '', energy_me: '', calcium_percent: '', phosphorus_percent: '' }
const EMPTY = { nutrient_requirement_name: '', nutrient_requirement_description: '', composition: EMPTY_COMP }

export default function NutrientRequirements() {
  const { toast, ToastContainer } = useToast()
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [expanded, setExpanded] = useState({})

  const load = () => {
    setLoading(true)
    API.nutrients.all()
      .then(r => setList(r.data || []))
      .catch(() => toast('Failed to load profiles', 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal('add') }
  const openEdit = nr => {
    setForm({
      nutrient_requirement_name: nr.nutrient_requirement_name,
      nutrient_requirement_description: nr.nutrient_requirement_description,
      composition: { ...EMPTY_COMP, ...(nr.composition || {}) }
    })
    setEditing(nr); setModal('edit')
  }
  const close = () => { setModal(null); setEditing(null); setForm(EMPTY) }

  const setComp = k => e => setForm(f => ({ ...f, composition: { ...f.composition, [k]: e.target.value } }))
  const setTop  = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = {
        ...form,
        composition: {
          protein_percent:    parseFloat(form.composition.protein_percent)    || 0,
          energy_me:          parseFloat(form.composition.energy_me)          || 0,
          calcium_percent:    parseFloat(form.composition.calcium_percent)    || 0,
          phosphorus_percent: parseFloat(form.composition.phosphorus_percent) || 0,
        }
      }
      if (modal === 'edit') {
        await API.nutrients.update(editing.id, payload)
        toast('Profile updated ✓', 'success')
      } else {
        await API.nutrients.create(payload)
        toast('Profile created ✓', 'success')
      }
      load(); close()
    } catch (err) {
      toast(err.response?.data?.detail || 'Save failed', 'error')
    } finally { setSaving(false) }
  }

  const del = async nr => {
    if (!confirm(`Delete "${nr.nutrient_requirement_name}"?`)) return
    try {
      await API.nutrients.delete(nr.id)
      toast('Profile removed', 'success'); load()
    } catch { toast('Delete failed', 'error') }
  }

  const COMP_FIELDS = [
    { k:'protein_percent',    label:'Protein (%)',    ph:'e.g. 18.0' },
    { k:'energy_me',          label:'Energy ME',      ph:'e.g. 2.9'  },
    { k:'calcium_percent',    label:'Calcium (%)',    ph:'e.g. 0.87' },
    { k:'phosphorus_percent', label:'Phosphorus (%)', ph:'e.g. 0.45' },
  ]

  return (
    <div>
      <ToastContainer/>
      <div className="page-hero" style={{ marginBottom:32 }}>
        <div className="container page-hero-inner">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h1><Icon name="checklist" size={24} style={{ marginRight:10, verticalAlign:'middle' }}/>Nutrient Profiles</h1>
              <p style={{ opacity:.8 }}>{list.length} profiles configured</p>
            </div>
            <button className="btn btn-lg" style={{ background:'var(--bg-surface)', color:'var(--text-main)', fontWeight:600 }} onClick={openAdd}>
              <Icon name="add" size={18}/> New Profile
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height:80, borderRadius:16 }}/>)}
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <Icon name="checklist" size={48} className="empty-state-icon"/>
            <h3>No nutrient profiles yet</h3>
            <p>Create a profile to quickly fill nutrient targets in the formulation calculator.</p>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={openAdd}><Icon name="add" size={16}/> Create Profile</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {list.map(nr => {
              const c = nr.composition || {}
              const open = expanded[nr.id]
              return (
                <div key={nr.id} className="card">
                  <div className="card-body" style={{ padding:'18px 22px' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                      <div>
                        <h3 style={{ fontWeight:700, fontSize:'1.0625rem', color:'var(--gray-900)', marginBottom:3 }}>
                          {nr.nutrient_requirement_name}
                        </h3>
                        <p style={{ fontSize:'.875rem', color:'var(--gray-500)' }}>
                          {nr.nutrient_requirement_description || 'No description'}
                        </p>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(e=>({...e,[nr.id]:!open}))}>
                          {open ? <Icon name="expand_less" size={16}/> : <Icon name="expand_more" size={16}/>}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(nr)}><Icon name="edit" size={15}/></button>
                        <button className="btn btn-ghost btn-sm" style={{color:'var(--red)'}} onClick={() => del(nr)}><Icon name="delete" size={15}/></button>
                      </div>
                    </div>
                    {open && (
                      <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--gray-100)' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
                          {[['Protein', c.protein_percent, '%'],['Energy ME', c.energy_me, ''],['Calcium', c.calcium_percent, '%'],['Phosphorus', c.phosphorus_percent, '%']].map(([lbl, val, u]) => (
                            <div key={lbl} style={{ background:'var(--gray-50)', borderRadius:12, padding:'14px 16px', border:'1px solid var(--gray-100)' }}>
                              <div style={{ fontSize:'.75rem', color:'var(--gray-400)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em', marginBottom:6 }}>{lbl}</div>
                              <div style={{ fontSize:'1.5rem', fontWeight:600, color:'var(--text-main)', letterSpacing:'-0.02em' }}>{val ?? '—'}{u}</div>
                            </div>
                          ))}
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

      {modal && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) close() }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{modal==='add' ? 'New Nutrient Profile' : 'Edit Profile'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><Icon name="close" size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="form-group">
                  <label className="form-label">Profile Name *</label>
                  <input className="form-input" placeholder="e.g. Layer Hen Diet" value={form.nutrient_requirement_name} onChange={setTop('nutrient_requirement_name')} required/>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Optional notes…" value={form.nutrient_requirement_description} onChange={setTop('nutrient_requirement_description')}/>
                </div>
                <div style={{ borderTop:'1px solid var(--gray-100)', paddingTop:16 }}>
                  <p style={{ fontSize:'.8125rem', fontWeight:600, color:'var(--gray-600)', marginBottom:12, textTransform:'uppercase', letterSpacing:'.04em' }}>Target Composition</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    {COMP_FIELDS.map(({ k, label, ph }) => (
                      <div key={k} className="form-group">
                        <label className="form-label">{label}</label>
                        <input className="form-input" type="number" step="any" min="0" placeholder={ph} value={form.composition[k]} onChange={setComp(k)} required/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Icon name="progress_activity" size={16} className="animate-pulse"/>Saving…</> : <><Icon name="check_circle" size={16}/>'save'</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
