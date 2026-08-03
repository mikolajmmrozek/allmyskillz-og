import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MediaPicker from './MediaPicker';
import { getEntitySchema } from '@/lib/entitySchemas';
import { ArrowLeft, Save, Loader2, Plus, X, Image as ImageIcon } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Determine the display type of a schema property using custom hints (format / relation)
function fieldKind(prop) {
  if (!prop) return 'text';
  const fmt = prop.format;
  if (prop.relation) return prop.type === 'array' ? 'relation-multi' : 'relation-single';
  if (prop.type === 'array') {
    if (fmt === 'media-list' || prop.items?.format === 'media') return 'media-list';
    if (prop.items?.type === 'object') return 'object-list';
    return 'text-list';
  }
  if (prop.type === 'boolean') return 'boolean';
  if (prop.type === 'number') return 'number';
  if (prop.enum) return 'enum';
  if (fmt === 'richtext') return 'richtext';
  if (fmt === 'media') return 'media';
  if (prop.format === 'date') return 'date';
  if (prop.format === 'date-time') return 'datetime';
  return 'text';
}

// Group bilingual _pl/_en fields together
function buildGroups(properties) {
  const keys = Object.keys(properties);
  const groups = [];
  const consumed = new Set();
  for (const key of keys) {
    if (consumed.has(key)) continue;
    if (key.endsWith('_pl')) {
      const base = key.slice(0, -3);
      const enKey = `${base}_en`;
      if (properties[enKey]) {
        groups.push({ type: 'bilingual', base, plKey: key, enKey, prop: properties[key] });
        consumed.add(key); consumed.add(enKey);
        continue;
      }
    }
    if (key.endsWith('_en')) {
      const base = key.slice(0, -3);
      const plKey = `${base}_pl`;
      if (properties[plKey]) { consumed.add(key); continue; }
    }
    groups.push({ type: 'single', field: key, prop: properties[key] });
  }
  return groups;
}

export default function CollectionEditor({ entityName, recordId, onSaved }) {
  const navigate = useNavigate();
  const params = useParams();
  const id = recordId || params.id;
  const { lang } = useLang();
  const isNew = !id || id === 'new';

  const [schema, setSchema] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [relationCache, setRelationCache] = useState({});
  const [mediaPicker, setMediaPicker] = useState({ open: false, field: null, multiple: false });

  const groups = useMemo(() => (schema ? buildGroups(schema.properties) : []), [schema]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sch = getEntitySchema(entityName);
        if (!sch) throw new Error(`No schema found for entity "${entityName}"`);
        setSchema(sch);
        if (!isNew) {
          const rec = await base44.entities[entityName].get(id);
          setForm(rec || {});
        } else {
          // defaults
          const defaults = {};
          for (const [k, p] of Object.entries(sch.properties || {})) {
            if (p.default !== undefined) defaults[k] = p.default;
            else if (p.type === 'array') defaults[k] = [];
            else if (p.type === 'boolean') defaults[k] = false;
            else defaults[k] = '';
          }
          setForm(defaults);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [entityName, id, isNew]);

  // Load related entity options on demand
  const loadRelation = useCallback(async (entity) => {
    if (relationCache[entity]) return;
    try {
      const items = await base44.entities[entity].list('-created_date', 200);
      setRelationCache((prev) => ({ ...prev, [entity]: items }));
    } catch (e) { console.error(e); }
  }, [relationCache]);

  const save = async () => {
    setSaving(true);
    try {
      // clean empty strings → undefined for numbers
      const payload = { ...form };
      if (isNew) {
        const created = await base44.entities[entityName].create(payload);
        if (onSaved) { onSaved(created); setForm(created); }
        else navigate(`/admin/collection/${entityName}/${created.id}`);
      } else {
        const updated = await base44.entities[entityName].update(id, payload);
        setForm((prev) => ({ ...prev, ...payload, ...updated }));
        if (onSaved) onSaved(updated);
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const openMediaPicker = (field, multiple) => setMediaPicker({ open: true, field, multiple });
  const handlePick = (picked) => {
    const { field, multiple } = mediaPicker;
    if (multiple) {
      const arr = Array.isArray(picked) ? picked : [picked];
      set(field, [...(form[field] || []), ...arr]);
    } else {
      set(field, picked);
    }
  };

  // Reorder a media-list field and persist immediately (no Save button needed).
  const reorderAndSave = async (field, from, to) => {
    const cur = Array.isArray(form[field]) ? [...form[field]] : [];
    if (from < 0 || from >= cur.length || to < 0 || to >= cur.length) return;
    const [moved] = cur.splice(from, 1);
    cur.splice(to, 0, moved);
    const nextForm = { ...form, [field]: cur };
    setForm(nextForm);
    if (isNew) return; // new records save with the Save button
    setSaving(true);
    try {
      const updated = await base44.entities[entityName].update(id, nextForm);
      setForm((prev) => ({ ...prev, ...updated }));
      if (onSaved) onSaved(updated);
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Reorder save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !schema) {
    return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;
  }

  return (
    <div className="p-8 max-w-4xl pb-32">
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-neutral-50 z-10 -mx-8 px-8 py-4 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => onSaved ? navigate('/admin') : navigate(`/admin/collection/${entityName}`)} className="p-2 rounded-lg hover:bg-neutral-200 text-neutral-600"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-xl font-semibold">{isNew ? `New ${entityName}` : `Edit ${entityName}`}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/collection/${entityName}`)}>Cancel</Button>
          <Button onClick={save} disabled={saving} className="bg-[#CBFF00] text-black hover:bg-[#CBFF00]/90">
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {groups.map((group) => {
          if (group.type === 'bilingual') {
            const kind = fieldKind(group.prop);
            return (
              <div key={group.base}>
                <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3 block">{group.base.replace(/_/g, ' ')}</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 mb-1 block">POLSKI</span>
                    <FieldRenderer kind={kind} prop={group.prop} value={form[group.plKey]} onChange={(v) => set(group.plKey, v)} onPickMedia={() => openMediaPicker(group.plKey, false)} relationEntity={group.prop?.relation} relationCache={relationCache} loadRelation={loadRelation} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-400 mb-1 block">ENGLISH</span>
                    <FieldRenderer kind={kind} prop={group.prop} value={form[group.enKey]} onChange={(v) => set(group.enKey, v)} onPickMedia={() => openMediaPicker(group.enKey, false)} relationEntity={group.prop?.relation} relationCache={relationCache} loadRelation={loadRelation} />
                  </div>
                </div>
              </div>
            );
          }
          const kind = fieldKind(group.prop);
          return (
            <div key={group.field}>
              <Label className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 block">{group.field.replace(/_en$/, '').replace(/_/g, ' ')}</Label>
              <FieldRenderer
                kind={kind}
                prop={group.prop}
                value={form[group.field]}
                onChange={(v) => set(group.field, v)}
                onPickMedia={() => openMediaPicker(group.field, false)}
                onPickMediaMultiple={() => openMediaPicker(group.field, true)}
                onRemoveMediaItem={(idx) => set(group.field, (form[group.field] || []).filter((_, i) => i !== idx))}
                onReorderMedia={(from, to) => reorderAndSave(group.field, from, to)}
                relationEntity={group.prop?.relation}
                relationCache={relationCache}
                loadRelation={loadRelation}
                form={form}
                setForm={set}
                field={group.field}
              />
            </div>
          );
        })}
      </div>

      <MediaPicker
        open={mediaPicker.open}
        onClose={() => setMediaPicker({ open: false, field: null, multiple: false })}
        onPick={handlePick}
        allowMultiple={mediaPicker.multiple}
      />
    </div>
  );
}

function FieldRenderer({ kind, prop, value, onChange, onPickMedia, onPickMediaMultiple, onRemoveMediaItem, onReorderMedia, relationEntity, relationCache, loadRelation, form, setForm, field }) {
  // Always-safe effect: load related entity options when this is a relation field
  useEffect(() => {
    if ((kind === 'relation-single' || kind === 'relation-multi') && relationEntity) {
      loadRelation(relationEntity);
    }
  }, [kind, relationEntity, loadRelation]);

  if (kind === 'relation-single' || kind === 'relation-multi') {
    const entity = relationEntity;
    const options = relationCache[entity] || [];
    if (kind === 'relation-single') {
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.title_en || o.name_en || o.label_en || o.title || o.name || o.id}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }
    const selected = Array.isArray(value) ? value : [];
    const toggle = (oid) => onChange(selected.includes(oid) ? selected.filter((x) => x !== oid) : [...selected, oid]);
    return (
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-lg">
        {options.length === 0 && <span className="text-xs text-neutral-400">No {entity} records yet.</span>}
        {options.map((o) => {
          const sel = selected.includes(o.id);
          const label = o.title_en || o.name_en || o.label_en || o.title || o.name || o.id;
          return (
            <button key={o.id} type="button" onClick={() => toggle(o.id)} className={`px-2.5 py-1 text-xs rounded-full transition ${sel ? 'bg-[#CBFF00] text-black' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  if (kind === 'media') {
    return (
      <div className="flex items-center gap-3">
        {value ? <img src={value} alt="" className="w-20 h-20 object-cover rounded-lg border" /> : <div className="w-20 h-20 rounded-lg border border-dashed flex items-center justify-center text-neutral-300"><ImageIcon className="w-6 h-6" /></div>}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onPickMedia}>Choose</Button>
          {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>Clear</Button>}
        </div>
      </div>
    );
  }

  if (kind === 'media-list') {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div>
        <DragDropContext onDragEnd={(res) => {
          if (!res.destination || res.destination.index === res.source.index) return;
          onReorderMedia?.(res.source.index, res.destination.index);
        }}>
          <Droppable droppableId="media-list" direction="horizontal">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-2 mb-2">
                {arr.map((url, idx) => (
                  <Draggable key={url + '-' + idx} draggableId={url + '-' + idx} index={idx}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="relative group cursor-grab active:cursor-grabbing">
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveMediaItem?.(idx); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3" /></button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <button type="button" onClick={() => onPickMediaMultiple?.()} className="w-20 h-20 rounded-lg border border-dashed flex flex-col items-center justify-center text-neutral-400 hover:border-neutral-400">
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] mt-1">Add</span>
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }

  if (kind === 'richtext') {
    return <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={6} className="font-mono text-sm" />;
  }

  if (kind === 'boolean') {
    return <div className="flex items-center gap-2 pt-1"><Switch checked={!!value} onCheckedChange={onChange} /></div>;
  }

  if (kind === 'number') {
    return <Input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
  }

  if (kind === 'enum') {
    return (
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
        <SelectContent>{prop.enum.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    );
  }

  if (kind === 'date') {
    return <Input type="date" value={value ? String(value).slice(0, 10) : ''} onChange={(e) => onChange(e.target.value)} />;
  }
  if (kind === 'datetime') {
    return <Input type="datetime-local" value={value ? String(value).slice(0, 16) : ''} onChange={(e) => onChange(e.target.value)} />;
  }

  if (kind === 'object-list') {
    return <ObjectListEditor prop={prop} value={value} onChange={onChange} />;
  }

  if (kind === 'text-list') {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        {arr.map((v, idx) => (
          <div key={idx} className="flex gap-2">
            <Input value={v} onChange={(e) => { const next = [...arr]; next[idx] = e.target.value; onChange(next); }} />
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(arr.filter((_, i) => i !== idx))}><X className="w-4 h-4" /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...arr, ''])}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>
    );
  }

  // default text — use Textarea for long fields, Input otherwise
  const isLong = prop?.title && prop.title.length > 20;
  return isLong ? <Textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={2} /> : <Input value={value || ''} onChange={(e) => onChange(e.target.value)} />;
}

// Repeatable sub-form for array-of-objects (e.g. variants, FAQ)
function ObjectListEditor({ prop, value, onChange }) {
  const itemProps = prop.items?.properties || {};
  const arr = Array.isArray(value) ? value : [];
  const update = (idx, key, val) => {
    const next = arr.map((o, i) => (i === idx ? { ...o, [key]: val } : o));
    onChange(next);
  };
  const add = () => onChange([...arr, {}]);
  const remove = (idx) => onChange(arr.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {arr.map((obj, idx) => (
        <div key={idx} className="border rounded-lg p-3 bg-neutral-50/50 relative">
          <button type="button" onClick={() => remove(idx)} className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(itemProps).map(([k, p]) => (
              <div key={k}>
                <span className="text-[10px] text-neutral-400 mb-0.5 block">{k.replace(/_/g, ' ')}</span>
                {p.type === 'number'
                  ? <Input type="number" value={obj[k] ?? ''} onChange={(e) => update(idx, k, e.target.value === '' ? '' : Number(e.target.value))} />
                  : <Input value={obj[k] || ''} onChange={(e) => update(idx, k, e.target.value)} />}
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="w-4 h-4 mr-1" /> Add item</Button>
    </div>
  );
}