 // Calendar generation
    const monthYear = document.getElementById('monthYear');
    const calendarBody = document.getElementById('calendarBody');
    let currentDate = new Date();

    function generateCalendar(date) {
      calendarBody.innerHTML = '';
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDay = firstDay.getDay();

      monthYear.textContent = date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

      let row = document.createElement('tr');
      for (let i = 0; i < startDay; i++) {
        row.appendChild(document.createElement('td'));
      }

      for (let d = 1; d <= lastDay.getDate(); d++) {
        const cell = document.createElement('td');
        cell.textContent = d;
        cell.onclick = () => selectDate(new Date(year, month, d), cell);
        row.appendChild(cell);
        if ((startDay + d) % 7 === 0) {
          calendarBody.appendChild(row);
          row = document.createElement('tr');
        }
      }
      calendarBody.appendChild(row);
    }

    document.getElementById('prevMonth').onclick = () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      generateCalendar(currentDate);
    };

    document.getElementById('nextMonth').onclick = () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      generateCalendar(currentDate);
    };

    let selectedDate = null;
    let selectedTime = null;
    const confirmText = document.getElementById('confirmText');

    function selectDate(date, cell) {
      document.querySelectorAll('.calendar td').forEach(td => td.classList.remove('selected'));
      cell.classList.add('selected');
      selectedDate = date.toDateString();
      updateConfirm();
    }

    function updateConfirm() {
      if (selectedDate && selectedTime) {
        confirmText.textContent = `Selected: ${selectedDate} at ${selectedTime}`;
      } else if (selectedDate) {
        confirmText.textContent = `Selected date: ${selectedDate}`;
      } else if (selectedTime) {
        confirmText.textContent = `Selected time: ${selectedTime}`;
      } else {
        confirmText.textContent = "No date/time selected yet";
      }
    }

    // Time slots generation
    const timeSlotsContainer = document.getElementById("timeSlots");
    const startHour = 9;
    const endHour = 18.5; // 6:30 PM
    const slotIncrement = 30; // minutes

    function formatTime(hour, minute) {
      const date = new Date();
      date.setHours(hour);
      date.setMinutes(minute);
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    for (let time = startHour * 60; time <= endHour * 60; time += slotIncrement) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeLabel = formatTime(hour, minute);
      const div = document.createElement("div");
      div.classList.add("time-slot");
      div.textContent = timeLabel;
      div.onclick = () => {
        document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("selected"));
        div.classList.add("selected");
        selectedTime = timeLabel;
        updateConfirm();
      };
      timeSlotsContainer.appendChild(div);
    }

    generateCalendar(currentDate);

    // Form submission
    document.getElementById("appointmentForm").addEventListener("submit", function(e) {
      e.preventDefault();
      if (!selectedDate || !selectedTime) {
        alert("Please select both a date and time before submitting.");
        return;
      }
      alert(`Appointment submitted!\n\nDate: ${selectedDate}\nTime: ${selectedTime}`);
      this.reset();
      confirmText.textContent = "No date/time selected yet";
      document.querySelectorAll(".time-slot").forEach(s => s.classList.remove("selected"));
      document.querySelectorAll(".calendar td").forEach(td => td.classList.remove("selected"));
      selectedDate = null;
      selectedTime = null;
    });