const formatDueDate = (dateString: string | null) => {
  if (!dateString) return "No due date";
  
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Format the time
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Check if it's today or tomorrow
  if (date.toDateString() === today.toDateString()) {
    return `Today at ${timeString}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${timeString}`;
  } else {
    // Format the date
    const dateOptions: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    };
    return `${date.toLocaleDateString([], dateOptions)} at ${timeString}`;
  }
};

<div className="text-xs text-gray-500">
  {task.is_daily ? "Daily task" : formatDueDate(task.due_date)}
</div> 