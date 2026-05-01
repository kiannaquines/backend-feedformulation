import { useEffect, useState } from 'react'
import { API } from '@/api'
import { useToast } from '@/components/ui/use-toast'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const EMPTY = {
  name: '', price: '', crude_protein: '', metabolized_energy: '',
  calcium: '', total_phosphorus: '', avail_phosphorus: '',
  crude_fiber: '', crude_fat: '', lysine: '', methionine: '',
  is_available: true,
}

export default function Ingredients() {
  const { toast } = useToast()
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    API.ingredients.all()
      .then(r => setList(r.data || []))
      .catch(() => toast({ variant: 'destructive', title: 'Failed to load ingredients' }))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal('add') }
  const openEdit = ing => { setForm({ ...ing, price: ing.price || '' }); setEditing(ing); setModal('edit') }
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
        toast({ title: 'Success', description: 'Ingredient updated ✓' })
      } else {
        await API.ingredients.create(payload)
        toast({ title: 'Success', description: 'Ingredient added ✓' })
      }
      load(); closeModal()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.detail || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  const del = async id => {
    if (!confirm('Delete this ingredient?')) return
    setDeleting(id)
    try {
      await API.ingredients.delete(id)
      toast({ title: 'Success', description: 'Ingredient removed' })
      load()
    } catch {
      toast({ variant: 'destructive', title: 'Delete failed' })
    } finally {
      setDeleting(null)
    }
  }

  const filtered = list.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()))

  const FIELDS = [
    { k: 'name', label: 'Name *', type: 'text' },
    { k: 'price', label: 'Price / kg (₱)*', type: 'number' },
    { k: 'crude_protein', label: 'Crude Protein (%)', type: 'number' },
    { k: 'metabolized_energy', label: 'Energy ME', type: 'number' },
    { k: 'calcium', label: 'Calcium (%)', type: 'number' },
    { k: 'total_phosphorus', label: 'Total Phosphorus (%)', type: 'number' },
    { k: 'avail_phosphorus', label: 'Avail. Phosphorus (%)', type: 'number' },
    { k: 'crude_fiber', label: 'Crude Fiber (%)', type: 'number' },
    { k: 'crude_fat', label: 'Crude Fat (%)', type: 'number' },
    { k: 'lysine', label: 'Lysine (%)', type: 'number' },
    { k: 'methionine', label: 'Methionine (%)', type: 'number' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Icon name="inventory_2" size={28} />
            Ingredients
          </h1>
          <p className="text-muted-foreground mt-1">{list.length} ingredients in library</p>
        </div>
        <Button onClick={openAdd} size="lg">
          <Icon name="add" size={18} />
          Add Ingredient
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search ingredients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Icon name="inventory_2" size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ingredients found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? 'Try a different search term' : 'Add your first ingredient to get started'}
            </p>
            <Button onClick={openAdd}>
              <Icon name="add" size={16} />
              Add Ingredient
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Protein %</TableHead>
                <TableHead>Energy ME</TableHead>
                <TableHead>Calcium %</TableHead>
                <TableHead>Phosphorus %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ing => (
                <TableRow key={ing.id}>
                  <TableCell className="font-semibold">{ing.name}</TableCell>
                  <TableCell>₱{parseFloat(ing.price || 0).toFixed(2)}</TableCell>
                  <TableCell>{ing.crude_protein ?? '—'}</TableCell>
                  <TableCell>{ing.metabolized_energy ?? '—'}</TableCell>
                  <TableCell>{ing.calcium ?? '—'}</TableCell>
                  <TableCell>{ing.total_phosphorus ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={ing.is_available ? 'default' : 'secondary'}>
                      {ing.is_available ? (
                        <>
                          <Icon name="check" size={12} className="mr-1" />
                          Available
                        </>
                      ) : (
                        'Unavailable'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(ing)}>
                        <Icon name="edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => del(ing.id)}
                        disabled={deleting === ing.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === ing.id ? (
                          <Icon name="progress_activity" size={16} className="animate-spin" />
                        ) : (
                          <Icon name="delete" size={16} />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Modal */}
      <Dialog open={!!modal} onOpenChange={open => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modal === 'add' ? 'Add Ingredient' : 'Edit Ingredient'}</DialogTitle>
            <DialogDescription>
              {modal === 'add' ? 'Add a new ingredient to your library' : 'Update ingredient details'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save}>
            <div className="grid grid-cols-2 gap-4 py-4">
              {FIELDS.map(({ k, label, type }) => (
                <div key={k} className={k === 'name' ? 'col-span-2' : ''}>
                  <Label htmlFor={k}>{label}</Label>
                  <Input
                    id={k}
                    type={type}
                    step={type === 'number' ? 'any' : undefined}
                    value={form[k] ?? ''}
                    onChange={set(k)}
                    required={k === 'name' || k === 'price'}
                    placeholder={type === 'number' ? '0.00' : ''}
                    className="mt-1.5"
                  />
                </div>
              ))}
              <div className="col-span-2 flex items-center gap-3 mt-2">
                <input
                  type="checkbox"
                  id="avail"
                  checked={!!form.is_available}
                  onChange={set('is_available')}
                  className="w-4 h-4"
                />
                <Label htmlFor="avail" className="cursor-pointer">
                  {form.is_available ? (
                    <span className="flex items-center gap-1">
                      <Icon name="check" size={14} /> Available
                    </span>
                  ) : (
                    'Unavailable'
                  )}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Icon name="progress_activity" size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Icon name="check_circle" size={16} />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
