'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Calendar } from 'primereact/calendar'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dropdown } from 'primereact/dropdown'

export type EventCategory = 'personal' | 'work' | 'meeting' | 'reminder'

export interface CalendarEvent {
  id: number | string
  title: string
  date: Date
  description?: string
  category?: EventCategory
}

interface TakvimProps {
  initialEvents?: CalendarEvent[]
  onChange?: (events: CalendarEvent[]) => void
}

const CATEGORIES = [
  { label: 'Kişisel', value: 'personal', color: '#818cf8' },
  { label: 'İş', value: 'work', color: '#34d399' },
  { label: 'Toplantı', value: 'meeting', color: '#f97316' },
  { label: 'Hatırlatıcı', value: 'reminder', color: '#f43f5e' },
]

const getCategoryColor = (value) =>
  CATEGORIES.find((c) => c.value === value)?.color ?? '#818cf8'

const getCategoryLabel = (value) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? value

const categoryItemTemplate = (option) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: option.color,
        display: 'inline-block',
      }}
    />
    {option.label}
  </div>
)

function isSameDay(d1, d2) {
  if (!d1 || !d2 || isNaN(d1) || isNaN(d2)) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

/**
 * @param {Object}   props
 * @param {Array}    props.initialEvents  - Başlangıç etkinlikleri
 *                   Her obje: { id, title, date: Date, description?, category? }
 *                   category: 'personal' | 'work' | 'meeting' | 'reminder'
 * @param {Function} props.onChange       - Etkinlikler değişince çağrılır: (events) => void
 */
export default function TakvimComponent({ initialEvents = [], onChange }: TakvimProps) {
  const toast = useRef<Toast>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>(
    initialEvents.map((e) => ({ ...e, date: new Date(e.date) }))
  )

  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState<CalendarEvent>({
    id: 0,
    title: '',
    description: '',
    category: 'personal',
    date: new Date(),
  })

  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.date, selectedDate)),
    [events, selectedDate]
  )

  const openNew = () => {
    setEditingEvent(null)
    setForm({ id: 0, title: '', description: '', category: 'personal', date: selectedDate })
    setDialogVisible(true)
  }

  const openEdit = (event) => {
    setEditingEvent(event)
    setForm({ description: '', ...event })
    setDialogVisible(true)
  }

  const updateEvents = (nextEvents) => {
    setEvents(nextEvents)
    onChange?.(nextEvents)
  }

  const saveEvent = () => {
    if (!form.title.trim()) return

    if (editingEvent) {
      updateEvents(events.map((e) => (e.id === editingEvent.id ? { ...form, id: e.id } : e)))
      toast.current.show({ severity: 'success', summary: 'Güncellendi', life: 2000 })
    } else {
      updateEvents([...events, { ...form, id: Date.now() }])
      toast.current.show({ severity: 'success', summary: 'Etkinlik eklendi', life: 2000 })
    }
    setDialogVisible(false)
  }

  const deleteEvent = (id) => {
    confirmDialog({
      message: 'Bu etkinliği silmek istediğine emin misin?',
      header: 'Sil',
      icon: 'pi pi-trash',
      acceptLabel: 'Evet, sil',
      rejectLabel: 'İptal',
      acceptClassName: 'p-button-danger',
      accept: () => {
        updateEvents(events.filter((e) => e.id !== id))
        toast.current.show({ severity: 'warn', summary: 'Silindi', life: 2000 })
      },
    })
  }

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => e.date > new Date() && !isSameDay(e.date, selectedDate))
        .sort((a, b) => a.date - b.date)
        .slice(0, 4),
    [events, selectedDate]
  )

  const dateTemplate = useCallback((date) => {
    const d = new Date(date.year, date.month, date.day)
    const hasEvent = events.some((e) => isSameDay(e.date, d))
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <span>{date.day}</span>
        {hasEvent && (
          <span
            style={{
              position: 'absolute',
              bottom: -4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#818cf8',
              display: 'block',
            }}
          />
        )}
      </div>
    )
  }, [events])

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog />

      <div
        style={{
          display: 'flex',
          gap: '24px',
          padding: '32px',
          minHeight: '100vh',
          background: '#0f0f1a',
          fontFamily: "'DM Sans', sans-serif",
          color: '#e2e2f0',
          flexWrap: 'wrap',
        }}
      >
        {/* ── Sol: Büyük Takvim ── */}
        <div style={{ flex: '0 0 340px' }}>
          <div style={{ marginBottom: 20 }}>
            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              📅 Takvim
            </h1>
            <p style={{ color: '#6b6b9a', fontSize: '0.85rem', marginTop: 4 }}>
              {new Date().toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <Calendar
            value={selectedDate}
            onChange={(e) => e.value && setSelectedDate(e.value)}
            inline
            dateTemplate={dateTemplate}
            style={{ width: '100%' }}
          />
        </div>

        {/* ── Sağ: Etkinlikler ── */}
        <div style={{ flex: 1, minWidth: 300 }}>
          {/* Başlık + Ekle butonu */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {selectedDate.toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h2>
              <p style={{ color: '#6b6b9a', fontSize: '0.8rem' }}>
                {dayEvents.length} etkinlik
              </p>
            </div>
            <Button
              icon="pi pi-plus"
              label="Ekle"
              size="small"
              onClick={openNew}
              style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                padding: '8px 16px',
              }}
            />
          </div>

          {/* Etkinlik Listesi */}
          {dayEvents.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#13132b',
                borderRadius: 16,
                color: '#6b6b9a',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗓️</div>
              <p style={{ fontWeight: 600 }}>Bu gün için etkinlik yok</p>
              <p style={{ fontSize: '0.82rem', marginTop: 6 }}>
                Yukarıdaki "Ekle" butonuyla yeni bir etkinlik oluştur
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    background: '#13132b',
                    borderRadius: 14,
                    padding: '16px 18px',
                    borderLeft: `4px solid ${getCategoryColor(event.category)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                    transition: 'transform 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = 'translateX(4px)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = 'translateX(0)')
                  }
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {event.title}
                      </span>
                      <Tag
                        value={getCategoryLabel(event.category)}
                        style={{
                          background: getCategoryColor(event.category) + '22',
                          color: getCategoryColor(event.category),
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: 99,
                          border: `1px solid ${getCategoryColor(event.category)}44`,
                        }}
                      />
                    </div>
                    {event.description && (
                      <p style={{ color: '#9090b8', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <Button
                      icon="pi pi-pencil"
                      rounded
                      text
                      size="small"
                      onClick={() => openEdit(event)}
                      style={{ color: '#818cf8' }}
                    />
                    <Button
                      icon="pi pi-trash"
                      rounded
                      text
                      size="small"
                      onClick={() => deleteEvent(event.id)}
                      style={{ color: '#f43f5e' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Yaklaşan Etkinlikler */}
          {upcomingEvents.length > 0 && (
              <div style={{ marginTop: 32 }}>
                <p
                  style={{
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    color: '#6366f1',
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  Yaklaşan Etkinlikler
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedDate(new Date(event.date))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        background: '#13132b',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = '#1c1c3a')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = '#13132b')
                      }
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: getCategoryColor(event.category),
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {event.title}
                        </p>
                        <p style={{ color: '#6b6b9a', fontSize: '0.75rem' }}>
                          {event.date.toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        </div>
      </div>

      {/* ── Etkinlik Dialog ── */}
      <Dialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        header={editingEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik'}
        style={{ width: '420px' }}
        modal
        draggable={false}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              label="İptal"
              text
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label={editingEvent ? 'Güncelle' : 'Ekle'}
              icon="pi pi-check"
              onClick={saveEvent}
              disabled={!form.title.trim()}
              style={{
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                border: 'none',
              }}
            />
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <div className="flex flex-column gap-2">
            <label style={{ fontSize: '0.82rem', color: '#9090b8' }}>Başlık *</label>
            <InputText
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Etkinlik başlığı"
              autoFocus
            />
          </div>

          <div className="flex flex-column gap-2">
            <label style={{ fontSize: '0.82rem', color: '#9090b8' }}>Açıklama</label>
            <InputTextarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Açıklama (isteğe bağlı)"
              rows={3}
              autoResize
            />
          </div>

          <div className="flex flex-column gap-2">
            <label style={{ fontSize: '0.82rem', color: '#9090b8' }}>Tarih</label>
            <Calendar
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.value ?? new Date() })}
              dateFormat="dd/mm/yy"
              showIcon
            />
          </div>

          <div className="flex flex-column gap-2">
            <label style={{ fontSize: '0.82rem', color: '#9090b8' }}>Kategori</label>
            <Dropdown
              value={form.category}
              options={CATEGORIES}
              onChange={(e) => setForm({ ...form, category: e.value })}
              optionLabel="label"
              optionValue="value"
              itemTemplate={categoryItemTemplate}
            />
          </div>
        </div>
      </Dialog>
    </>
  )
}