document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    events: '/api/agendamentos',
    dateClick: function (info) {
      const dataSelecionada = info.dateStr;
      const profissional = prompt('Digite o nome do profissional:');
      const horario = prompt('Digite o horário (ex: 14:00):');

      if (profissional && horario) {
        fetch('/api/agendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profissional,
            data: dataSelecionada,
            horario,
            paciente: 'Paciente Exemplo'
          })
        })
        .then(res => res.json())
        .then(data => {
          alert(data.mensagem);
          calendar.refetchEvents();
        });
      }
    }
  });

  calendar.render();
});
