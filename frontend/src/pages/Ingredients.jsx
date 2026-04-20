import { useEffect, useState } from 'react'
import { API } from '../api'
import { useToast } from '../components/Toast'
import { Package, Plus, Search, Edit3, Trash2, X, Loader2, CheckCircle } from 'lucide-react'

const EMPTY = {
  name: '', price: '', crude_protein: '', metabolized_energy: '',
  calcium: '', total_phosphorus: '', avail_phosphorus: '',
  crude_fiber: '', crude_fat: '', lysine: '', methionine: '',
  is_available: true,
}

export default function Ingredients() {
  const { toast, ToastContainer } = useToast()
  const [list, setList]       = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)   // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    API.ingredients.all()
      .then(r => setList(r.data || []))
      .catch(() => toast('Failed to load ingredients', 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd  = ()  => { setForm(EMPTY); setEditing(null); setModal('add') }
  const openEdit = ing => { setForm({...ing, price: ing.price||''}); setEditing(ing); setModal('edit') }
  const closeModal = () => { setModal(null); setEditing(null); setForm(EMPTY) }

  const set = k => e => setForm(f => ({
    ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
  }))

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...form }
      Object.keys(payload).forEach(k => {
        if (k !== 'name' && k !== 'is_available' && payload[k] !== '') {
          payload[k] = parseFloat(payload[k]) || 0
        }
      })
      if (modal === 'edit') {
        await API.ingredients.update(editing.id, payload)
        toast('Ingredient updated ✓', 'success')
      } else {
        await API.ingredients.create(payload)
        toast('Ingredient added ✓', 'success')
      }
      load(); closeModal()
    } catch (err) {
      toast(err.response?.data?.detail || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const del = async id => {
    if (!confirm('Delete this ingredient?')) return
    setDeleting(id)
    try {
      await API.ingredients.delete(id)
      toast('Ingredient removed', 'success')
      load()
    } catch {
      toast('Delete failed', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = list.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()))

  const FIELDS = [
    { k: 'name',               label: 'Name *',           type: 'text'  },
    { k: 'price',              label: 'Price / kg (₱)*',  type: 'number'},
    { k: 'crude_protein',      label: 'Crude Protein (%)',type: 'number'},
    { k: 'metabolized_energy', label: 'Energy ME',        type: 'number'},
    { k: 'calcium',            label: 'Calcium (%)',       type: 'number'},
    { k: 'total_phosphorus',   label: 'Total Phosphorus (%)', type: 'number'},
    { k: 'avail_phosphorus',   label: 'Avail. Phosphorus (%)', type: 'number'},
    { k: 'crude_fiber',        label: 'Crude Fiber (%)',  type: 'number'},
    { k: 'crude_fat',          label: 'Crude Fat (%)',    type: 'number'},
    { k: 'lysine',             label: 'Lysine (%)',       type: 'number'},
    { k: 'methionine',         label: 'Methionine (%)',   type: 'number'},
  ]

  return (
    <div>
      <ToastContainer/>

      <div className="page-hero" style={{ marginBottom: 32 }}>
        <div className="container page-hero-inner">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div>
              <h1><Package size={24} style={{ marginRight:10, verticalAlign:'middle' }}/>Ingredients</h1>
              <p style={{ opacity:.8 }}>{list.length} ingredients in library</p>
            </div>
            <button className="btn btn-lg" style={{ background:'#fff', color:'var(--farm-green-mid)', fontWeight:700 }} onClick={openAdd}>
              <Plus size={18}/> Add Ingredient
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Search */}
        <div style={{ position:'relative', marginBottom:24 }}>
          <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}/>
          <input
            className="form-input" placeholder="Search ingredients…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 42 }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height:56, borderRadius:12 }}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Package size={48} className="empty-state-icon"/>
            <h3>No ingredients found</h3>
            <p>{search ? 'Try a different search term' : 'Add your first ingredient to get started'}</p>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={openAdd}>
              <Plus size={16}/> Add Ingredient
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Protein %</th>
                  <th>Energy ME</th>
                  <th>Calcium %</th>
                  <th>Phosphorus %</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ing => (
                  <tr key={ing.id}>
                    <td><strong>{ing.name}</strong></td>
                    <td>₱{parseFloat(ing.price || 0).toFixed(2)}</td>
                    <td>{ing.crude_protein ?? '—'}</td>
                    <td>{ing.metabolized_energy ?? '—'}</td>
                    <td>{ing.calcium ?? '—'}</td>
                    <td>{ing.total_phosphorus ?? '—'}</td>
                    <td>
                      <span className={`badge ${ing.is_available ? 'badge-green' : 'badge-gray'}`}>
                        {ing.is_available ? '✓ Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ing)} title="Edit">
                          <Edit3 size={15}/>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm" onClick={() => del(ing.id)}
                          style={{ color:'var(--red)' }} disabled={deleting===ing.id}
                          title="Delete"
                        >
                          {deleting === ing.id ? <Loader2 size={15} className="animate-pulse"/> : <Trash2 size={15}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) closeModal() }}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{modal==='add' ? 'Add Ingredient' : 'Edit Ingredient'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><X size={18}/></button>
            </div>
            <form onSubmit={save}>
              <div className="modal-body">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  {FIELDS.map(({ k, label, type }) => (
                    <div key={k} className="form-group" style={{ gridColumn: k==='name' ? 'span 2' : undefined }}>
                      <label className="form-label">{label}</label>
                      <input
                        className="form-input" type={type}
                        step={type==='number' ? 'any' : undefined}
                        value={form[k] ?? ''} onChange={set(k)}
                        required={k==='name'||k==='price'}
                        placeholder={type==='number' ? '0.00' : ''}
                      />
                    </div>
                  ))}
                </div>
                <div className="toggle-wrapper" style={{ marginTop:16 }}>
                  <input type="checkbox" id="avail" checked={!!form.is_available} onChange={set('is_available')}/>
                  <label htmlFor="avail" className="form-label" style={{ marginBottom:0, cursor:'pointer' }}>
                    <div className={`toggle ${form.is_available ? 'on' : ''}`} onClick={() => setForm(f=>({...f, is_available:!f.is_available}))}/>
                  </label>
                  <span style={{ fontSize:'.875rem', color:'var(--gray-600)' }}>
                    {form.is_available ? '✓ Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><Loader2 size={16} className="animate-pulse"/>Saving…</> : <><CheckCircle size={16}/>Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
