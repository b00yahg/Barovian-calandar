import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Moon, Skull, Book, PlusCircle } from 'lucide-react';

const BAROVIAN_MONTHS = [
  'Yinvar', 'Fivral', 'Mart', 'Apryl', 'Mai', 'Eyune',
  'Eyule', 'Avgust', 'Sintyavr', 'Octyavr', 'Neyavr', 'Dekavr'
];

const DAYS_IN_MONTH = 28;

const useBarovianDate = (initialDate) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const addDays = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    const monthDiff = Math.floor((newDate.getDate() - 1) / DAYS_IN_MONTH);
    newDate.setMonth(currentDate.getMonth() + monthDiff);
    newDate.setDate(((newDate.getDate() - 1) % DAYS_IN_MONTH) + 1);
    setCurrentDate(newDate);
  };

  const subtractDays = (days) => {
    addDays(-days);
  };

  const monthName = BAROVIAN_MONTHS[currentDate.getMonth()];
  const day = currentDate.getDate();
  const year = 735;

  return {
    currentDate,
    addDays,
    subtractDays,
    monthName,
    day,
    year,
  };
};

const getMoonPhase = (date) => {
  const daysSinceFullMoon = (date - new Date(735, 10, 1)) / (1000 * 60 * 60 * 24) % 14;
  if (daysSinceFullMoon === 0) return 'Full Moon';
  if (daysSinceFullMoon === 7) return 'New Moon';
  return daysSinceFullMoon < 7 ? 'Waning' : 'Waxing';
};

const BarovianCalendar = ({ events, initialQuests }) => {
  const { currentDate, addDays, subtractDays, monthName, day, year } = useBarovianDate(new Date(735, 9, 27));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notes, setNotes] = useState({});
  const [quests, setQuests] = useState(initialQuests);
  const [newNote, setNewNote] = useState('');
  const [newQuest, setNewQuest] = useState({ title: '', description: '' });
  const [highlightedQuest, setHighlightedQuest] = useState(null);

  const getEventsForDay = (day) => {
    return events.filter(event => 
      event.date.getFullYear() === currentDate.getFullYear() &&
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getDate() === day
    );
  };

  const getActiveQuestsForDay = (date) => {
    return quests.filter(quest => 
      quest.active && 
      date >= quest.startDate &&
      date <= quest.endDate
    );
  };

  const addNote = () => {
    if (newNote.trim()) {
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
      setNotes(prevNotes => ({
        ...prevNotes,
        [dateKey]: [...(prevNotes[dateKey] || []), newNote]
      }));
      setNewNote('');
    }
  };

  const addQuest = () => {
    if (newQuest.title.trim() && newQuest.description.trim()) {
      setQuests(prevQuests => [...prevQuests, { ...newQuest, active: true }]);
      setNewQuest({ title: '', description: '' });
    }
  };

  const toggleQuestStatus = (title) => {
    setQuests(prevQuests => prevQuests.map(quest => 
      quest.title === title ? { ...quest, active: !quest.active } : quest
    ));
  };

  const renderCalendarDays = () => {
    const days = [];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day"></div>);
    }
  
    for (let i = 1; i <= DAYS_IN_MONTH; i++) {
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayEvents = getEventsForDay(i);
      const isCurrentDay = i === day;
      const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${i}`;
      const hasNotes = notes[dateKey] && notes[dateKey].length > 0;
      const activeQuests = getActiveQuestsForDay(dateToCheck);
      const moonPhase = getMoonPhase(dateToCheck);
      const isHighlighted = highlightedQuest && activeQuests.some(quest => quest.title === highlightedQuest);
      
      days.push(
        <div
          key={i}
          className={`calendar-day p-2 text-center cursor-pointer relative group
            ${isCurrentDay ? 'current-day' : ''}
            ${activeQuests.length > 0 ? 'bg-yellow-900/30' : ''}
            ${moonPhase === 'Full Moon' ? 'border-2 border-blue-300' : ''}
            ${isHighlighted ? 'bg-yellow-500/50' : ''}
            hover:bg-red-900/30 transition-colors duration-300`}
          onClick={() => {
            addDays(i - day);
            if (dayEvents.length > 0) setSelectedEvent(dayEvents);
          }}
        >
          {i}
          {dayEvents.length > 0 && (
            <>
              <span className="ml-1 text-yellow-500">•</span>
              <div className="absolute z-10 w-64 p-2 bg-gray-800 text-white rounded shadow-lg 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                              pointer-events-none left-1/2 transform -translate-x-1/2">
                {dayEvents.map((event, index) => (
                  <div key={index} className="mb-1">{event.title}</div>
                ))}
              </div>
            </>
          )}
          {hasNotes && <Book className="w-4 h-4 inline-block ml-1 text-blue-300" />}
          {activeQuests.length > 0 && <span className="text-yellow-500 ml-1">⚔</span>}
          {moonPhase === 'Full Moon' && <Moon className="w-4 h-4 inline-block ml-1 text-blue-300" />}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900/90 rounded-xl shadow-lg overflow-hidden m-4 text-gray-200 p-8">
      <h1 className="text-5xl font-bold text-red-600 mb-6 text-center font-horror glow-effect"> Barovian Calendar </h1>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => subtractDays(1)} className="button"><ChevronLeft /></button>
        <div className="text-center">
          <h2 className="text-3xl font-bold font-horror">{`${monthName} ${day}, ${year} B.C.`}</h2>
          <div className="text-sm">Moon Phase: {getMoonPhase(currentDate)}</div>
        </div>
        <button onClick={() => addDays(1)} className="button"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-bold text-red-400">{day}</div>
        ))}
        {renderCalendarDays()}
      </div>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <h3 className="text-xl font-bold mb-2 text-red-400 font-horror">Active Quests</h3>
          <ul className="space-y-2">
            {getActiveQuestsForDay(currentDate).map((quest, index) => (
              <li 
                key={index} 
                className={`flex items-center justify-between bg-gray-800 p-2 rounded cursor-pointer
                  ${highlightedQuest === quest.title ? 'ring-2 ring-yellow-500' : ''}`}
                onClick={() => setHighlightedQuest(highlightedQuest === quest.title ? null : quest.title)}
              >
                <span>{quest.title}</span>
                <button onClick={(e) => {
                  e.stopPropagation();
                  toggleQuestStatus(quest.title);
                }} className="button text-sm">
                  Complete
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <input
              type="text"
              value={newQuest.title}
              onChange={(e) => setNewQuest(prev => ({ ...prev, title: e.target.value }))}
              placeholder="New quest title"
              className="input w-full mb-2"
            />
            <textarea
              value={newQuest.description}
              onChange={(e) => setNewQuest(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Quest description"
              className="input w-full mb-2"
            />
            <button onClick={addQuest} className="button">
              Add Quest
            </button>
            {highlightedQuest && (
              <button 
                onClick={() => setHighlightedQuest(null)}
                className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Highlight
              </button>
            )}
          </div>
        </div>
        <div className="w-1/2">
          <h3 className="text-xl font-bold mb-2 text-red-400 font-horror">Notes for {`${monthName} ${day}`}</h3>
          <ul className="space-y-2 mb-4">
            {notes[`${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`]?.map((note, index) => (
              <li key={index} className="bg-gray-800 p-2 rounded">{note}</li>
            ))}
          </ul>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note..."
            className="input w-full mb-2"
          />
          <button onClick={addNote} className="button">
            Add Note
          </button>
        </div>
      </div>
      {selectedEvent && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h3 className="font-bold text-red-400 font-horror mb-2">Events for {`${monthName} ${day}`}</h3>
          {Array.isArray(selectedEvent) ? (
            selectedEvent.map((event, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-bold text-yellow-400">{event.title}</h4>
                <p>{event.description}</p>
              </div>
            ))
          ) : (
            <>
              <h4 className="font-bold text-yellow-400">{selectedEvent.title}</h4>
              <p>{selectedEvent.description}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Comprehensive event list based on the provided timeline
const events = [
  { date: new Date(735, 9, 27), title: "Enter Death House", description: "Players enter Death House", type: "introduction" },
  { date: new Date(735, 9, 28), title: "Arrive in Barovia", description: "Players arrive in the village of Barovia and meet Ismark and Ireena", type: "introduction" },
  { date: new Date(735, 10, 1), title: "Tarokka Reading", description: "Players receive the Tarokka reading", type: "introduction" },
  { date: new Date(735, 10, 2), title: "Arrive in Vallaki", description: "Players arrive in Vallaki at dusk", type: "introduction" },
  { date: new Date(735, 10, 2), title: "Rictavio's Arrival", description: "Ringmaster Rictavio reserves a room at the Blue Water Inn", type: "event" },
  { date: new Date(735, 10, 2), title: "Bones Stolen", description: "Milivoj steals the bones of St. Andral", type: "event" },
  { date: new Date(735, 10, 3), title: "Missing Bones Discovered", description: "Father Lucian Petrovich discovers the missing bones", type: "event" },
  { date: new Date(735, 10, 3), title: "Festival Posters", description: "Izek Strazni puts up posters for the Festival of the Blazing Sun", type: "event" },
  { date: new Date(735, 10, 3), title: "Wachter's Invitation", description: "If the palyers show potental resistance twords Vargas, they are invited to dinner by Lady Wachter.", type: "event" },
  { date: new Date(735, 10, 4), title: "Arabelle's Nameday", description: "Arabelle's nameday at the Vistani encampment", type: "event" },
  { date: new Date(735, 10, 4), title: "Dinner With Wachter", description: "The party enjoys a dinner with lady Wachter", type: "event" },
  { date: new Date(735, 10, 5), title: "Ghostly Visit", description: "The Spirit of Ermaus Van Richten appears to the party", type: "deadline" },
  { date: new Date(735, 10, 6), title: "Izek Kidnapes Irena", description: "If the party fails to take care of Izek, he kidnaps Irena today", type: "deadline" },
  { date: new Date(735, 10, 7), title: "St. Andral's Feast", description: "St. Andral's Feast observed. If the party does not recover the bones, the church's ward fails", type: "deadline" },
  { date: new Date(735, 10, 7), title: "Festival of the Blazing Sun", description: "Vallaki observes the Festival of the Blazing Sun. If Irena is not saved, she burns.", type: "event" },
  { date: new Date(735, 10, 8), title: "Potential Riots", description: "Possible riots in Vallaki depending on previous events", type: "event" },
  { date: new Date(735, 10, 9), title: "Stella's Soul Lost", description: "Stella Wachter's soul vanishes into the Ethereal Plane", type: "event" },
  { date: new Date(735, 10, 9), title: "The Stolen Gem", description: "Urwin Martikov requests help to recover the stolen gem", type: "introduction" },
  { date: new Date(735, 10, 11), title: "Yester Hill Ritual", description: "Druids complete the ritual at Yester Hill. If the party fails to do this by then, Wintersplinter may be unleashed", type: "deadline" },
  { date: new Date(735, 10, 10), title: "Ezmerelda's Return", description: "Ezmerelda d'Avenir returns to the Abbey of Saint Markovia", type: "event" },
  { date: new Date(735, 10, 13), title: "Dinner with Strahd", description: "Players dine with Strahd von Zarovich at dusk", type: "event" },
  { date: new Date(735, 10, 14), title: "Ravenloft Vulnerable", description: "Strahd is away, presenting an opportunity to infiltrate Castle Ravenloft", type: "event" },
];

// Initial quests based on Acts and visuals provided
const initialQuests = [
  { 
    title: "Escape from Death House", 
    description: "Survive the horrors of Death House", 
    startDate: new Date(735, 9, 27), 
    endDate: new Date(735, 9, 27), 
    active: true 
  },
  { 
    title: "Welcome to Barovia", 
    description: "Protect the village of Barovia from a siege", 
    startDate: new Date(735, 9, 28), 
    endDate: new Date(735, 9, 28), 
    active: true 
  },
  { 
    title: "Into the Valley", 
    description: "Journey deeper into the Valley of Barovia", 
    startDate: new Date(735, 10, 1), 
    endDate: new Date(735, 10, 2), 
    active: true 
  },
  { 
    title: "St. Andral's Feast", 
    description: "Investigate the missing bones and prevent a disaster", 
    startDate: new Date(735, 10, 3), 
    endDate: new Date(735, 10, 6), 
    active: true 
  },
  { 
    title: "The Missing Vistana", 
    description: "Find the missing Vistani child, Arabelle", 
    startDate: new Date(735, 10, 3), 
    endDate: new Date(735, 10, 9), 
    active: true 
  },
  { 
    title: "Lady Wachter's Wish", 
    description: "Navigate the political intrigue of Vallaki", 
    startDate: new Date(735, 10, 4), 
    endDate: new Date(735, 10, 9), 
    active: true 
  },
  { 
    title: "The Strazni Siblings", 
    description: "Uncover the connection between Izek and Ireena", 
    startDate: new Date(735, 10, 4), 
    endDate: new Date(735, 10, 6), 
    active: true 
  },
  { 
    title: "The Lost Soul", 
    description: "Help Victor Vallakovich with a supernatural problem", 
    startDate: new Date(735, 10, 5), 
    endDate: new Date(735, 10, 7), 
    active: true 
  },
  { 
    title: "The Walls of Krezk", 
    description: "Gain entry to the walled town of Krezk", 
    startDate: new Date(735, 10, 3), 
    endDate: new Date(735, 10, 8), 
    active: true 
  },
  { 
    title: "The Stolen Gem", 
    description: "Recover the stolen gem for the Wizard of Wines winery", 
    startDate: new Date(735, 10, 9), 
    endDate: new Date(735, 10, 16), 
    active: true 
  },
  { 
    title: "The Fallen Abbey", 
    description: "Investigate the Abbey of Saint Markovia", 
    startDate: new Date(735, 10, 11), 
    endDate: new Date(735, 10, 16), 
    active: true 
  },
  { 
    title: "The Den of Wolves", 
    description: "Deal with the werewolf threat in the Svalich Woods", 
    startDate: new Date(735, 10, 12), 
    endDate: new Date(735, 10, 16), 
    active: true 
  },
  { 
    title: "Argynvost's Beacon", 
    description: "Restore hope to the land by lighting Argynvost's beacon", 
    startDate: new Date(735, 10, 9), 
    endDate: new Date(735, 10, 16), 
    active: true 
  },
  { 
    title: "Dinner with the Devil", 
    description: "Attend a dinner invitation from Strahd von Zarovich", 
    startDate: new Date(735, 10, 14), 
    endDate: new Date(735, 10, 14), 
    active: true 
  },
  { 
    title: "Ravenloft Heist", 
    description: "Infiltrate Castle Ravenloft to gather crucial items or information", 
    startDate: new Date(735, 10, 15), 
    endDate: new Date(735, 10, 15), 
    active: true 
  }
];

// ... (previous code, including events and initialQuests)

function App() {
  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        <BarovianCalendar events={events} initialQuests={initialQuests} />
      </div>
    </div>
  );
}

export default App;