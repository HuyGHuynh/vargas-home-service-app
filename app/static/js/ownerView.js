try {
      document.addEventListener("DOMContentLoaded", function () {
        const calendarEl = document.getElementById("calendar");

        // Example appointments (get rid for final)
        const appointments = [
          {
            name: "John Doe",
            service: "Plumbing",
            date: "2025-10-10",
            time: "09:30",
            email: "john@example.com",
            phone: "555-123-4567",
            jobType: "Repair",
            description: "Leaky faucet in kitchen",
          },
          {
            name: "Sarah Smith",
            service: "Electrician",
            date: "2025-10-11",
            time: "11:00",
            email: "sarah@example.com",
            phone: "555-987-6543",
            jobType: "Install",
            description: "Install new light fixture",
          },
          {
            name: "Mike Johnson",
            service: "General",
            date: "2025-10-12",
            time: "14:30",
            email: "mike@example.com",
            phone: "555-555-1212",
            jobType: "Quote",
            description: "Estimate for bathroom remodel",
          },
        ];

        const events = appointments.map((a) => ({
          title: `${a.name} - ${a.service}`,
          start: `${a.date}T${a.time}`,
          extendedProps: {
            email: a.email,
            phone: a.phone,
            description: a.description,
            jobType: a.jobType,
          },
        }));

        // Initialize FullCalendar
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          height: "auto",
          events: events,
          eventClick: function (info) {
            const e = info.event.extendedProps;
            alert(
              `Name: ${info.event.title}\n` +
                `Email: ${e.email}\n` +
                `Phone: ${e.phone}\n` +
                `Job Type: ${e.jobType}\n` +
                `Description: ${e.description}`
            );
          },
        });

        calendar.render();
      });
    } catch (error) {
      console.error(error);
      document.getElementById("errorBox").style.display = "block";
    }