import TakvimComponent from '@/comporents/Takim'

const events = [
  {
    id: 1,
    title: 'Toplantı',
    date: new Date('2026-05-10'),
    description: 'Sprint planning',
    category: 'meeting', // 'personal' | 'work' | 'meeting' | 'reminder'
  },
]

export default function Page() {
  return (
    <TakvimComponent
      initialEvents={events}
      onChange={(updatedEvents) => console.log(updatedEvents)}
    />
  )
}